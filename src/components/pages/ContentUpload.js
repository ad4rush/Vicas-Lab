import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, TextField, Button,
  MenuItem, Select, FormControl, InputLabel, Alert, Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Link as LinkIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import main_2 from '../../Photos/main_2.jpeg';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

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
};

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

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

function ContentUpload() {
  const [type, setType] = useState('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [externalLink, setExternalLink] = useState('');
  const [metadata, setMetadata] = useState({});
  const [status, setStatus] = useState({ error: null, success: null, loading: false });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handlePdfChange = (e) => {
    if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]);
  };

  const handleMetadataChange = (key, value) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resetForm = () => {
    setTitle(''); setDescription(''); setImageFile(null);
    setPdfFile(null); setExternalLink(''); setMetadata({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: null, success: null, loading: true });

    try {
      let fileData = null, fileName = null;
      let pdfData = null, pdfName = null;

      if (imageFile) {
        fileData = await toBase64(imageFile);
        fileName = imageFile.name;
      }
      if (pdfFile) {
        pdfData = await toBase64(pdfFile);
        pdfName = pdfFile.name;
      }

      const enrichedMetadata = {
        ...metadata,
        ...(externalLink ? { externalLink } : {}),
      };

      const token = localStorage.getItem('accessToken');
      
      let res;
      if (type === 'gallery') {
        if (!fileData) throw new Error('An image file is required for Gallery Photo.');
        res = await fetch(`${API_BASE}/api/gallery/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, fileData, title, description })
        });
      } else {
        res = await fetch(`${API_BASE}/api/content/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type, title, description,
            fileData, fileName,
            pdfData, pdfName,
            metadata: enrichedMetadata
          })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload');

      setStatus({ error: null, success: data.message, loading: false });
      resetForm();
    } catch (err) {
      setStatus({ error: err.message, success: null, loading: false });
    }
  };

  return (
    <div style={{ fontFamily: sysFont, background: C.bg, minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', height: '35vh', minHeight: '280px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_2})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.88)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
          <SectionLabel>Contribute</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>Submit<br />Content</h1>
        </div>
      </section>

      <Container maxWidth="md" sx={{ py: 8 }}>
        {status.error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '8px', fontWeight: 600 }} onClose={() => setStatus(s => ({ ...s, error: null }))}>
            {status.error}
          </Alert>
        )}
        {status.success && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: '8px', fontWeight: 600 }} onClose={() => setStatus(s => ({ ...s, success: null }))}>
            {status.success}
          </Alert>
        )}

        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: '0 12px 40px rgba(10,37,64,0.06)' }}>
          <form onSubmit={handleSubmit}>

            {/* Content Type */}
            <Typography sx={{ fontWeight: 800, color: C.navy, mb: 3, fontSize: '1.2rem' }}>What are you submitting?</Typography>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel>Content Type</InputLabel>
              <Select value={type} onChange={(e) => { setType(e.target.value); setMetadata({}); }} label="Content Type" sx={{ borderRadius: '10px' }}>
                <MenuItem value="project">🚀 Project</MenuItem>
                <MenuItem value="research">🔬 Research / Publication</MenuItem>
                <MenuItem value="news">📰 News / Update</MenuItem>
                <MenuItem value="achievement">🏆 Achievement</MenuItem>
                <MenuItem value="gallery">🖼️ Gallery Photo</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ mb: 4, borderColor: C.border }} />

            {/* Core Fields */}
            <Typography sx={{ fontWeight: 800, color: C.navy, mb: 3, fontSize: '1.2rem' }}>Details</Typography>
            <TextField fullWidth label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            <TextField fullWidth label="Description / Content *" value={description} onChange={(e) => setDescription(e.target.value)} required multiline rows={4} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />

            {/* Type-specific metadata */}
            {type === 'project' && (
              <>
                <TextField fullWidth type="date" label="Project Start Date *" InputLabelProps={{ shrink: true }} value={metadata.date || ''} onChange={(e) => handleMetadataChange('date', e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Collaborators / Partners" value={metadata.collaborators || ''} onChange={(e) => handleMetadataChange('collaborators', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Funding Source" value={metadata.funding || ''} onChange={(e) => handleMetadataChange('funding', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Category Tag (e.g., Memory, Architecture, AI)" value={metadata.tag || ''} onChange={(e) => handleMetadataChange('tag', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Key Milestones (comma separated)" value={metadata.milestones || ''} onChange={(e) => handleMetadataChange('milestones', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              </>
            )}

            {type === 'research' && (
              <>
                <TextField fullWidth type="date" label="Publication Date *" InputLabelProps={{ shrink: true }} value={metadata.date || ''} onChange={(e) => handleMetadataChange('date', e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Authors *" value={metadata.author || ''} onChange={(e) => handleMetadataChange('author', e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Journal / Conference *" value={metadata.journal || ''} onChange={(e) => handleMetadataChange('journal', e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Research Topic / Category Tag *" value={metadata.topic || ''} onChange={(e) => handleMetadataChange('topic', e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              </>
            )}

            {type === 'news' && (
              <>
                <TextField fullWidth type="date" label="Date *" InputLabelProps={{ shrink: true }} value={metadata.date || ''} onChange={(e) => handleMetadataChange('date', e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Category Tag (e.g., Award, Funding, Paper)" value={metadata.tag || ''} onChange={(e) => handleMetadataChange('tag', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              </>
            )}

            {type === 'achievement' && (
              <>
                <TextField fullWidth type="date" label="Date *" InputLabelProps={{ shrink: true }} value={metadata.date || ''} onChange={(e) => handleMetadataChange('date', e.target.value)} required sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Awarded To / Recipient" value={metadata.awardedTo || ''} onChange={(e) => handleMetadataChange('awardedTo', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                <TextField fullWidth label="Awarding Body / Conference" value={metadata.awardedBy || ''} onChange={(e) => handleMetadataChange('awardedBy', e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              </>
            )}

            <Divider sx={{ mb: 4, borderColor: C.border }} />

            {/* Attachments */}
            <Typography sx={{ fontWeight: 800, color: C.navy, mb: 1, fontSize: '1.2rem' }}>Attachments & Links</Typography>
            <Typography sx={{ color: C.ink3, fontSize: '0.85rem', mb: 3 }}>All fields below are optional — attach whatever is relevant.</Typography>

            {/* External Link */}
            {type !== 'gallery' && (
              <TextField
                fullWidth
                label="External Link (paper URL, project page, etc.)"
                placeholder="https://arxiv.org/abs/..."
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: C.ink3, fontSize: 20 }} /> }}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            )}

            {/* Image Upload */}
            <Box sx={{ mb: 3, border: `2px dashed ${imageFile ? C.sky : C.border}`, p: 3, textAlign: 'center', borderRadius: '12px', bgcolor: imageFile ? C.skyLight : C.bg, transition: 'all 0.2s' }}>
              <input type="file" id="content-image" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <label htmlFor="content-image">
                <Button component="span" startIcon={<ImageIcon />} variant="outlined"
                  sx={{ mb: 1, color: C.navy, borderColor: imageFile ? C.sky : C.border, borderRadius: '8px', '&:hover': { borderColor: C.sky, bgcolor: C.skyLight } }}>
                  {imageFile ? 'Change Image' : (type === 'gallery' ? 'Select Image *' : 'Select Image (Optional)')}
                </Button>
              </label>
              {imageFile && <Typography sx={{ fontSize: '0.85rem', color: C.sky, fontWeight: 600 }}>📷 {imageFile.name}</Typography>}
              <Typography sx={{ fontSize: '0.72rem', color: C.ink3, mt: 0.5 }}>JPG, PNG, WEBP — max 5MB</Typography>
            </Box>

            {/* PDF Upload */}
            {type !== 'gallery' && (
              <Box sx={{ mb: 5, border: `2px dashed ${pdfFile ? C.sky : C.border}`, p: 3, textAlign: 'center', borderRadius: '12px', bgcolor: pdfFile ? C.skyLight : C.bg, transition: 'all 0.2s' }}>
                <input type="file" id="content-pdf" accept=".pdf" style={{ display: 'none' }} onChange={handlePdfChange} />
                <label htmlFor="content-pdf">
                  <Button component="span" startIcon={<PdfIcon />} variant="outlined"
                    sx={{ mb: 1, color: C.navy, borderColor: pdfFile ? C.sky : C.border, borderRadius: '8px', '&:hover': { borderColor: C.sky, bgcolor: C.skyLight } }}>
                    {pdfFile ? 'Change PDF' : 'Upload Research Paper PDF (Optional)'}
                  </Button>
                </label>
                {pdfFile && <Typography sx={{ fontSize: '0.85rem', color: C.sky, fontWeight: 600 }}>📄 {pdfFile.name}</Typography>}
                <Typography sx={{ fontSize: '0.72rem', color: C.ink3, mt: 0.5 }}>PDF format only — max 20MB</Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={status.loading}
              sx={{
                bgcolor: C.navy, color: C.white, py: 1.8, fontWeight: 800,
                fontSize: '1rem', borderRadius: '10px', letterSpacing: '0.03em',
                '&:hover': { bgcolor: C.navyDark }, '&:disabled': { bgcolor: C.border }
              }}
            >
              {status.loading ? 'Publishing...' : '🚀 Publish Content'}
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
}

export default ContentUpload;
