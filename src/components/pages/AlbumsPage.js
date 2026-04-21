import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert, IconButton,
  Dialog, DialogContent, Skeleton, Grow
} from '@mui/material';
import {
  PhotoLibrary as AlbumIcon, ArrowBack as BackIcon,
  Close as CloseIcon, ArrowBack as PrevIcon, ArrowForward as NextIcon,
  Person as PersonIcon, CalendarToday as DateIcon,
  Collections as CollectionsIcon, Delete as DeleteIcon
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
    /* ─── Album Cards ─── */
    .vicas-album-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      background: ${C.white};
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .vicas-album-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 64px rgba(10, 37, 64, 0.15);
    }
    .vicas-album-card:hover .album-cover-img {
      transform: scale(1.08);
    }
    .vicas-album-card:hover .album-overlay {
      opacity: 1;
    }

    /* ─── Album Detail Photo Grid (iPhone-style) ─── */
    .album-photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 4px;
    }
    .album-photo-item {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 1;
      background: ${C.bg};
    }
    .album-photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease, filter 0.3s ease;
      display: block;
    }
    .album-photo-item:hover img {
      transform: scale(1.05);
      filter: brightness(0.85);
    }
    .album-photo-item .photo-hover-info {
      position: absolute;
      inset: 0;
      background: linear-gradient(transparent 50%, rgba(6, 22, 38, 0.85));
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      align-items: flex-end;
      padding: 12px;
    }
    .album-photo-item:hover .photo-hover-info {
      opacity: 1;
    }

    /* ─── Lightbox ─── */
    .lightbox-button {
      color: white;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.15);
      transition: all 0.2s;
      width: 44px;
      height: 44px;
    }
    .lightbox-button:hover { 
      background: rgba(255, 255, 255, 0.25) !important;
    }

    @media (max-width: 768px) {
      .album-photo-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 2px !important; }
    }
    @media (max-width: 480px) {
      .album-photo-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `}</style>
);

function AlbumsPage() {
  const { user, isSuperAdmin } = useAuth();
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [albumDetail, setAlbumDetail] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    if (albumId) {
      fetchAlbumPhotos(albumId);
    } else {
      fetchAlbums();
    }
  }, [albumId]);

  async function fetchAlbums() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/albums`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlbums(data.albums || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAlbumPhotos(id) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gallery/albums/${id}/photos`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlbumDetail(data.album);
      setPhotos(data.photos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const openLightbox = (index) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  
  const navigateLightbox = useCallback((dir) => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + dir + photos.length) % photos.length,
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
      fetchAlbumPhotos(albumId);
    } catch (err) { setError(err.message); }
  }

  // ─── Album List View ──────────────────────────────────────────
  if (!albumId) {
    return (
      <div style={{ fontFamily: sysFont, background: C.bg, color: C.ink, overflowX: 'hidden', minHeight: '100vh' }}>
        <GlobalStyles />
        
        {/* Hero */}
        <section style={{ position: 'relative', height: '45vh', minHeight: '350px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_4})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.85)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
          
          <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
            <SectionLabel>Photo Archive</SectionLabel>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>Photography<br />Collections</h1>
          </div>
        </section>

        <Container maxWidth="lg" sx={{ py: 10 }}>
          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={320} sx={{ borderRadius: '16px' }} />
              ))}
            </Box>
          ) : albums.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 15 }}>
              <CollectionsIcon sx={{ fontSize: 80, color: C.border, mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: C.ink3 }}>No albums cataloged yet</Typography>
              <Typography sx={{ color: C.ink3, mt: 1 }}>Create albums from the Admin Panel to organize your photos</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {albums.map((album, index) => (
                <Grow key={album.id} in timeout={300 + index * 80}>
                  <div className="vicas-album-card" onClick={() => navigate(`/albums/${album.id}`)}>
                    {/* Cover image with fixed aspect ratio */}
                    <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                      {album.cover_url ? (
                        <img
                          className="album-cover-img"
                          src={getImageUrl(album.cover_url)}
                          alt={album.name}
                          style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      ) : (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDark} 100%)`,
                        }}>
                          <AlbumIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.15)' }} />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div
                        className="album-overlay"
                        style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(transparent 30%, rgba(6, 22, 38, 0.9) 100%)',
                          opacity: 0.85,
                          transition: 'opacity 0.3s ease',
                        }}
                      />
                    </div>

                    {/* Info bar */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '24px',
                      zIndex: 2,
                    }}>
                      <div style={{ width: '28px', height: '3px', background: C.sky, marginBottom: '12px', borderRadius: '2px' }} />
                      <h3 style={{
                        fontSize: '1.2rem', fontWeight: 800, color: C.white,
                        margin: '0 0 4px 0', lineHeight: 1.2,
                      }}>
                        {album.name}
                      </h3>
                      <p style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        color: 'rgba(255,255,255,0.6)',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        margin: 0,
                      }}>
                        {album.photo_count || 0} {(album.photo_count || 0) === 1 ? 'Photo' : 'Photos'}
                      </p>
                    </div>
                  </div>
                </Grow>
              ))}
            </Box>
          )}
        </Container>
      </div>
    );
  }

  // ─── Album Detail View (iPhone Gallery Style) ─────────────────
  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Compact Header */}
      <section style={{
        position: 'relative', paddingTop: '100px', paddingBottom: '40px',
        background: C.white, borderBottom: `1px solid ${C.border}`,
      }}>
        <Container maxWidth="xl">
          <IconButton
            onClick={() => navigate('/albums')}
            sx={{ mb: 2, color: C.sky, p: 0, '&:hover': { color: C.navy } }}
          >
            <BackIcon sx={{ mr: 0.5, fontSize: 18 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Albums</span>
          </IconButton>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800, color: C.navy,
            margin: '0 0 8px 0', lineHeight: 1.1,
          }}>
            {albumDetail?.name || 'Collection'}
          </h1>

          {albumDetail?.description && (
            <p style={{ fontSize: '1rem', color: C.ink3, maxWidth: '600px', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              {albumDetail.description}
            </p>
          )}

          <p style={{
            fontSize: '0.8rem', fontWeight: 600, color: C.ink3,
            margin: 0,
          }}>
            {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
          </p>
        </Container>
      </section>

      {/* Photo Grid (iPhone-style) */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

        {loading ? (
          <div className="album-photo-grid">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" sx={{ width: '100%', aspectRatio: '1', borderRadius: 0 }} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 15 }}>
            <AlbumIcon sx={{ fontSize: 64, color: C.border, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: C.ink3 }}>No photos in this album</Typography>
            <Typography sx={{ color: C.ink3, mt: 1, fontSize: '0.9rem' }}>Add photos from the admin panel</Typography>
          </Box>
        ) : (
          <div className="album-photo-grid" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="album-photo-item"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={getImageUrl(photo.image_url)}
                  alt={photo.title || 'Album photo'}
                  loading="lazy"
                />
                <div className="photo-hover-info">
                  <p style={{
                    color: C.white, fontSize: '0.75rem', fontWeight: 600,
                    margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {photo.title || 'Untitled'}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
            bgcolor: 'rgba(0, 0, 0, 0.96)',
            maxWidth: '100vw', maxHeight: '100vh',
            m: 0, borderRadius: 0, boxShadow: 'none',
          }
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
          {/* Top Bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            zIndex: 10, padding: '16px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600,
            }}>
              {lightbox.index + 1} / {photos.length}
            </span>
            <Box sx={{ display: 'flex', gap: 1 }}>
              { (isSuperAdmin || (user && currentPhoto && user.email === currentPhoto.uploader_email)) && (
                <IconButton onClick={() => handleDeletePhoto(currentPhoto.id)} className="lightbox-button" sx={{ width: 40, height: 40, color: '#ef4444' }}>
                  <DeleteIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton onClick={closeLightbox} className="lightbox-button" sx={{ width: 40, height: 40 }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <IconButton onClick={() => navigateLightbox(-1)} className="lightbox-button" sx={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                <PrevIcon />
              </IconButton>
              <IconButton onClick={() => navigateLightbox(1)} className="lightbox-button" sx={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                <NextIcon />
              </IconButton>
            </>
          )}

          {currentPhoto && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 24px' }}>
              <img
                src={getImageUrl(currentPhoto.image_url)}
                alt={currentPhoto.title || 'Photo'}
                style={{
                  maxWidth: '100%', maxHeight: '75vh',
                  objectFit: 'contain', borderRadius: '4px',
                }}
              />
              
              {/* Bottom Info */}
              <div style={{ marginTop: '24px', textAlign: 'center', maxWidth: 600 }}>
                <h3 style={{
                  fontSize: '1.2rem', fontWeight: 700, color: C.white,
                  margin: '0 0 8px 0',
                }}>
                  {currentPhoto.title || 'Untitled'}
                </h3>
                {currentPhoto.description && (
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {currentPhoto.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {currentPhoto.uploader_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PersonIcon sx={{ fontSize: 14, color: C.sky }} />
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{currentPhoto.uploader_name}</span>
                    </div>
                  )}
                  {currentPhoto.created_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DateIcon sx={{ fontSize: 14, color: C.sky }} />
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{new Date(currentPhoto.created_at).toLocaleDateString()}</span>
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
}

export default AlbumsPage;
