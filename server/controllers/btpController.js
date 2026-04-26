const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const path = require('path');
const fs = require('fs').promises;

const BTP_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'btp');
const transporter = require('../utils/email');

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
    const project = await db.get('SELECT owner_id, title FROM btp_projects WHERE id = ?', id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner_id !== req.user.sub && req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the project owner can add members' });
    }

    const targetUser = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (!targetUser) {
      // User not registered, create an invite and send email
      const token = uuidv4();
      await db.run('INSERT INTO btp_invites (token, project_id, email, inviter_id) VALUES (?, ?, ?, ?)', token, id, email, req.user.sub);
      
      const inviter = await db.get('SELECT name FROM users WHERE id = ?', req.user.sub);
      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;
      
      const mailOptions = {
        from: process.env.SMTP_FROM || '"VICAS Lab" <noreply@vicaslab.com>',
        to: email,
        subject: `Invitation to join BTP Project: "${project.title}"`,
        text: `Hello,\n\n${inviter.name} is sending you a request to join the BTP project "${project.title}".\n\nPlease join by clicking this link:\n${inviteUrl}\n\nBest,\nVICAS Lab`
      };
      
      try {
        await transporter.sendMail(mailOptions);
        return res.json({ ok: true, message: 'Invite sent to unregistered user.' });
      } catch (mailErr) {
        console.error('Failed to send invite email:', mailErr);
        return res.json({ ok: true, message: 'User invited, but the email failed to send. They can join via the invite link manually if needed.' });
      }
    }

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

async function acceptInvite(req, res) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Invite token is required' });

  const db = await getDb();
  try {
    const invite = await db.get('SELECT * FROM btp_invites WHERE token = ?', token);
    if (!invite) return res.status(404).json({ error: 'Invalid or expired invite token' });

    // Verify the logged in user matches the invite email
    const user = await db.get('SELECT id, email FROM users WHERE id = ?', req.user.sub);
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return res.status(403).json({ error: 'This invite was sent to a different email address' });
    }

    // Check if already a member
    const existing = await db.get('SELECT * FROM btp_members WHERE project_id = ? AND user_id = ?', invite.project_id, user.id);
    if (!existing) {
      await db.run('INSERT INTO btp_members (project_id, user_id) VALUES (?, ?)', invite.project_id, user.id);
    }

    // Remove the invite
    await db.run('DELETE FROM btp_invites WHERE token = ?', token);

    res.json({ ok: true, message: 'Successfully joined the project' });
  } catch (err) {
    console.error('Accept BTP invite error:', err);
    res.status(500).json({ error: 'Failed to accept invite' });
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

async function toggleProjectPrivacy(req, res) {
  const { id } = req.params;
  const { is_public } = req.body;
  const db = await getDb();
  try {
    const project = await db.get('SELECT owner_id FROM btp_projects WHERE id = ?', id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.owner_id !== req.user.sub && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only the project owner or a superadmin can toggle privacy' });
    }

    await db.run('UPDATE btp_projects SET is_public = ? WHERE id = ?', is_public ? 1 : 0, id);
    res.json({ ok: true, message: 'Project privacy updated' });
  } catch (err) {
    console.error('Toggle project privacy error:', err);
    res.status(500).json({ error: 'Failed to update project privacy' });
  } finally {
    await db.close();
  }
}

async function getProjectComments(req, res) {
  const { id } = req.params;
  const { week } = req.query;
  const user = req.user;
  
  if (!week) return res.status(400).json({ error: 'week query parameter is required' });

  const db = await getDb();
  try {
    const project = await db.get('SELECT id, is_public FROM btp_projects WHERE id = ?', id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (!project.is_public && user.role !== 'super_admin') {
      const isMember = await db.get('SELECT 1 FROM btp_members WHERE project_id = ? AND user_id = ?', id, user.sub);
      if (!isMember) {
        return res.status(403).json({ error: 'Not authorized to view comments for this project' });
      }
    }

    const comments = await db.all(
      `SELECT id, user_id, user_name, comment_text, created_at 
       FROM btp_comments 
       WHERE project_id = ? AND week_number = ? 
       ORDER BY created_at ASC`,
      id, week
    );

    res.json({ comments });
  } catch (err) {
    console.error('Get project comments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  } finally {
    await db.close();
  }
}

async function addProjectComment(req, res) {
  const { id } = req.params;
  const { week_number, comment_text } = req.body;
  const user = req.user;

  if (!week_number || !comment_text) {
    return res.status(400).json({ error: 'week_number and comment_text are required' });
  }

  const db = await getDb();
  try {
    const project = await db.get('SELECT id, is_public FROM btp_projects WHERE id = ?', id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (!project.is_public && user.role !== 'super_admin') {
      const isMember = await db.get('SELECT 1 FROM btp_members WHERE project_id = ? AND user_id = ?', id, user.sub);
      if (!isMember) {
        return res.status(403).json({ error: 'Not authorized to comment on this project' });
      }
    }

    const commentId = uuidv4();
    await db.run(
      `INSERT INTO btp_comments (id, project_id, week_number, user_id, user_name, comment_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      commentId, id, week_number, user.sub, user.name, comment_text
    );

    res.json({ ok: true, message: 'Comment added successfully', commentId });
  } catch (err) {
    console.error('Add project comment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  } finally {
    await db.close();
  }
}

module.exports = {
  createProject,
  getMyProjects,
  addMember,
  acceptInvite,
  uploadReport,
  getProjectReports,
  toggleProjectPrivacy,
  getProjectComments,
  addProjectComment
};
