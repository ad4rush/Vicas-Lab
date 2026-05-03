import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Typography, Box, 
  Select, MenuItem, FormControl, InputLabel,
  Modal, Backdrop, Fade, IconButton, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import main_2 from '../../Photos/main_2.jpeg';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* ─── DESIGN TOKENS (Navy Theme) ─────────────────────────────────── */
const C = {
  white:    '#FFFFFF',
  navy:     '#0A2540',
  navyDark: '#061626',
  sky:      '#00B4D8',
  border:   '#E5E7EB',
  bg:       '#F8FAFC',
  ink:      '#111827',
  ink2:     '#374151',
  ink3:     '#6B7280',
  danger:   '#DC2626',
  dangerBg: '#FEF2F2',
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

const SectionTitle = ({ children, style = {} }) => (
  <h2 style={{
    fontFamily: sysFont,
    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
    fontWeight: 800, color: C.navy,
    lineHeight: 1.15, margin: 0,
    ...style,
  }}>{children}</h2>
);

const GlobalStyles = () => (
  <style>{`
    @keyframes heroFadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes heroPulse {
      0%, 100% { opacity: 0.04; }
      50% { opacity: 0.08; }
    }
    .hero-fade { animation: heroFadeUp 0.7s ease both; }
    .hero-fade-d1 { animation-delay: 0.15s; }
    .hero-fade-d2 { animation-delay: 0.3s; }

    .vicas-pub-card {
      padding: 32px 24px;
      border: 1px solid ${C.border};
      border-radius: 12px;
      background: ${C.white};
      margin-bottom: 16px;
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 24px;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }
    .vicas-pub-card:hover {
      border-color: ${C.sky};
      box-shadow: 0 4px 20px rgba(10, 37, 64, 0.05);
    }
    .vicas-pub-card .delete-btn { opacity: 0; transition: opacity 0.2s; }
    .vicas-pub-card:hover .delete-btn { opacity: 1; }

    .vicas-filter-form .MuiOutlinedInput-root {
      border-radius: 8px;
      background: ${C.white};
      font-family: ${sysFont};
      font-size: 13px;
    }
    .vicas-filter-form .MuiOutlinedInput-notchedOutline {
      border-color: ${C.border};
    }
    .vicas-filter-form .MuiInputLabel-root {
      font-family: ${sysFont};
      font-size: 13px;
      font-weight: 600;
      color: ${C.ink3};
    }

    @media (max-width: 768px) {
      .vicas-pub-card { grid-template-columns: 1fr !important; gap: 12px; }
      .vicas-filter-stack { flex-direction: column !important; width: 100%; }
      .vicas-filter-stack .MuiFormControl-root { width: 100% !important; }
    }
  `}</style>
);

const ResearchPage = () => {
  const { isAdmin } = useAuth();
  const [year, setYear] = useState('');
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchResearch = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/content/research`);
      const data = await res.json();
      if (res.ok && data.items) {
        const parsed = data.items.map(item => {
          const meta = item.metadata ? JSON.parse(item.metadata) : {};
          let pubYear = '';
          if (meta.date) {
            pubYear = new Date(meta.date).getFullYear().toString();
          }
          return {
            ...item,
            meta,
            year: pubYear || 'N/A',
            topic: meta.topic || 'General',
            author: meta.author || 'Unknown',
            journal: meta.journal || 'Unpublished'
          };
        });
        setPublications(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch research", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResearch(); }, []);

  const years = useMemo(() => [...new Set(publications.map(p => p.year).filter(y => y !== 'N/A'))].sort().reverse(), [publications]);
  const topics = useMemo(() => [...new Set(publications.map(p => p.topic))], [publications]);
  const authors = useMemo(() => [...new Set(publications.map(p => p.author))], [publications]);

  const filteredPublications = publications.filter(p => 
    (year ? p.year === year : true) &&
    (topic ? p.topic === topic : true) &&
    (author ? p.author === author : true)
  );

  const handleOpen = (pub) => {
    setSelectedItem(pub);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
  };

  // ─── Delete ──────────────────────────────────────────────────
  const openDelete = (item, e) => {
    if (e) e.stopPropagation();
    setDeleteTarget(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_BASE}/api/content/${deleteTarget.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { setDeleteDialogOpen(false); setOpen(false); setSelectedItem(null); await fetchResearch(); }
    } catch (err) { console.error('Delete failed:', err); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* Hero */}
      <Box sx={{ position: 'relative', height: '45vh', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_2})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        
        {/* Dark overlay — Same as Home */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(6,22,38,0.88) 0%, rgba(6,22,38,0.72) 50%, rgba(6,22,38,0.92) 100%)',
        }} />

        {/* Decorative grid pattern — Same as Home */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'heroPulse 6s ease-in-out infinite',
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 2, padding: '0 24px', textAlign: 'center', maxWidth: '850px' }}>
          <Box className="hero-fade">
            <SectionLabel>Academic Archive</SectionLabel>
          </Box>
          <Typography variant="h1" className="hero-fade hero-fade-d1" sx={{ 
            fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', fontWeight: 800, color: '#fff', 
            lineHeight: 1.1, mb: 3, letterSpacing: '-0.02em' 
          }}>
            Research &<br />Publications
          </Typography>
          <Box className="hero-fade hero-fade-d1" sx={{ width: 48, height: 3, bgcolor: C.sky, mx: 'auto', borderRadius: 2 }} />
        </Box>
      </Box>

      {/* Filters */}
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '48px 0' }}>
        <Container maxWidth="lg">
          <Box className="vicas-filter-stack vicas-filter-form" sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={e => setYear(e.target.value)} MenuProps={{ disableScrollLock: true }}>
                <MenuItem value=""><em>All Deliveries</em></MenuItem>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select value={topic} label="Topic" onChange={e => setTopic(e.target.value)} MenuProps={{ disableScrollLock: true }}>
                <MenuItem value=""><em>All Topics</em></MenuItem>
                {topics.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Author</InputLabel>
              <Select value={author} label="Author" onChange={e => setAuthor(e.target.value)} MenuProps={{ disableScrollLock: true }}>
                <MenuItem value=""><em>All Investigators</em></MenuItem>
                {authors.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Container>
      </section>

      {/* Publications List */}
      <section style={{ padding: '80px 0', minHeight: '500px' }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6 }}>
            <SectionLabel>Records</SectionLabel>
            <SectionTitle>Publication Archive — {filteredPublications.length} Results</SectionTitle>
          </Box>

          <Box sx={{ mt: 4 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: C.navy }} />
              </Box>
            ) : filteredPublications.map((pub) => (
              <Box key={pub.id} className="vicas-pub-card" onClick={() => handleOpen(pub)}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, textAlign: 'center', opacity: 0.8 }}>
                  {pub.year}
                </Typography>
                <Box>
                  <Typography variant="h3" sx={{ fontSize: '1.15rem', fontWeight: 700, color: C.ink, lineHeight: 1.4, mb: 1 }}>
                    {pub.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.sky, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {pub.author}
                    </Typography>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: C.border }} />
                    <Typography sx={{ fontSize: '0.9rem', color: C.ink3, fontStyle: 'italic' }}>
                      {pub.journal}
                    </Typography>
                    <Box sx={{ ml: 'auto', bgcolor: C.bg, border: `1px solid ${C.border}`, px: 1.2, py: 0.4, borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: C.navy, textTransform: 'uppercase' }}>
                      {pub.topic}
                    </Box>
                  </Box>
                </Box>
                {isAdmin && (
                  <Box className="delete-btn" sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={(e) => openDelete(pub, e)} sx={{ bgcolor: C.dangerBg, border: '1px solid #FECACA', '&:hover': { bgcolor: '#FEE2E2', borderColor: C.danger } }}>
                      <DeleteIcon sx={{ fontSize: 16, color: C.danger }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {!loading && filteredPublications.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography sx={{ color: C.ink3, fontWeight: 500 }}>No repository entries found matching your filter criteria.</Typography>
            </Box>
          )}
        </Container>
      </section>

      {/* Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, sx: { bgcolor: 'rgba(6, 22, 38, 0.9)', backdropFilter: 'blur(8px)' } }}
      >
        <Fade in={open}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: '640px', maxHeight: '90vh',
            bgcolor: C.white, borderRadius: '12px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.3)', p: 0, outline: 'none', overflowY: 'auto'
          }}>
            {selectedItem && (
              <div style={{ position: 'relative' }}>
                <div style={{ height: '6px', background: C.navy }} />
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                  {isAdmin && (
                    <IconButton size="small" onClick={(e) => openDelete(selectedItem, e)} sx={{ bgcolor: C.dangerBg, border: '1px solid #FECACA', '&:hover': { bgcolor: '#FEE2E2' } }}>
                      <DeleteIcon sx={{ fontSize: 18, color: C.danger }} />
                    </IconButton>
                  )}
                  <IconButton onClick={handleClose} sx={{ color: C.ink3 }}><CloseIcon /></IconButton>
                </Box>

                <div style={{ padding: '56px 48px' }}>
                  <SectionLabel>{selectedItem.topic}</SectionLabel>
                  <SectionTitle style={{ fontSize: '2rem', marginBottom: '24px' }}>{selectedItem.title}</SectionTitle>

                  <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: C.ink2, marginBottom: '40px' }}>{selectedItem.description}</p>

                  <Divider sx={{ mb: 4, borderColor: C.border }} />

                  <Typography sx={{ fontSize: '0.8rem', color: C.ink3, mb: 1, fontWeight: 700, textTransform: 'uppercase' }}>Details</Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: C.ink2, mb: 1 }}><strong>Authors:</strong> {selectedItem.author}</Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: C.ink2, mb: 1 }}><strong>Journal/Conference:</strong> {selectedItem.journal}</Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: C.ink2, mb: 3 }}><strong>Publication Date:</strong> {selectedItem.meta.date ? new Date(selectedItem.meta.date).toLocaleDateString() : selectedItem.year}</Typography>

                  {/* External links */}
                  {(() => {
                    const meta = selectedItem.meta;
                    return (meta.externalLink || meta.pdfUrl || selectedItem.image_url) ? (
                      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {meta.externalLink && (
                          <a href={meta.externalLink} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.border}`,
                            fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', color: C.navy,
                            background: C.bg, textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>🔗 View Paper</a>
                        )}
                        {meta.pdfUrl && (
                          <a href={`${API_BASE}${meta.pdfUrl}`} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.sky}`,
                            fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', color: C.sky,
                            background: '#E0F7FC', textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>📄 Download PDF</a>
                        )}
                        {selectedItem.image_url && (
                          <a href={selectedItem.image_url.startsWith('/') ? `${API_BASE}${selectedItem.image_url}` : selectedItem.image_url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.border}`,
                            fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', color: C.navy,
                            background: C.bg, textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>🖼️ View Image</a>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: C.danger, fontFamily: sysFont }}>Delete Publication</DialogTitle>
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

export default ResearchPage;
