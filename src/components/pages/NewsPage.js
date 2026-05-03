import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, CircularProgress,
  IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import main_3 from '../../Photos/main_3.jpeg';

const C = {
  white: '#FFFFFF', navy: '#0A2540', navyDark: '#061626', sky: '#00B4D8',
  border: '#E5E7EB', bg: '#F8FAFC', ink: '#111827', ink2: '#374151', ink3: '#6B7280',
  danger: '#DC2626', dangerBg: '#FEF2F2',
};
const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

const SectionLabel = ({ children }) => (
  <p style={{ fontFamily: sysFont, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', color: C.sky, textTransform: 'uppercase', margin: '0 0 10px 0' }}>{children}</p>
);
const SectionTitle = ({ children, style = {} }) => (
  <h2 style={{ fontFamily: sysFont, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: C.navy, lineHeight: 1.15, margin: 0, ...style }}>{children}</h2>
);

const GlobalStyles = () => (
  <style>{`
    .vicas-news-item {
      padding: 48px 0; border-bottom: 1px solid ${C.border};
      display: grid; grid-template-columns: 200px 1fr; gap: 48px;
      transition: all 0.25s ease; cursor: default; position: relative;
    }
    .vicas-news-item:hover { background: ${C.bg}; padding-left: 24px; }
    .vicas-news-item:last-child { border-bottom: none; }
    .vicas-news-item .admin-actions { position: absolute; top: 48px; right: 0; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
    .vicas-news-item:hover .admin-actions { opacity: 1; }
    @media (max-width: 768px) { .vicas-news-item { grid-template-columns: 1fr !important; gap: 16px; } }
  `}</style>
);

const NewsPage = () => {
  const { isAdmin } = useAuth();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNews = async () => {
    try {
      const [newsRes, achRes] = await Promise.all([
        fetch(`${API_BASE}/api/content/news`),
        fetch(`${API_BASE}/api/content/achievement`)
      ]);
      const newsData = await newsRes.json();
      const achData = await achRes.json();
      let combined = [];
      if (newsRes.ok && newsData.items) combined = [...combined, ...newsData.items];
      if (achRes.ok && achData.items) combined = [...combined, ...achData.items];
      combined.sort((a, b) => {
        const aMeta = a.metadata ? JSON.parse(a.metadata) : {};
        const bMeta = b.metadata ? JSON.parse(b.metadata) : {};
        return new Date(bMeta.date || b.created_at) - new Date(aMeta.date || a.created_at);
      });
      setNewsItems(combined);
    } catch (err) { console.error("Failed to fetch news", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  const groupedNews = React.useMemo(() => {
    const groups = {};
    newsItems.forEach(item => {
      const meta = item.metadata ? JSON.parse(item.metadata) : {};
      const d = new Date(meta.date || item.created_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = { key, label, items: [] };
      groups[key].items.push(item);
    });
    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [newsItems]);

  // ─── Edit ────────────────────────────────────────────────────
  const openEdit = (item) => {
    const meta = item.metadata ? JSON.parse(item.metadata) : {};
    setEditItem(item);
    setEditForm({
      title: item.title || '', description: item.description || '',
      date: meta.date || '', tag: meta.tag || '',
      awardedTo: meta.awardedTo || '', awardedBy: meta.awardedBy || '',
      externalLink: meta.externalLink || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    const token = localStorage.getItem('accessToken');
    try {
      const metadata = {
        ...(editItem.metadata ? JSON.parse(editItem.metadata) : {}),
        date: editForm.date, tag: editForm.tag,
        awardedTo: editForm.awardedTo, awardedBy: editForm.awardedBy,
        externalLink: editForm.externalLink,
      };
      const res = await fetch(`${API_BASE}/api/content/${editItem.id}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editForm.title, description: editForm.description, metadata }),
      });
      if (res.ok) { setEditDialogOpen(false); await fetchNews(); }
    } catch (err) { console.error('Edit failed:', err); }
    finally { setSaving(false); }
  };

  // ─── Delete ──────────────────────────────────────────────────
  const openDelete = (item) => { setDeleteTarget(item); setDeleteDialogOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_BASE}/api/content/${deleteTarget.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { setDeleteDialogOpen(false); await fetchNews(); }
    } catch (err) { console.error('Delete failed:', err); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '45vh', minHeight: '350px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_3})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.85)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
          <SectionLabel>Timeline & Progress</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>News &<br />Achievements</h1>
        </div>
      </section>

      {/* News Archive */}
      <section style={{ padding: '100px 0' }}>
        <Container maxWidth="lg">
          <div style={{ marginBottom: '64px' }}><SectionLabel>Archive</SectionLabel><SectionTitle>Record of Updates</SectionTitle></div>
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: C.navy }} /></Box>
            ) : groupedNews.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}><Typography sx={{ color: C.ink3, fontWeight: 600 }}>No recent news updates.</Typography></Box>
            ) : groupedNews.map(group => (
              <div key={group.key}>
                <div style={{ position: 'sticky', top: '60px', zIndex: 10, background: C.white, padding: '16px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', marginTop: '-1px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: 0 }}>{group.label}</h3>
                </div>
                {group.items.map((item, index) => {
                  const meta = item.metadata ? JSON.parse(item.metadata) : {};
                  return (
                    <div key={item.id || index} className="vicas-news-item">
                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="admin-actions">
                          <IconButton size="small" onClick={() => openEdit(item)} sx={{ bgcolor: C.bg, border: `1px solid ${C.border}`, '&:hover': { bgcolor: '#E0F7FC', borderColor: C.sky } }}><EditIcon sx={{ fontSize: 16, color: C.navy }} /></IconButton>
                          <IconButton size="small" onClick={() => openDelete(item)} sx={{ bgcolor: C.dangerBg, border: '1px solid #FECACA', '&:hover': { bgcolor: '#FEE2E2', borderColor: C.danger } }}><DeleteIcon sx={{ fontSize: 16, color: C.danger }} /></IconButton>
                        </div>
                      )}
                      <div style={{ paddingTop: '6px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: C.navy, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>{meta.date || new Date(item.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        {meta.tag && <span style={{ display: 'inline-block', marginBottom: '8px', fontSize: '10px', fontWeight: 800, backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.sky, padding: '4px 12px', borderRadius: '4px', textTransform: 'uppercase' }}>{meta.tag}</span>}
                        <br />
                        <span style={{ display: 'inline-block', marginTop: meta.tag ? '6px' : 0, fontSize: '9px', fontWeight: 800, color: item.type === 'achievement' ? '#7C3AED' : C.ink3, background: item.type === 'achievement' ? '#F5F3FF' : C.bg, border: `1px solid ${item.type === 'achievement' ? '#C4B5FD' : C.border}`, padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {item.type === 'achievement' ? '🏆 Achievement' : '📰 News'}
                        </span>
                      </div>
                      <div>
                        {item.image_url && (<div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', maxWidth: '400px' }}><img src={item.image_url.startsWith('/') ? `${API_BASE}${item.image_url}` : item.image_url} alt={item.title} style={{ width: '100%', height: 'auto', display: 'block' }} /></div>)}
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy, lineHeight: 1.3, margin: '0 0 16px 0' }}>{item.title}</h3>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: C.ink2, margin: 0, maxWidth: '760px' }}>{item.description}</p>
                        {item.type === 'achievement' && (meta.awardedTo || meta.awardedBy) && (
                          <div style={{ marginTop: '20px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                            {meta.awardedTo && (<div><p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sky, marginBottom: '4px' }}>Recipient</p><p style={{ fontSize: '0.95rem', fontWeight: 600, color: C.navy, margin: 0 }}>{meta.awardedTo}</p></div>)}
                            {meta.awardedBy && (<div><p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sky, marginBottom: '4px' }}>Awarded By</p><p style={{ fontSize: '0.95rem', fontWeight: 600, color: C.navy, margin: 0 }}>{meta.awardedBy}</p></div>)}
                          </div>
                        )}
                        {(meta.externalLink || meta.pdfUrl) && (
                          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {meta.externalLink && (<a href={meta.externalLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', border: `1px solid ${C.border}`, fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', color: C.navy, background: C.bg, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔗 View Details</a>)}
                            {meta.pdfUrl && (<a href={`${API_BASE}${meta.pdfUrl}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', border: `1px solid ${C.sky}`, fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', color: C.sky, background: '#E0F7FC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📄 PDF</a>)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: C.navy, fontFamily: sysFont }}>Edit {editItem?.type === 'achievement' ? 'Achievement' : 'News'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Title" value={editForm.title || ''} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} fullWidth size="small" />
          <TextField label="Description" value={editForm.description || ''} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={3} size="small" />
          <TextField label="Date" type="date" value={editForm.date || ''} onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Tag" value={editForm.tag || ''} onChange={(e) => setEditForm(f => ({ ...f, tag: e.target.value }))} fullWidth size="small" />
          {editItem?.type === 'achievement' && (
            <>
              <TextField label="Awarded To" value={editForm.awardedTo || ''} onChange={(e) => setEditForm(f => ({ ...f, awardedTo: e.target.value }))} fullWidth size="small" />
              <TextField label="Awarded By" value={editForm.awardedBy || ''} onChange={(e) => setEditForm(f => ({ ...f, awardedBy: e.target.value }))} fullWidth size="small" />
            </>
          )}
          <TextField label="External Link" value={editForm.externalLink || ''} onChange={(e) => setEditForm(f => ({ ...f, externalLink: e.target.value }))} fullWidth size="small" />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />} sx={{ color: C.ink3 }}>Cancel</Button>
          <Button onClick={handleSaveEdit} disabled={saving} variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: C.navy, '&:hover': { bgcolor: C.navyDark }, borderRadius: '8px', fontWeight: 700 }}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: C.danger, fontFamily: sysFont }}>Delete {deleteTarget?.type === 'achievement' ? 'Achievement' : 'News'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: C.ink2 }}>Are you sure you want to permanently delete <strong>"{deleteTarget?.title}"</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: C.ink3 }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} disabled={deleting} variant="contained" color="error" startIcon={<DeleteIcon />} sx={{ borderRadius: '8px', fontWeight: 700 }}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NewsPage;
