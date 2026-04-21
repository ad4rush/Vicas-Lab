import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, IconButton,
  Dialog, DialogContent, Skeleton, Chip
} from '@mui/material';
import {
  Close as CloseIcon, ArrowBack as PrevIcon, ArrowForward as NextIcon,
  CalendarToday as DateIcon, Person as PersonIcon,
  GridView as GridIcon, ViewColumn as MasonryIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import main_4 from '../../Photos/main_4.jpeg';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
import { useAuth } from '../../contexts/AuthContext';

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
    /* ─── iPhone-style Photo Grid ─── */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 3px;
      border-radius: 12px;
      overflow: hidden;
    }
    .gallery-grid-item {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      cursor: pointer;
      background: ${C.bg};
    }
    .gallery-grid-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.35s ease, filter 0.35s ease;
    }
    .gallery-grid-item:hover img {
      transform: scale(1.06);
      filter: brightness(0.8);
    }
    .gallery-grid-item .photo-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(transparent 50%, rgba(6, 22, 38, 0.85));
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 14px;
    }
    .gallery-grid-item:hover .photo-overlay {
      opacity: 1;
    }

    /* ─── Date Section Header ─── */
    .gallery-date-header {
      padding: 24px 0 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .gallery-date-header h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: ${C.navy};
      margin: 0;
    }
    .gallery-date-header .date-count {
      font-size: 0.75rem;
      font-weight: 600;
      color: ${C.ink3};
    }

    /* ─── Lightbox ─── */
    .lb-nav-btn {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.12);
      transition: all 0.2s;
      width: 44px;
      height: 44px;
    }
    .lb-nav-btn:hover {
      background: rgba(255, 255, 255, 0.22) !important;
    }

    /* ─── Responsive ─── */
    @media (max-width: 900px) {
      .gallery-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }
    @media (max-width: 600px) {
      .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 2px !important; }
    }
  `}</style>
);

const GalleryPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/photos`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setPhotos(data.photos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Group photos by month/year (iPhone-style)
  const groupedPhotos = useMemo(() => {
    if (!photos.length) return [];
    const groups = {};
    photos.forEach((photo, idx) => {
      const d = photo.created_at ? new Date(photo.created_at) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = { key, label, photos: [] };
      groups[key].photos.push({ ...photo, globalIndex: idx });
    });
    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [photos]);

  const openLightbox = (index) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });

  const navigateLightbox = useCallback((direction) => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + direction + photos.length) % photos.length,
    }));
  }, [photos.length]);

  useEffect(() => {
    if (!lightbox.open) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox.open, navigateLightbox]);

  // Touch/swipe support for lightbox
  useEffect(() => {
    if (!lightbox.open) return;
    let startX = 0;
    const handleTouchStart = (e) => { startX = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 60) {
        navigateLightbox(diff > 0 ? 1 : -1);
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lightbox.open, navigateLightbox]);

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? `${API_BASE}${url}` : url;
  };

  const currentPhoto = photos[lightbox.index];

  async function handleDeletePhoto(id) {
    if (!window.confirm('Delete this photo permanently?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/api/gallery/photos/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include' 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      closeLightbox();
      fetchPhotos();
    } catch (err) { setError(err.message); }
  }

  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Compact Hero */}
      <section style={{
        position: 'relative', height: '40vh', minHeight: '300px',
        display: 'flex', alignItems: 'center', paddingTop: '80px',
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_4})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.88)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
          <SectionLabel>Visual Repository</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>
            Laboratory<br />Gallery
          </h1>
          {!loading && photos.length > 0 && (
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginTop: '16px', fontWeight: 500 }}>
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in collection
            </p>
          )}
        </div>
      </section>

      {/* Gallery Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

        {loading ? (
          <div className="gallery-grid">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" sx={{ width: '100%', aspectRatio: '1' }} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 15 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <GridIcon sx={{ fontSize: 36, color: C.border }} />
            </div>
            <Typography variant="h5" sx={{ fontWeight: 700, color: C.ink3 }}>No photos yet</Typography>
            <Typography sx={{ color: C.ink3, mt: 1 }}>Upload photos to see them appear here</Typography>
          </Box>
        ) : (
          <>
            {groupedPhotos.map((group) => (
              <div key={group.key}>
                {/* Date section header */}
                <div className="gallery-date-header">
                  <h3>{group.label}</h3>
                  <span className="date-count">{group.photos.length} photos</span>
                </div>

                {/* Photo grid for this month */}
                <div className="gallery-grid">
                  {group.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="gallery-grid-item"
                      onClick={() => openLightbox(photo.globalIndex)}
                    >
                      <img
                        src={getImageUrl(photo.image_url)}
                        alt={photo.title || 'Gallery photo'}
                        loading="lazy"
                      />
                      <div className="photo-overlay">
                        <p style={{
                          color: C.white, fontSize: '0.8rem', fontWeight: 700,
                          margin: '0 0 2px 0',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {photo.title || 'Untitled'}
                        </p>
                        <p style={{
                          color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 600,
                          margin: 0,
                        }}>
                          {photo.uploader_name || 'Lab Staff'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </Container>

      {/* Lightbox */}
      <Dialog
        open={lightbox.open}
        onClose={closeLightbox}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.97)',
            maxWidth: '100vw', maxHeight: '100vh',
            m: 0, borderRadius: 0, boxShadow: 'none',
          }
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', userSelect: 'none' }}>
          {/* Top Bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
            padding: '16px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(rgba(0,0,0,0.5), transparent)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>
              {lightbox.index + 1} of {photos.length}
            </span>
            <Box sx={{ display: 'flex', gap: 1 }}>
              { (isSuperAdmin || (user && currentPhoto && user.email === currentPhoto.uploader_email)) && (
                <IconButton onClick={() => handleDeletePhoto(currentPhoto.id)} className="lb-nav-btn" sx={{ width: 40, height: 40, color: '#ef4444' }}>
                  <DeleteIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton onClick={closeLightbox} className="lb-nav-btn" sx={{ width: 40, height: 40 }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <IconButton onClick={() => navigateLightbox(-1)} className="lb-nav-btn" sx={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                <PrevIcon />
              </IconButton>
              <IconButton onClick={() => navigateLightbox(1)} className="lb-nav-btn" sx={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                <NextIcon />
              </IconButton>
            </>
          )}

          {currentPhoto && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '60px 24px 24px',
            }}>
              <img
                src={getImageUrl(currentPhoto.image_url)}
                alt={currentPhoto.title || 'Photo'}
                style={{
                  maxWidth: '100%', maxHeight: '75vh',
                  objectFit: 'contain', borderRadius: '4px',
                }}
              />
              
              <div style={{ marginTop: '20px', textAlign: 'center', maxWidth: 600 }}>
                <h3 style={{
                  fontSize: '1.15rem', fontWeight: 700, color: C.white, margin: '0 0 6px 0',
                }}>
                  {currentPhoto.title || 'Untitled'}
                </h3>
                {currentPhoto.description && (
                  <p style={{
                    fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)',
                    margin: '0 0 14px 0', lineHeight: 1.5,
                  }}>
                    {currentPhoto.description}
                  </p>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap',
                }}>
                  {currentPhoto.uploader_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PersonIcon sx={{ fontSize: 14, color: C.sky }} />
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                        {currentPhoto.uploader_name}
                      </span>
                    </div>
                  )}
                  {currentPhoto.created_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DateIcon sx={{ fontSize: 14, color: C.sky }} />
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                        {new Date(currentPhoto.created_at).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPage;
