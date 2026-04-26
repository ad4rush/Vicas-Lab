import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid,
  Modal, Backdrop, Fade, IconButton, Divider, CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import main_1 from '../../Photos/main_1.jpeg';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* ─── DESIGN TOKENS (Navy Theme) ─────────────────────────────────── */
const C = {
  white: '#FFFFFF',
  navy: '#0A2540',
  navyDark: '#061626',
  sky: '#00B4D8',
  border: '#E5E7EB',
  bg: '#F8FAFC',
  ink: '#111827',
  ink2: '#374151',
  ink3: '#6B7280',
};

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

// Projects are fetched dynamically

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
    .vicas-project-card {
      background: ${C.white};
      border: 1px solid ${C.border};
      padding: 48px 40px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
    }
    .vicas-project-card:hover {
      border-color: ${C.sky};
      transform: translateY(-8px);
      box-shadow: 0 20px 48px rgba(10, 37, 64, 0.06);
    }
    
    .vicas-btn-text {
      font-size: 0.8rem;
      font-weight: 700;
      color: ${C.navy};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-decoration: none;
      display: inline-block;
      margin-top: auto;
      padding-top: 32px;
      cursor: pointer;
      transition: color 0.2s;
    }
    .vicas-btn-text:hover { color: ${C.sky}; }

    @media (max-width: 768px) {
      .vicas-project-grid { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

const ProjectsPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/content/project`);
        const data = await res.json();
        if (res.ok && data.items) {
          setProjects(data.items);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleOpen = (project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
  };

  return (
    <div style={{ fontFamily: sysFont, background: C.bg, color: C.ink, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '45vh', minHeight: '350px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_1})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.85)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
          <SectionLabel>Research Portfolio</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>Active<br />Projects</h1>
        </div>
      </section>

      {/* Projects Grid */}
      <section style={{ padding: '100px 0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionLabel>Innovation</SectionLabel>
            <SectionTitle>Key Research Initiatives</SectionTitle>
          </Box>

          <div className="vicas-project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {loading ? (
              <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: C.navy }} />
              </Box>
            ) : projects.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: C.ink3, fontWeight: 600 }}>No active projects found.</Typography>
              </Box>
            ) : projects.map((project, index) => {
              const meta = project.metadata ? JSON.parse(project.metadata) : {};
              return (
                <div key={project.id || index} className="vicas-project-card">
                  {project.image_url && (
                    <div style={{ marginBottom: '20px', borderRadius: '4px', overflow: 'hidden', height: '160px' }}>
                      <img src={project.image_url.startsWith('/') ? `${API_BASE}${project.image_url}` : project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '2px', background: C.sky }} />
                    {meta.tag && <span style={{ fontSize: '10px', fontWeight: 700, color: C.navy, bgcolor: C.bg, border: `1px solid ${C.border}`, px: 1.5, py: 0.5, borderRadius: '4px', textTransform: 'uppercase' }}>{meta.tag}</span>}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, lineHeight: 1.3, margin: '0 0 16px 0' }}>{project.title}</h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, color: C.ink2, margin: 0 }}>{project.description}</p>
                  <div className="vicas-btn-text" onClick={() => handleOpen(project)}>Examine Record →</div>
                </div>
              );
            })}
          </div>
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
            {selectedProject && (
              <div style={{ position: 'relative' }}>
                <div style={{ height: '6px', background: C.navy }} />
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 20, right: 20, color: C.ink3 }}>
                  <CloseIcon />
                </IconButton>

                <div style={{ padding: '56px 48px' }}>
                  <SectionLabel>{selectedProject.tag}</SectionLabel>
                  <SectionTitle style={{ fontSize: '2rem', marginBottom: '24px' }}>{selectedProject.title}</SectionTitle>

                  <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: C.ink2, marginBottom: '40px' }}>{selectedProject.description}</p>

                  <Divider sx={{ mb: 4, borderColor: C.border }} />

                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: C.sky, marginBottom: '8px' }}>Partners</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: C.navy }}>{selectedProject.metadata ? JSON.parse(selectedProject.metadata).collaborators || 'N/A' : 'N/A'}</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: C.sky, marginBottom: '8px' }}>Funding</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: C.navy }}>{selectedProject.metadata ? JSON.parse(selectedProject.metadata).funding || 'N/A' : 'N/A'}</p>
                    </Grid>
                  </Grid>

                  <div style={{ marginTop: '40px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: C.sky, marginBottom: '20px' }}>Project Milestones</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(selectedProject.metadata ? JSON.parse(selectedProject.metadata).milestones?.split(',') || [] : []).map((m, i) => (
                        <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div style={{ width: '8px', height: '8px', border: `2px solid ${C.sky}`, borderRadius: '50%', flexShrink: 0 }} />
                          <p style={{ fontSize: '0.95rem', fontWeight: 500, color: C.ink2, margin: 0 }}>{m.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* External links */}
                  {(() => {
                    const meta = selectedProject.metadata ? JSON.parse(selectedProject.metadata) : {};
                    return (meta.externalLink || meta.pdfUrl) ? (
                      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {meta.externalLink && (
                          <a href={meta.externalLink} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.border}`,
                            fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', color: C.navy,
                            background: C.bg, textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>🔗 View Paper / Project</a>
                        )}
                        {meta.pdfUrl && (
                          <a href={`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}${meta.pdfUrl}`} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.sky}`,
                            fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', color: C.sky,
                            background: '#E0F7FC', textTransform: 'uppercase', letterSpacing: '0.05em',
                          }}>📄 Download PDF</a>
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

export default ProjectsPage;
