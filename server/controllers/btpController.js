const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const path = require('path');
const fs = require('fs').promises;

const BTP_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'btp');

async function saveBtpFileLocally(base64Data, fileName) {
  if (!base64Data) return { publicUrl: null, storagePath: null };
  await fs.mkdir(BTP_UPLOAD_DIR, { recursive: true });
  
  const mimeMatch = base64Data.match(/^data:(.*?);base64,/);
  if (!mimeMatch) throw new Error('Invalid base64 data');
  
  const cleanBase64 = base64Data.replace(/^data:.*?;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  const uniqueName = `${uuidv4()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(BTP_UPLOAD_DIR, uniqueName);
  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/btp/${uniqueName}`;
  return { publicUrl, storagePath: filePath };
}

// ─── Project Endpoints ─────────────────────────────────────────

async function createProject(req, res) {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Project title is required' });

  const db = await getDb();
  try {
    const projectId = uuidv4();
    await db.run(
      'INSERT INTO btp_projects (id, title, owner_id) VALUES (?, ?, ?)',
      projectId, title, req.user.sub
    );
    // Add owner as a member
    await db.run(
      'INSERT INTO btp_members (project_id, user_id) VALUES (?, ?)',
      projectId, req.user.sub
    );
    
    res.json({ ok: true, projectId, message: 'BTP project registered successfully' });
  } catch (err) {
    console.error('Create BTP project error:', err);
    res.status(500).json({ error: 'Failed to create BTP project' });
  } finally {
    await db.close();
  }
}

async function getMyProjects(req, res) {
  const db = await getDb();
  try {
    const isSuperOrAdmin = req.user.role === 'super_admin' || req.user.role === 'admin';
    let projects;
    
    if (isSuperOrAdmin) {
      // Admins see all projects
      projects = await db.all(`
        SELECT p.*, u.name as owner_name 
        FROM btp_projects p
        JOIN users u ON p.owner_id = u.id
        ORDER BY p.created_at DESC
      `);
    } else {
      // Users see projects they are members of
      projects = await db.all(`
        SELECT p.*, u.name as owner_name 
        FROM btp_projects p
        JOIN btp_members m ON p.id = m.project_id
        JOIN users u ON p.owner_id = u.id
        WHERE m.user_id = ?
        ORDER BY p.created_at DESC
      `, req.user.sub);
    }
    res.json({ projects });
  } catch (err) {
    console.error('Get BTP projects error:', err);
    res.status(500).json({ error: 'Failed to fetch BTP projects' });
  } finally {
    await db.close();
  }
}

async function addMember(req, res) {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'User email is required' });

  const db = await getDb();
  try {
    // Check if requester is owner or admin
    const project = await db.get('SELECT owner_id FROM btp_projects WHERE id = ?', id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner_id !== req.user.sub && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the project owner can add members' });
    }

    const targetUser = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (!targetUser) return res.status(404).json({ error: 'User with this email not found' });

    const existing = await db.get('SELECT * FROM btp_members WHERE project_id = ? AND user_id = ?', id, targetUser.id);
    if (existing) return res.status(400).json({ error: 'User is already a member' });

    await db.run('INSERT INTO btp_members (project_id, user_id) VALUES (?, ?)', id, targetUser.id);
    res.json({ ok: true, message: 'Member added to project' });
  } catch (err) {
    console.error('Add BTP member error:', err);
    res.status(500).json({ error: 'Failed to add member' });
  } finally {
    await db.close();
  }
}

// ─── Report Endpoints ─────────────────────────────────────────

async function uploadReport(req, res) {
  const { id } = req.params;
  const { weekNumber, reportText, isPublic, fileName, fileData } = req.body;
  
  if (!weekNumber) return res.status(400).json({ error: 'Week number is required' });

  const db = await getDb();
  try {
    // Check if requester is a member
    const isMember = await db.get('SELECT * FROM btp_members WHERE project_id = ? AND user_id = ?', id, req.user.sub);
    if (!isMember && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    let publicUrl = null;
    if (fileData && fileName) {
      const saved = await saveBtpFileLocally(fileData, fileName);
      publicUrl = saved.publicUrl;
    }

    const reportId = uuidv4();
    await db.run(
      `INSERT INTO btp_reports (id, project_id, week_number, report_text, report_file_url, is_public, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      reportId, id, weekNumber, reportText || null, publicUrl, isPublic ? 1 : 0, req.user.sub
    );

    res.json({ ok: true, reportId, message: 'Weekly report submitted' });
  } catch (err) {
    console.error('Upload BTP report error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  } finally {
    await db.close();
  }
}

async function getProjectReports(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const isSuperOrAdmin = req.user.role === 'super_admin' || req.user.role === 'admin';
    const isMember = await db.get('SELECT * FROM btp_members WHERE project_id = ? AND user_id = ?', id, req.user.sub);
    
    let reports;
    if (isSuperOrAdmin || isMember) {
      // See all reports
      reports = await db.all(`
        SELECT r.*, u.name as uploader_name 
        FROM btp_reports r
        JOIN users u ON r.uploaded_by = u.id
        WHERE r.project_id = ?
        ORDER BY r.week_number ASC
      `, id);
    } else {
      // See only public reports
      reports = await db.all(`
        SELECT r.*, u.name as uploader_name 
        FROM btp_reports r
        JOIN users u ON r.uploaded_by = u.id
        WHERE r.project_id = ? AND r.is_public = 1
        ORDER BY r.week_number ASC
      `, id);
    }

    const members = await db.all(`
      SELECT u.id, u.name, u.email 
      FROM users u
      JOIN btp_members m ON u.id = m.user_id
      WHERE m.project_id = ?
    `, id);
    
    const project = await db.get('SELECT * FROM btp_projects WHERE id = ?', id);

    res.json({ project, reports, members });
  } catch (err) {
    console.error('Get BTP reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  } finally {
    await db.close();
  }
}

module.exports = {
  createProject,
  getMyProjects,
  addMember,
  uploadReport,
  getProjectReports
};
