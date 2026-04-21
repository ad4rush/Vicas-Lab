import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Button, TextField, Grid,
  List, ListItem, ListItemText, ListItemIcon, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  CircularProgress, IconButton, Avatar
} from '@mui/material';
import {
  Assignment as ProjectIcon, Add as AddIcon, PersonAdd as MemberIcon,
  UploadFile as UploadIcon, CalendarToday as WeekIcon,
  CheckCircle as SuccessIcon, Description as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import main_2 from '../../Photos/main_2.jpeg';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* ─── DESIGN TOKENS (Navy Theme) ─────────────────────────────────── */
const C = {
  white: '#FFFFFF',
  navy: '#0A2540',
  navyDark: '#061626',
  sky: '#00B4D8',
  skyLight: '#E0F7FC',
  border: '#E5E7EB',
  bg: '#F8FAFC',
  ink: '#111827',
  ink2: '#374151',
  ink3: '#6B7280',
  success: '#059669',
  successBg: '#ECFDF5',
  error: '#DC2626',
  errorBg: '#FEF2F2',
};

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: sysFont, fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.15em', color: C.sky, textTransform: 'uppercase',
    margin: '0 0 10px 0',
  }}>{children}</p>
);

export default function BTPPortal() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectData, setProjectData] = useState({ reports: [], members: [] });
  const [activeWeek, setActiveWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [createDialog, setCreateDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  
  const [memberDialog, setMemberDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const [reportText, setReportText] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.id);
    }
  }, [selectedProject]);

  const token = localStorage.getItem('accessToken');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/btp/my-projects`, { headers });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjectDetails(id) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/btp/${id}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setProjectData({ reports: data.reports || [], members: data.members || [] });
        if (!activeWeek) setActiveWeek(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject() {
    try {
      const res = await fetch(`${API_BASE}/api/btp/register`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: newProjectTitle })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreateDialog(false);
      setNewProjectTitle('');
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddMember() {
    try {
      const res = await fetch(`${API_BASE}/api/btp/${selectedProject.id}/members`, {
        method: 'POST', headers,
        body: JSON.stringify({ email: newMemberEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMemberDialog(false);
      setNewMemberEmail('');
      fetchProjectDetails(selectedProject.id);
    } catch (err) {
      setError(err.message);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReportFile({ name: file.name, data: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmitReport() {
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/btp/${selectedProject.id}/reports`, {
        method: 'POST', headers,
        body: JSON.stringify({
          weekNumber: activeWeek,
          reportText,
          isPublic: false,
          fileName: reportFile?.name,
          fileData: reportFile?.data
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportText('');
      setReportFile(null);
      fetchProjectDetails(selectedProject.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const weeks = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div style={{ fontFamily: sysFont, background: C.bg, minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero */}
      <section style={{ position: 'relative', height: '30vh', minHeight: '250px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_2})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.9)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '1000px' }}>
          <SectionLabel>Academic Portal</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', margin: 0 }}>BTP Progress<br />Tracking</h1>
        </div>
      </section>

      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 10 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

        <Grid container spacing={4}>
          {/* LEFT SIDEBAR: Projects */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Button
                fullWidth variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialog(true)}
                sx={{ mb: 3, bgcolor: C.navy, fontWeight: 700, borderRadius: '8px', py: 1.5, '&:hover': { bgcolor: C.navyDark } }}
              >
                Register Project
              </Button>
              <Typography sx={{ fontWeight: 800, color: C.ink3, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                My Projects
              </Typography>
              {loading && !projects.length ? <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 4 }} /> : null}
              <List sx={{ p: 0 }}>
                {projects.map(p => (
                  <ListItem 
                    key={p.id} 
                    button 
                    onClick={() => setSelectedProject(p)}
                    sx={{ 
                      borderRadius: '8px', mb: 1, 
                      bgcolor: selectedProject?.id === p.id ? C.skyLight : 'transparent',
                      border: `1px solid ${selectedProject?.id === p.id ? C.sky : 'transparent'}`,
                      '&:hover': { bgcolor: selectedProject?.id === p.id ? C.skyLight : C.bg }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: selectedProject?.id === p.id ? C.sky : C.ink3 }}>
                      <ProjectIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={p.title} 
                      primaryTypographyProps={{ fontWeight: selectedProject?.id === p.id ? 800 : 600, fontSize: '0.9rem', color: C.navy }}
                    />
                  </ListItem>
                ))}
                {!loading && projects.length === 0 && (
                  <Typography sx={{ color: C.ink3, fontSize: '0.85rem', textAlign: 'center', py: 2 }}>No active projects.</Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* MAIN CONTENT AREA */}
          <Grid item xs={12} md={9}>
            {!selectedProject ? (
              <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '16px', border: `1px dashed ${C.border}`, bgcolor: 'transparent', boxShadow: 'none' }}>
                <ProjectIcon sx={{ fontSize: 64, color: C.border, mb: 2 }} />
                <Typography sx={{ fontWeight: 700, color: C.ink3, fontSize: '1.2rem' }}>Select or register a BTP project</Typography>
                <Typography sx={{ color: C.ink3, mt: 1 }}>Track weekly progress, upload reports, and collaborate.</Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {/* Project Header */}
                <Box sx={{ p: 4, bgcolor: C.white, borderBottom: `1px solid ${C.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <SectionLabel>Project Workspace</SectionLabel>
                      <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: C.navy }}>{selectedProject.title}</Typography>
                      <Typography sx={{ color: C.ink3, fontSize: '0.9rem', mt: 0.5 }}>Owner: {selectedProject.owner_name}</Typography>
                    </div>
                    <Button 
                      variant="outlined" size="small" 
                      startIcon={<MemberIcon />}
                      onClick={() => setMemberDialog(true)}
                      sx={{ borderRadius: '8px', borderColor: C.border, color: C.navy, fontWeight: 700 }}
                    >
                      Add Member
                    </Button>
                  </Box>
                  {/* Members List */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {projectData.members.map(m => (
                      <Chip 
                        key={m.id} 
                        avatar={<Avatar sx={{ bgcolor: C.navy, fontSize: '0.7rem' }}>{m.name[0]}</Avatar>} 
                        label={m.name} 
                        size="small" 
                        sx={{ bgcolor: C.bg, border: `1px solid ${C.border}`, fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Box>

                <Grid container>
                  {/* Weeks Sidebar */}
                  <Grid item xs={12} sm={3} sx={{ borderRight: `1px solid ${C.border}`, bgcolor: C.bg, maxHeight: '600px', overflowY: 'auto' }}>
                    <List sx={{ p: 2 }}>
                      {weeks.map(w => {
                        const hasReport = projectData.reports.some(r => r.week_number === w);
                        const isActive = activeWeek === w;
                        return (
                          <ListItem 
                            key={w} button 
                            onClick={() => setActiveWeek(w)}
                            sx={{
                              borderRadius: '8px', mb: 0.5,
                              bgcolor: isActive ? C.white : 'transparent',
                              border: `1px solid ${isActive ? C.border : 'transparent'}`,
                              boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                              '&:hover': { bgcolor: isActive ? C.white : 'rgba(0,0,0,0.02)' }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32, color: hasReport ? C.success : C.ink3 }}>
                              {hasReport ? <SuccessIcon fontSize="small" /> : <WeekIcon fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText 
                              primary={`Week ${w}`} 
                              primaryTypographyProps={{ fontWeight: isActive ? 800 : 600, color: isActive ? C.navy : C.ink2, fontSize: '0.9rem' }} 
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Grid>

                  {/* Week Content */}
                  <Grid item xs={12} sm={9} sx={{ p: 4, bgcolor: C.white, minHeight: '500px' }}>
                    {activeWeek ? (
                      <Box>
                        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, mb: 3 }}>
                          Week {activeWeek} Report
                        </Typography>
                        
                        {(() => {
                          const existingReport = projectData.reports.find(r => r.week_number === activeWeek);
                          
                          if (existingReport) {
                            return (
                              <Box sx={{ p: 3, bgcolor: C.bg, borderRadius: '12px', border: `1px solid ${C.border}` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: C.sky, fontSize: '0.8rem', fontWeight: 800 }}>{existingReport.uploader_name?.[0]}</Avatar>
                                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.navy }}>Submitted by {existingReport.uploader_name}</Typography>
                                  <Typography sx={{ fontSize: '0.8rem', color: C.ink3, ml: 'auto' }}>{new Date(existingReport.uploaded_at).toLocaleDateString()}</Typography>
                                </Box>
                                {existingReport.report_text && (
                                  <Typography sx={{ color: C.ink2, whiteSpace: 'pre-wrap', mb: 3, fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    {existingReport.report_text}
                                  </Typography>
                                )}
                                {existingReport.report_file_url && (
                                  <Button 
                                    variant="outlined" 
                                    href={`${API_BASE}${existingReport.report_file_url}`} 
                                    target="_blank"
                                    startIcon={<ReportIcon />}
                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, color: C.navy, borderColor: C.border }}
                                  >
                                    View Attached Document
                                  </Button>
                                )}
                              </Box>
                            );
                          }

                          return (
                            <Box sx={{ mt: 2 }}>
                              <TextField
                                fullWidth
                                multiline
                                rows={6}
                                placeholder="Describe the progress made this week..."
                                value={reportText}
                                onChange={e => setReportText(e.target.value)}
                                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Button
                                  variant="outlined"
                                  component="label"
                                  startIcon={<UploadIcon />}
                                  sx={{ borderRadius: '8px', color: C.navy, borderColor: C.border, fontWeight: 700, '&:hover': { bgcolor: C.bg } }}
                                >
                                  Attach File
                                  <input type="file" hidden onChange={handleFileChange} />
                                </Button>
                                {reportFile && (
                                  <Typography sx={{ fontSize: '0.85rem', color: C.ink2, fontWeight: 600 }}>
                                    {reportFile.name}
                                  </Typography>
                                )}
                              </Box>
                              <Button
                                variant="contained"
                                onClick={handleSubmitReport}
                                disabled={uploading || (!reportText && !reportFile)}
                                sx={{ bgcolor: C.navy, borderRadius: '8px', fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: C.navyDark } }}
                              >
                                {uploading ? 'Submitting...' : 'Submit Weekly Report'}
                              </Button>
                            </Box>
                          );
                        })()}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: C.ink3, fontWeight: 600 }}>Select a week to view or submit progress.</Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Create Project Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: '400px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: C.navy, borderBottom: `1px solid ${C.border}` }}>Register New BTP</DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <TextField
            autoFocus fullWidth
            label="Project Title"
            value={newProjectTitle}
            onChange={e => setNewProjectTitle(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCreateDialog(false)} sx={{ color: C.ink3, fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" disabled={!newProjectTitle} sx={{ bgcolor: C.navy, borderRadius: '8px', fontWeight: 700, '&:hover': { bgcolor: C.navyDark } }}>Register</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={memberDialog} onClose={() => setMemberDialog(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: '400px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: C.navy, borderBottom: `1px solid ${C.border}` }}>Add Project Member</DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Typography sx={{ fontSize: '0.85rem', color: C.ink3, mb: 3 }}>
            Enter the registered email address of the student or advisor you want to invite.
          </Typography>
          <TextField
            autoFocus fullWidth
            label="Email Address"
            type="email"
            value={newMemberEmail}
            onChange={e => setNewMemberEmail(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setMemberDialog(false)} sx={{ color: C.ink3, fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={!newMemberEmail} sx={{ bgcolor: C.navy, borderRadius: '8px', fontWeight: 700, '&:hover': { bgcolor: C.navyDark } }}>Add Member</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
