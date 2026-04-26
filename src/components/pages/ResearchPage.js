import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Typography, Box, 
  Select, MenuItem, FormControl, InputLabel,
  Modal, Backdrop, Fade, IconButton, Divider, CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
    .vicas-pub-card {
      padding: 32px 0;
      border-bottom: 1px solid ${C.border};
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 32px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .vicas-pub-card:hover {
      background: ${C.bg};
      padding-left: 20px;
    }
    .vicas-pub-card:last-child {
      border-bottom: none;
    }

    .vicas-filter-form .MuiOutlinedInput-root {
      border-radius: 4px;
      background: ${C.white};
      font-family: ${sysFont};
      font-size: 13px;
      font-weight: 500;
    }
    .vicas-filter-form .MuiOutlinedInput-notchedOutline {
      border-color: ${C.border};
    }
    .vicas-filter-form .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
      border-color: ${C.navy};
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
  const [year, setYear] = useState('');
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
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
    fetchResearch();
  }, []);

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

  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '45vh', minHeight: '350px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_2})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.85)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
          <SectionLabel>Academic Archive</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>Research &<br />Publications</h1>
        </div>
      </section>

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
          <div style={{ marginBottom: '48px' }}>
            <SectionLabel>Records</SectionLabel>
            <SectionTitle>Publication Archive — {filteredPublications.length} Results</SectionTitle>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: C.navy }} />
              </Box>
            ) : filteredPublications.map((pub) => (
              <div key={pub.id} className="vicas-pub-card" onClick={() => handleOpen(pub)}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy }}>
                  {pub.year}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.ink, lineHeight: 1.4, margin: '0 0 12px 0' }}>{pub.title}</h3>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.sky, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{pub.author}</p>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: C.border }} />
                    <p style={{ fontSize: '0.95rem', color: C.ink3, fontStyle: 'italic', margin: 0 }}>{pub.journal}</p>
                    <Box sx={{ ml: 'auto', bgcolor: C.bg, border: `1px solid ${C.border}`, px: 1.5, py: 0.5, borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: C.navy, textTransform: 'uppercase' }}>{pub.topic}</Box>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 20, right: 20, color: C.ink3 }}>
                  <CloseIcon />
                </IconButton>

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

    </div>
  );
};

export default ResearchPage;
