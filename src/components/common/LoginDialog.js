import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  Alert, Box, Divider, Typography, Tabs, Tab, IconButton, CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { auth } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* ─── DESIGN TOKENS (Navy Theme) ─────────────────────────────────── */
const C = {
  white:    '#FFFFFF',
  navy:     '#0A2540',
  navyDark: '#061626',
  sky:      '#00B4D8',
  border:   '#E5E7EB',
  bg:       '#F3F4F6',
  ink:      '#111827',
  ink2:     '#374151',
  ink3:     '#6B7280',
};

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

const GlobalStyles = () => (
  <style>{`
    .vicas-login-tab {
      font-family: ${sysFont} !important;
      font-size: 0.8rem !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      color: ${C.ink3} !important;
    }
    .vicas-login-tab.Mui-selected {
      color: ${C.navy} !important;
    }
    .MuiTabs-indicator {
      background-color: ${C.navy} !important;
    }

    .vicas-login-input .MuiOutlinedInput-root {
      border-radius: 4px !important;
    }

    .vicas-auth-btn {
      background: ${C.navy} !important;
      color: white !important;
      border-radius: 4px !important;
      font-family: ${sysFont} !important;
      font-weight: 600 !important;
      padding: 14px !important;
    }
    .vicas-auth-btn:hover {
      background: ${C.navyDark} !important;
    }

    .vicas-google-btn {
      border: 1px solid ${C.border} !important;
      border-radius: 4px !important;
      color: ${C.ink} !important;
      text-transform: none !important;
      font-family: ${sysFont} !important;
      font-weight: 600 !important;
      padding: 12px !important;
    }
    .vicas-google-btn:hover {
      background: ${C.bg} !important;
    }
  `}</style>
);

export default function LoginDialog({ open, onClose, onSuccess }) {
  const [tabValue, setTabValue] = useState(0); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  function resetForm() {
    setEmail(''); setPassword(''); setName('');
    setError(null); setSuccess(null);
  }

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login sequence failed.');
      
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);

      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.accessToken}` },
        credentials: 'include',
      });
      const me = await meRes.json();
      if (!meRes.ok) throw new Error(me.error || 'Failed to sync profile.');

      onSuccess && onSuccess(me);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (password.length < 8) { setError('Minimum 8 characters required.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      setSuccess('Account created! Please sign in.');
      setTabValue(0);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFirebaseGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      // Open popup immediately before any React state updates to prevent popup blocking
      const result = await signInWithPopup(auth, provider);
      
      setError(null); 
      setLoading(true);

      const idToken = await result.user.getIdToken();
      
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google handshake failed.');

      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);

      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.accessToken}` },
        credentials: 'include',
      });
      const me = await meRes.json();
      if (!meRes.ok) throw new Error(me.error || 'Failed to sync profile.');

      onSuccess && onSuccess(me);
      resetForm();
      onClose();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 24px 64px rgba(0,0,0,0.1)' } }}
    >
      <GlobalStyles />
      <Box sx={{ p: 4, pt: 5, pb: 1, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: C.ink3 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', color: C.sky, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>Lab Access</Typography>
          <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: C.navy, lineHeight: 1.1 }}>VICAS Portal</Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 4, pb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Button
            className="vicas-google-btn"
            fullWidth
            onClick={handleFirebaseGoogleLogin}
            disabled={loading}
            startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: 18 }} />}
          >
            Continue with Google
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: '11px', color: C.ink3, fontWeight: 600 }}>OR</Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          <Tabs 
            value={tabValue} 
            onChange={(_, v) => { setTabValue(v); setError(null); setSuccess(null); }}
            variant="fullWidth"
            sx={{ mb: 1 }}
          >
            <Tab className="vicas-login-tab" label="Sign In" />
            <Tab className="vicas-login-tab" label="Register" />
          </Tabs>

          <form onSubmit={tabValue === 0 ? handleLogin : handleRegister}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {tabValue === 1 && (
                <TextField className="vicas-login-input" label="Name" value={name} onChange={e => setName(e.target.value)} required size="small" />
              )}
              <TextField className="vicas-login-input" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required size="small" />
              <TextField className="vicas-login-input" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required size="small" />
              
              <Button 
                  type="submit" variant="contained" className="vicas-auth-btn"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={14} sx={{ color: 'white' }} /> : null}
                  sx={{ mt: 1 }}
              >
                  {tabValue === 0 ? (loading ? 'Signing in...' : 'Sign In') : (loading ? 'Creating...' : 'Create Account')}
              </Button>
            </Box>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
