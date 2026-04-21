import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Tabs, Tab, Button, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Card, CardMedia, CardContent, CardActions,
  Grid, Badge, Select, MenuItem, FormControl, InputLabel, Avatar
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, Check as ApproveIcon,
  Close as RejectIcon, PersonAdd as PromoteIcon, PersonRemove as DemoteIcon,
  PhotoLibrary as AlbumIcon, Refresh as RefreshIcon,
  AdminPanelSettings as RoleIcon, Shield as ShieldIcon,
  School as StudentIcon, SupervisorAccount as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import main_2 from '../../Photos/main_2.jpeg';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* ─── DESIGN TOKENS (Navy Theme) ─────────────────────────────────── */
const C = {
  white:    '#FFFFFF',
  navy:     '#0A2540',
  navyDark: '#061626',
  sky:      '#00B4D8',
  skyLight: '#E0F7FC',
  border:   '#E5E7EB',
  bg:       '#F8FAFC',
  ink:      '#111827',
  ink2:     '#374151',
  ink3:     '#6B7280',
  success:  '#059669',
  successBg:'#ECFDF5',
  warning:  '#D97706',
  warningBg:'#FFFBEB',
  error:    '#DC2626',
  errorBg:  '#FEF2F2',
};

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

/* ─── SHARED MICRO-COMPONENTS ───────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: sysFont,
    fontSize: '0.75rem', 
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: C.sky, 
    textTransform: 'uppercase',
    margin: '0 0 10px 0',
  }}>{children}</p>
);

const GlobalStyles = () => (
  <style>{`
    .vicas-admin-tab {
      font-family: ${sysFont} !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: 0.1em !important;
      text-transform: uppercase !important;
      color: ${C.ink3} !important;
      min-width: 160px !important;
      transition: all 0.2s !important;
    }
    .vicas-admin-tab.Mui-selected {
      color: ${C.navy} !important;
    }
    .MuiTabs-indicator {
      background-color: ${C.navy} !important;
      height: 3px !important;
    }

    .vicas-table-cell {
      padding: 20px 24px !important;
      border-bottom: 1px solid ${C.border} !important;
      font-family: ${sysFont} !important;
      color: ${C.ink2} !important;
      font-size: 0.9rem !important;
    }
    .vicas-table-head {
      font-family: ${sysFont} !important;
      font-size: 0.7rem !important;
      font-weight: 800 !important;
      letter-spacing: 0.1em !important;
      color: ${C.navy} !important;
      text-transform: uppercase !important;
      background: ${C.bg} !important;
      border-bottom: 2px solid ${C.border} !important;
    }

    .vicas-action-btn:hover { background: ${C.bg} !important; color: ${C.navy} !important; }

    .vicas-photo-card {
      border-radius: 12px;
      border: 1px solid ${C.border};
      overflow: hidden;
      background: ${C.white};
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .vicas-photo-card:hover {
      border-color: ${C.sky};
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(10, 37, 64, 0.1);
    }

    .vicas-user-row {
      transition: all 0.2s ease;
    }
    .vicas-user-row:hover {
      background: ${C.bg} !important;
    }

    @media (max-width: 768px) {
      .vicas-admin-grid { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

function AdminPanel() {
  const { isSuperAdmin } = useAuth();
  const [tab, setTab] = useState(0);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [editDialog, setEditDialog] = useState({ open: false, photo: null, title: '', description: '' });
  const [albumDialog, setAlbumDialog] = useState({ open: false, photoId: null });
  const [createAlbumDialog, setCreateAlbumDialog] = useState({ open: false, name: '', description: '' });
  const [roleDialog, setRoleDialog] = useState({ open: false, user: null, newRole: '' });

  const token = localStorage.getItem('accessToken');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? `${API_BASE}${url}` : url;
  };

  async function fetchPending() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/pending`, { headers, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPendingPhotos(data.photos || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function fetchAllPhotos() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/photos`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAllPhotos(data.photos || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function fetchUsers() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/users`, { headers, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function fetchAdminRequests() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/admin-requests`, { headers, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdminRequests(data.requests || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function fetchAlbums() {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/albums`);
      const data = await res.json();
      if (res.ok) setAlbums(data.albums || []);
    } catch (err) { /* ignore */ }
  }

  useEffect(() => {
    fetchAlbums();
    if (tab === 0) fetchPending();
    if (tab === 1) fetchAllPhotos();
    if (tab === 2 && isSuperAdmin) { fetchUsers(); fetchAdminRequests(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleApprove(id) {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/approve/${id}`, { method: 'POST', headers, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Photo approved');
      fetchPending();
    } catch (err) { setError(err.message); }
  }

  async function handleReject(id) {
    if (!window.confirm('Reject this photo? It will be permanently deleted.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/gallery/reject/${id}`, { method: 'POST', headers, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Photo rejected');
      fetchPending();
    } catch (err) { setError(err.message); }
  }

  async function handleDeletePhoto(id) {
    if (!window.confirm('Delete this photo permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/gallery/photos/${id}`, { method: 'DELETE', headers, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Photo deleted');
      fetchAllPhotos();
    } catch (err) { setError(err.message); }
  }

  async function handleUpdatePhoto() {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/photos/${editDialog.photo.id}`, {
        method: 'PUT', headers, credentials: 'include',
        body: JSON.stringify({ title: editDialog.title, description: editDialog.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Photo updated');
      setEditDialog({ open: false, photo: null, title: '', description: '' });
      fetchAllPhotos();
    } catch (err) { setError(err.message); }
  }

  async function handleAddToAlbum(albumId) {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/albums/${albumId}/photos`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ photoId: albumDialog.photoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Photo added to album');
      setAlbumDialog({ open: false, photoId: null });
    } catch (err) { setError(err.message); }
  }

  async function handleCreateAlbum() {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/albums`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ name: createAlbumDialog.name, description: createAlbumDialog.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Album created');
      setCreateAlbumDialog({ open: false, name: '', description: '' });
      fetchAlbums();
    } catch (err) { setError(err.message); }
  }

  async function handleUpdateRole(userId, newRole) {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/users/${userId}/role`, {
        method: 'PUT', headers, credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', user: 'Student' };
      setSuccess(`User role updated to ${roleLabels[newRole] || newRole}`);
      setRoleDialog({ open: false, user: null, newRole: '' });
      fetchUsers();
    } catch (err) { setError(err.message); }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/gallery/users/${userId}`, {
        method: 'DELETE', headers, credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('User deleted');
      fetchUsers();
    } catch (err) { setError(err.message); }
  }

  async function handleAdminRequest(requestId, action) {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/admin-requests/${requestId}`, {
        method: 'PUT', headers, credentials: 'include',
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Request ${action}d`);
      fetchAdminRequests();
      fetchUsers();
    } catch (err) { setError(err.message); }
  }

  const getRoleChip = (role) => {
    const config = {
      super_admin: { label: 'SUPER ADMIN', icon: <ShieldIcon sx={{ fontSize: 14 }} />, color: C.navy, bg: 'rgba(10, 37, 64, 0.1)', border: 'rgba(10, 37, 64, 0.2)' },
      admin: { label: 'ADMIN', icon: <AdminIcon sx={{ fontSize: 14 }} />, color: C.warning, bg: C.warningBg, border: 'rgba(217, 119, 6, 0.2)' },
      user: { label: 'STUDENT', icon: <StudentIcon sx={{ fontSize: 14 }} />, color: C.ink3, bg: C.bg, border: C.border },
    };
    const c = config[role] || config.user;
    return (
      <Chip
        icon={c.icon}
        label={c.label}
        sx={{
          color: c.color,
          bgcolor: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: '6px',
          fontWeight: 700,
          fontSize: '10px',
          letterSpacing: '0.05em',
          height: '28px',
          '& .MuiChip-icon': { color: c.color },
        }}
      />
    );
  };

  const pendingRequestCount = adminRequests.filter(r => r.status === 'pending').length;

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getInitialColor = (name) => {
    const colors = ['#0A2540', '#00B4D8', '#059669', '#D97706', '#7C3AED', '#DC2626'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '35vh', minHeight: '300px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_2})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.9)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '1000px' }}>
          <SectionLabel>Nexus</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#fff', margin: 0 }}>Management<br />Dashboard</h1>
        </div>
      </section>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px', fontWeight: 600 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '8px', fontWeight: 600 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        <Paper sx={{ mb: 6, borderRadius: 0, borderBottom: `1px solid ${C.border}`, boxShadow: 'none', background: 'transparent' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab className="vicas-admin-tab" label={
              <Badge badgeContent={pendingPhotos.length} color="error" max={99} sx={{ '& .MuiBadge-badge': { borderRadius: '4px', fontSize: '9px', fontWeight: 700 } }}>
                <span style={{ marginRight: pendingPhotos.length > 0 ? '12px' : 0 }}>Pending Approval</span>
              </Badge>
            } />
            <Tab className="vicas-admin-tab" label="Photo Management" />
            {isSuperAdmin && (
              <Tab className="vicas-admin-tab" label={
                <Badge badgeContent={pendingRequestCount} color="error" max={99} sx={{ '& .MuiBadge-badge': { borderRadius: '4px', fontSize: '9px', fontWeight: 700 } }}>
                  <span style={{ marginRight: pendingRequestCount > 0 ? '12px' : 0 }}>User Management</span>
                </Badge>
              } />
            )}
          </Tabs>
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={32} sx={{ color: C.navy }} />
          </Box>
        )}

        {/* ─── Tab 0: Pending Approval ─────────────────────────── */}
        {!loading && tab === 0 && (
          <Box>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <SectionLabel>Queue</SectionLabel>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.navy }}>Review Required ({pendingPhotos.length})</h2>
              </div>
              <IconButton onClick={fetchPending} sx={{ color: C.navy }}><RefreshIcon /></IconButton>
            </div>

            {pendingPhotos.length === 0 ? (
              <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '12px', border: `1px solid ${C.border}`, background: C.bg }}>
                <Typography sx={{ fontWeight: 600, color: C.ink3 }}>All pending items have been resolved.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {pendingPhotos.map((photo) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                    <div className="vicas-photo-card">
                      <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                        <img
                          src={getImageUrl(photo.image_url)}
                          alt={photo.title || 'Pending'}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontSize: '0.7rem', color: C.sky, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', margin: 0 }}>By {photo.uploader_name}</p>
                        <p style={{ fontWeight: 700, fontSize: '1rem', color: C.navy, margin: '6px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title || 'Untitled Record'}</p>
                      </div>
                      <div style={{ display: 'flex', padding: '0 12px 12px', gap: '8px' }}>
                        <Button
                          size="small"
                          fullWidth
                          startIcon={<ApproveIcon />}
                          onClick={() => handleApprove(photo.id)}
                          sx={{
                            fontWeight: 800, fontSize: '11px', borderRadius: '8px',
                            bgcolor: C.successBg, color: C.success, border: `1px solid rgba(5, 150, 105, 0.2)`,
                            '&:hover': { bgcolor: C.success, color: C.white },
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          fullWidth
                          startIcon={<RejectIcon />}
                          onClick={() => handleReject(photo.id)}
                          sx={{
                            fontWeight: 800, fontSize: '11px', borderRadius: '8px',
                            bgcolor: C.errorBg, color: C.error, border: `1px solid rgba(220, 38, 38, 0.2)`,
                            '&:hover': { bgcolor: C.error, color: C.white },
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* ─── Tab 1: Photo Management ───────────────────────── */}
        {!loading && tab === 1 && (
          <Box>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <SectionLabel>Inventory</SectionLabel>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.navy }}>Laboratory Gallery ({allPhotos.length})</h2>
              </div>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                   variant="outlined" 
                   size="small" 
                   onClick={() => setCreateAlbumDialog({ open: true, name: '', description: '' })} 
                   startIcon={<AlbumIcon />}
                   sx={{ borderRadius: '8px', borderColor: C.border, color: C.navy, fontSize: '10px', fontWeight: 700, '&:hover': { borderColor: C.sky, bgcolor: C.skyLight } }}
                >
                  New Album
                </Button>
                <IconButton onClick={fetchAllPhotos} sx={{ color: C.navy }}><RefreshIcon /></IconButton>
              </Box>
            </div>

            {allPhotos.length === 0 ? (
              <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '12px', border: `1px solid ${C.border}`, background: C.bg }}>
                <Typography sx={{ fontWeight: 600, color: C.ink3 }}>Gallery contains no active records.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2.5}>
                {allPhotos.map((photo) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={photo.id}>
                    <div className="vicas-photo-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
                        <img
                          src={getImageUrl(photo.image_url)}
                          alt="Archive"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        />
                      </div>
                      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: C.navy, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title || 'Untitled'}</p>
                      </div>
                      <div style={{ display: 'flex', padding: '0 8px 8px', justifyContent: 'space-between' }}>
                        <Tooltip title="Edit Metadata"><IconButton size="small" className="vicas-action-btn" onClick={() => setEditDialog({ open: true, photo, title: photo.title || '', description: photo.description || '' })}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Add to Album"><IconButton size="small" className="vicas-action-btn" onClick={() => { setAlbumDialog({ open: true, photoId: photo.id }); fetchAlbums(); }}><AlbumIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" className="vicas-action-btn" onClick={() => handleDeletePhoto(photo.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* ─── Tab 2: User Management (Super Admin only) ─────── */}
        {!loading && tab === 2 && isSuperAdmin && (
          <Box>
            {/* Admin Requests Section */}
            {adminRequests.filter(r => r.status === 'pending').length > 0 && (
              <Box sx={{ mb: 8 }}>
                <SectionLabel>Priority Actions</SectionLabel>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.navy, marginBottom: '24px' }}>Administrative Access Requests</h2>
                <TableContainer component={Paper} sx={{ borderRadius: '12px', border: `2px solid ${C.sky}`, boxShadow: 'none' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell className="vicas-table-head">Researcher</TableCell>
                        <TableCell className="vicas-table-head">Email</TableCell>
                        <TableCell className="vicas-table-head">Request Date</TableCell>
                        <TableCell className="vicas-table-head">Decision</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {adminRequests.filter(r => r.status === 'pending').map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="vicas-table-cell" sx={{ fontWeight: 700, color: C.navy }}>{req.user_name}</TableCell>
                          <TableCell className="vicas-table-cell" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>{req.user_email}</TableCell>
                          <TableCell className="vicas-table-cell">{new Date(req.created_at).toLocaleString()}</TableCell>
                          <TableCell className="vicas-table-cell">
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                onClick={() => handleAdminRequest(req.id, 'approve')}
                                sx={{
                                  fontWeight: 800, fontSize: '10px', borderRadius: '6px',
                                  bgcolor: C.successBg, color: C.success,
                                  '&:hover': { bgcolor: C.success, color: C.white },
                                }}
                              >APPROVE</Button>
                              <Button
                                size="small"
                                onClick={() => handleAdminRequest(req.id, 'reject')}
                                sx={{
                                  fontWeight: 800, fontSize: '10px', borderRadius: '6px',
                                  bgcolor: C.errorBg, color: C.error,
                                  '&:hover': { bgcolor: C.error, color: C.white },
                                }}
                              >REJECT</Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Users Table */}
            <div>
              <SectionLabel>Registry</SectionLabel>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.navy, marginBottom: '24px' }}>Authenticated Personnel ({users.length})</h2>
              <TableContainer component={Paper} sx={{ borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: 'none', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="vicas-table-head">User</TableCell>
                      <TableCell className="vicas-table-head">Email</TableCell>
                      <TableCell className="vicas-table-head">Privileges</TableCell>
                      <TableCell className="vicas-table-head">Joined</TableCell>
                      <TableCell className="vicas-table-head" align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="vicas-user-row">
                        <TableCell className="vicas-table-cell">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: getInitialColor(u.name), fontSize: '0.8rem', fontWeight: 800 }}>
                              {getUserInitials(u.name)}
                            </Avatar>
                            <span style={{ fontWeight: 700, color: C.navy }}>{u.name}</span>
                          </Box>
                        </TableCell>
                        <TableCell className="vicas-table-cell" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>{u.email}</TableCell>
                        <TableCell className="vicas-table-cell">{getRoleChip(u.role)}</TableCell>
                        <TableCell className="vicas-table-cell">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="vicas-table-cell" align="right">
                          {u.role !== 'super_admin' ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Tooltip title="Change Role">
                                <IconButton
                                  size="small"
                                  className="vicas-action-btn"
                                  onClick={() => setRoleDialog({ open: true, user: u, newRole: u.role })}
                                  sx={{
                                    bgcolor: 'rgba(0, 180, 216, 0.08)',
                                    border: `1px solid rgba(0, 180, 216, 0.15)`,
                                    '&:hover': { bgcolor: C.skyLight, borderColor: C.sky },
                                  }}
                                >
                                  <RoleIcon fontSize="small" sx={{ color: C.sky }} />
                                </IconButton>
                              </Tooltip>
                              {u.role === 'admin' && (
                                <Tooltip title="Revoke Admin Access">
                                  <IconButton
                                    size="small"
                                    className="vicas-action-btn"
                                    onClick={() => handleUpdateRole(u.id, 'user')}
                                    sx={{
                                      bgcolor: 'rgba(217, 119, 6, 0.08)',
                                      border: `1px solid rgba(217, 119, 6, 0.15)`,
                                      '&:hover': { bgcolor: C.warningBg, borderColor: C.warning },
                                    }}
                                  >
                                    <DemoteIcon fontSize="small" sx={{ color: C.warning }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete Personnel">
                                <IconButton
                                  size="small"
                                  className="vicas-action-btn"
                                  onClick={() => handleDeleteUser(u.id)}
                                  sx={{
                                    bgcolor: 'rgba(220, 38, 38, 0.06)',
                                    border: `1px solid rgba(220, 38, 38, 0.12)`,
                                    '&:hover': { bgcolor: C.errorBg, borderColor: C.error },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ color: C.error }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Chip
                              icon={<ShieldIcon sx={{ fontSize: 12 }} />}
                              label="PROTECTED"
                              sx={{
                                color: C.ink3, bgcolor: C.bg, border: `1px solid ${C.border}`,
                                borderRadius: '6px', fontWeight: 700, fontSize: '9px',
                                letterSpacing: '0.05em', height: '24px',
                                '& .MuiChip-icon': { color: C.ink3 },
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Box>
        )}
      </Container>

      {/* ─── Role Change Dialog ─────────────────────────────────── */}
      <Dialog
        open={roleDialog.open}
        onClose={() => setRoleDialog({ open: false, user: null, newRole: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        <Box sx={{ bgcolor: C.navy, color: C.white, p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 48, height: 48 }}>
            <RoleIcon />
          </Avatar>
          <div>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Change User Role</Typography>
            <Typography sx={{ fontSize: '0.8rem', opacity: 0.7 }}>{roleDialog.user?.name}</Typography>
          </div>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          {roleDialog.user && (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: C.bg, borderRadius: '10px', border: `1px solid ${C.border}` }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.ink3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
                  Current Role
                </Typography>
                <Box sx={{ mt: 1 }}>{getRoleChip(roleDialog.user.role)}</Box>
              </Box>

              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 700 }}>New Role</InputLabel>
                <Select
                  value={roleDialog.newRole}
                  onChange={(e) => setRoleDialog({ ...roleDialog, newRole: e.target.value })}
                  label="New Role"
                  sx={{ borderRadius: '10px', fontWeight: 600 }}
                >
                  <MenuItem value="user">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <StudentIcon sx={{ color: C.ink3, fontSize: 20 }} />
                      <div>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Student</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: C.ink3 }}>Can view & upload photos for approval</Typography>
                      </div>
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AdminIcon sx={{ color: C.warning, fontSize: 20 }} />
                      <div>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Admin</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: C.ink3 }}>Can approve photos & manage gallery</Typography>
                      </div>
                    </Box>
                  </MenuItem>
                  <MenuItem value="super_admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ShieldIcon sx={{ color: C.navy, fontSize: 20 }} />
                      <div>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Super Admin</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: C.ink3 }}>Full system access & user management</Typography>
                      </div>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {roleDialog.newRole === 'super_admin' && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px', fontSize: '0.8rem' }}>
                  This will grant full system administration privileges, including the ability to manage other users.
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setRoleDialog({ open: false, user: null, newRole: '' })} sx={{ color: C.ink3, fontWeight: 700, borderRadius: '8px' }}>Cancel</Button>
          <Button
            onClick={() => handleUpdateRole(roleDialog.user.id, roleDialog.newRole)}
            variant="contained"
            disabled={roleDialog.newRole === roleDialog.user?.role}
            sx={{ bgcolor: C.navy, borderRadius: '8px', fontWeight: 700, px: 4, '&:hover': { bgcolor: C.navyDark }, '&:disabled': { bgcolor: C.border } }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Photo Modal */}
      <Dialog 
         open={editDialog.open} 
         onClose={() => setEditDialog({ open: false, photo: null, title: '', description: '' })} 
         maxWidth="sm" fullWidth
         PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: C.navy, borderBottom: `1px solid ${C.border}` }}>Edit Archive Metadata</DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          {editDialog.photo && <img src={getImageUrl(editDialog.photo.image_url)} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', marginBottom: '24px', borderRadius: '8px', border: `1px solid ${C.border}` }} />}
          <TextField fullWidth label="Photo Title" value={editDialog.title} onChange={(e) => setEditDialog({ ...editDialog, title: e.target.value })} sx={{ mb: 4 }} />
          <TextField fullWidth label="Visual Description" value={editDialog.description} onChange={(e) => setEditDialog({ ...editDialog, description: e.target.value })} multiline rows={3} />
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button onClick={() => setEditDialog({ open: false, photo: null, title: '', description: '' })} sx={{ color: C.ink3, fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleUpdatePhoto} variant="contained" sx={{ bgcolor: C.navy, borderRadius: '8px', fontWeight: 700, '&:hover': { bgcolor: C.navyDark } }}>Commit Changes</Button>
        </DialogActions>
      </Dialog>
      
      {/* Collection Modal */}
      <Dialog 
         open={albumDialog.open} 
         onClose={() => setAlbumDialog({ open: false, photoId: null })} 
         maxWidth="xs" fullWidth
         PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: C.navy, borderBottom: `1px solid ${C.border}` }}>Add to Collection</DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          {albums.length === 0 ? (
            <Typography sx={{ py: 2, color: C.ink3, textAlign: 'center' }}>No active collections available.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {albums.map((album) => (
                <Button
                  key={album.id}
                  variant="outlined"
                  onClick={() => handleAddToAlbum(album.id)}
                  sx={{
                    justifyContent: 'flex-start', textAlign: 'left', borderRadius: '10px',
                    borderColor: C.border, color: C.navy, textTransform: 'none', py: 1.5,
                    '&:hover': { borderColor: C.sky, bgcolor: C.skyLight },
                  }}
                >
                  <AlbumIcon sx={{ mr: 2, fontSize: 20, color: C.sky }} />
                  <div>
                     <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>{album.name}</p>
                     <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: C.ink3 }}>{album.photo_count} records in catalog</p>
                  </div>
                </Button>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={() => setAlbumDialog({ open: false, photoId: null })} sx={{ color: C.ink3, fontWeight: 700 }}>Finish</Button>
        </DialogActions>
      </Dialog>

      {/* New Album Modal */}
      <Dialog 
         open={createAlbumDialog.open} 
         onClose={() => setCreateAlbumDialog({ open: false, name: '', description: '' })} 
         maxWidth="sm" fullWidth
         PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: C.navy, borderBottom: `1px solid ${C.border}` }}>Create New Collection</DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <TextField fullWidth label="Collection Name" value={createAlbumDialog.name} onChange={(e) => setCreateAlbumDialog({ ...createAlbumDialog, name: e.target.value })} required sx={{ mb: 4 }} />
          <TextField fullWidth label="Description" value={createAlbumDialog.description} onChange={(e) => setCreateAlbumDialog({ ...createAlbumDialog, description: e.target.value })} multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button onClick={() => setCreateAlbumDialog({ open: false, name: '', description: '' })} sx={{ color: C.ink3, fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleCreateAlbum} variant="contained" disabled={!createAlbumDialog.name} sx={{ bgcolor: C.navy, borderRadius: '8px', fontWeight: 700, '&:hover': { bgcolor: C.navyDark } }}>Create Collection</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default AdminPanel;
