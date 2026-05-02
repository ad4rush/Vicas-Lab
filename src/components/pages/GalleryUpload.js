import React, { useState, useRef } from 'react';
import {
  Container, Typography, Box, Paper, Button, TextField,
  Alert, CircularProgress, LinearProgress, Fade, IconButton, Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import main_4 from '../../Photos/main_4.jpeg';

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

const GlobalStyles = () => (
  <style>{`
    .vicas-upload-dropzone {
      border: 1px dashed ${C.border};
      background: ${C.bg};
      padding: 64px 32px;
      text-align: center;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .vicas-upload-dropzone:hover {
      border-color: ${C.sky};
      background: ${C.white};
      box-shadow: 0 16px 48px rgba(10, 37, 64, 0.04);
    }
    .vicas-upload-dropzone.dragging {
      border-color: ${C.sky};
      background: rgba(0, 180, 216, 0.05);
      transform: scale(0.99);
    }
    
    .vicas-input-field .MuiOutlinedInput-root {
      border-radius: 4px;
    }
    .vicas-input-field .MuiInputLabel-root {
      font-family: ${sysFont};
      font-size: 13px;
      font-weight: 600;
      color: ${C.ink3};
    }

    .vicas-upload-btn {
      background: ${C.navy} !important;
      color: white !important;
      border-radius: 4px !important;
      font-family: ${sysFont} !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.1em !important;
      padding: 16px 32px !important;
      transition: all 0.2s !important;
    }
    .vicas-upload-btn:hover {
      background: ${C.navyDark} !important;
      box-shadow: 0 12px 32px rgba(10, 37, 64, 0.2) !important;
    }
    .vicas-upload-btn:disabled {
      background: ${C.border} !important;
    }
  `}</style>
);

function GalleryUpload() {
  // const { isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('accessToken');

  function handleFileSelect(selectedFile) {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Unsupported format. Please select an image (JPG, PNG, WebP).');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Deployment file exceeds 10MB limit.');
      return;
    }
    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }

  function handleFileChange(e) { handleFileSelect(e.target.files[0]); }
  function handleDrop(e) { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }
  function handleDragOver(e) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave(e) { e.preventDefault(); setDragOver(false); }
  
  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const uploadFileToS3 = async (fileToUpload) => {
    if (!fileToUpload) return null;
    
    // 1. Get Presigned URL
    const res = await fetch(`${API_BASE}/api/upload/presign`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: fileToUpload.name, fileType: fileToUpload.type, folder: 'gallery_images' })
    });
    
    if (!res.ok) throw new Error('Failed to get secure upload link');
    const { presignedUrl, publicUrl } = await res.json();

    // 2. Upload directly to AWS S3
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': fileToUpload.type },
      body: fileToUpload
    });

    if (!uploadRes.ok) throw new Error('Failed to upload photo directly to storage');

    return publicUrl;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('A file selection is required.'); return; }

    setLoading(true); setError(null); setSuccess(null);

    try {
      const imageUrl = await uploadFileToS3(file);
      
      const res = await fetch(`${API_BASE}/api/gallery/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl,
          title: title || null,
          description: description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload sequence interrupted.');

      setSuccess('Archive successfully transmitted for review.');
      setFile(null); setPreview(null); setTitle(''); setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '40vh', minHeight: '300px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_4})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.85)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '1000px' }}>
          <SectionLabel>Nexus Submit</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>Laboratory<br />Upload Portal</h1>
        </div>
      </section>

      <Container maxWidth="md" sx={{ py: 10 }}>
        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, border: `1px solid ${C.border}`, borderRadius: '12px', background: C.white }}>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: '4px' }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Fade in>
              <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 4, borderRadius: '4px' }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            </Fade>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              
              {/* Dropzone */}
              {!preview ? (
                <div 
                   className={`vicas-upload-dropzone ${dragOver ? 'dragging' : ''}`}
                   onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                   onClick={() => fileInputRef.current?.click()}
                >
                   <UploadIcon sx={{ fontSize: 56, color: C.sky, mb: 3 }} />
                   <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: '0 0 10px 0' }}>
                     {dragOver ? 'Accepting File...' : 'Select Visual Archive'}
                   </h3>
                   <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.sky, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                     {dragOver ? 'Release to catalog' : 'Drag file here or click to browse'}
                   </Typography>
                   <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                </div>
              ) : (
                <Box sx={{ position: 'relative', border: `1px solid ${C.border}`, p: 1, borderRadius: '8px', overflow: 'hidden', background: C.bg }}>
                   <img src={preview} alt="Queue" style={{ width: '100%', maxHeight: 460, objectFit: 'contain', display: 'block', borderRadius: '4px' }} />
                   <IconButton 
                      onClick={removeFile} 
                      sx={{ position: 'absolute', top: 20, right: 20, bgcolor: 'rgba(6, 22, 38, 0.8)', color: 'white', '&:hover': { bgcolor: '#ef4444' } }}
                   >
                     <DeleteIcon fontSize="small" />
                   </IconButton>
                   <Box sx={{ p: 2, borderTop: `1px solid ${C.border}`, mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: C.ink3 }}>ID: {file.name.slice(0, 20)}...</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: C.navy }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                   </Box>
                </Box>
              )}

              <Grid container spacing={4}>
                 <Grid item xs={12}>
                    <TextField
                      className="vicas-input-field"
                      fullWidth label="Entry Title"
                      value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Archive identification"
                    />
                 </Grid>
                 <Grid item xs={12}>
                    <TextField
                      className="vicas-input-field"
                      fullWidth label="Descriptive Record"
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Context and technical metadata"
                      multiline rows={3}
                    />
                 </Grid>
              </Grid>

              {loading && (
                <Box>
                  <LinearProgress sx={{ height: 4, borderRadius: 2, bgcolor: C.border, '& .MuiLinearProgress-bar': { bgcolor: C.sky } }} />
                  <Typography sx={{ mt: 2, textAlign: 'center', fontSize: '10px', fontWeight: 800, color: C.sky, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Compressing & Syncing Data...
                  </Typography>
                </Box>
              )}

              <Button
                type="submit" fullWidth variant="contained" className="vicas-upload-btn"
                disabled={!file || loading}
                startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <UploadIcon />}
              >
                {loading ? 'Transmitting...' : 'Commit to Record'}
              </Button>

            </Box>
          </form>
        </Paper>
      </Container>
    </div>
  );
}

export default GalleryUpload;
