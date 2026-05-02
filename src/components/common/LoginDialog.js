import React, { useState } from 'react';
import { 
  Dialog, DialogContent, Button, TextField, 
  Alert, Box, Divider, Typography, Tabs, Tab, IconButton, CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Google as GoogleIcon } from '@mui/icons-material';
import { auth } from '../../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────── */
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

const GlobalStyles = () => (
  <style>{`
    .vicas-login-tab {
      font-family: ${sysFont} !important;
      font-size: 0.82rem !important;
      font-weight: 700 !important;
      text-transform: none !important;
      color: ${C.ink3} !important;
      transition: all 0.2s ease !important;
      min-height: 48px !important;
    }
    .vicas-login-tab.Mui-selected {
      color: ${C.navy} !important;
    }
    .MuiTabs-indicator {
      background-color: ${C.sky} !important;
      height: 3px !important;
      border-radius: 3px 3px 0 0 !important;
    }

    .vicas-login-input .MuiOutlinedInput-root {
      border-radius: 10px !important;
      font-family: ${sysFont} !important;
      transition: all 0.2s ease !important;
    }
    .vicas-login-input .MuiOutlinedInput-root:hover {
      background: ${C.bg} !important;
    }
    .vicas-login-input .MuiOutlinedInput-root.Mui-focused {
      box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.1) !important;
    }
    .vicas-login-input .MuiInputLabel-root {
      font-family: ${sysFont} !important;
      font-size: 0.9rem !important;
    }

    .vicas-auth-btn {
      background: ${C.navy} !important;
      color: white !important;
      border-radius: 10px !important;
      font-family: ${sysFont} !important;
      font-weight: 700 !important;
      padding: 12px !important;
      text-transform: none !important;
      box-shadow: 0 4px 12px rgba(10, 37, 64, 0.15) !important;
      transition: all 0.2s ease !important;
    }
    .vicas-auth-btn:hover {
      background: ${C.navyDark} !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 16px rgba(10, 37, 64, 0.2) !important;
    }
    .vicas-auth-btn:active {
      transform: translateY(0) !important;
    }

    .vicas-google-btn {
      border: 1px solid ${C.border} !important;
      border-radius: 10px !important;
      color: ${C.ink} !important;
      text-transform: none !important;
      font-family: ${sysFont} !important;
      font-weight: 600 !important;
      padding: 11px !important;
      transition: all 0.2s ease !important;
      background: ${C.white} !important;
    }
    .vicas-google-btn:hover {
      background: ${C.bg} !important;
      border-color: ${C.sky} !important;
      color: ${C.navy} !important;
    }

    @keyframes vicas-fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .vicas-auth-form {
      animation: vicas-fade-in 0.3s ease-out;
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
      if (!res.ok) throw new Error(data.error || 'Login failed. Please check your credentials.');
      
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
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

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

      setSuccess('Account created successfully! You can now sign in.');
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
      if (!res.ok) throw new Error(data.error || 'Google authentication failed.');

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
      PaperProps={{ 
        sx: { 
          borderRadius: '20px', 
          boxShadow: '0 24px 80px rgba(10, 37, 64, 0.18)',
          backgroundImage: 'none',
          overflow: 'hidden'
        } 
      }}
    >
      <GlobalStyles />
      
      {/* Header Section */}
      <Box sx={{ 
        p: 4, pt: 5, pb: 3, 
        position: 'relative',
        background: `linear-gradient(135deg, ${C.white} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`
      }}>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            position: 'absolute', top: 16, right: 16, 
            color: C.ink3,
            '&:hover': { color: C.navy, bgcolor: 'rgba(0,0,0,0.05)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        
        <Box>
          <Typography sx={{ 
            fontSize: '0.7rem', color: C.sky, fontWeight: 800, 
            textTransform: 'uppercase', letterSpacing: '0.15em', mb: 1 
          }}>
            VICAS Hub Access
          </Typography>
          <Typography sx={{ 
            fontSize: '1.75rem', fontWeight: 800, color: C.navy, 
            lineHeight: 1.1, letterSpacing: '-0.02em' 
          }}>
            {tabValue === 0 ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: C.ink3, mt: 1.5, lineHeight: 1.5 }}>
            {tabValue === 0 
              ? 'Sign in to access the BTP portal and manage your research content.' 
              : 'Join the VICAS Lab community to contribute and collaborate.'}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ px: 4, py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.85rem' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.85rem' }}>{success}</Alert>}
        
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
            <Divider sx={{ flex: 1, borderColor: C.border }} />
            <Typography sx={{ fontSize: '10px', color: C.ink3, fontWeight: 700, letterSpacing: '0.1em' }}>OR</Typography>
            <Divider sx={{ flex: 1, borderColor: C.border }} />
          </Box>

          <Tabs 
            value={tabValue} 
            onChange={(_, v) => { setTabValue(v); setError(null); setSuccess(null); }}
            variant="fullWidth"
            sx={{ 
              mb: 1, 
              bgcolor: 'rgba(10, 37, 64, 0.03)', 
              borderRadius: '10px',
              p: '4px',
              minHeight: 'auto'
            }}
          >
            <Tab className="vicas-login-tab" label="Sign In" />
            <Tab className="vicas-login-tab" label="Register" />
          </Tabs>

          <form onSubmit={tabValue === 0 ? handleLogin : handleRegister} className="vicas-auth-form" key={tabValue}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {tabValue === 1 && (
                <TextField 
                  className="vicas-login-input" 
                  label="Full Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  fullWidth
                />
              )}
              <TextField 
                className="vicas-login-input" 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                fullWidth
              />
              <TextField 
                className="vicas-login-input" 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                fullWidth
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                className="vicas-auth-btn"
                disabled={loading}
                fullWidth
                sx={{ mt: 1 }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  tabValue === 0 ? 'Sign In to Portal' : 'Create Lab Account'
                )}
              </Button>
            </Box>
          </form>

          {tabValue === 0 && (
            <Typography 
              align="center" 
              sx={{ 
                fontSize: '0.8rem', color: C.ink3, 
                cursor: 'pointer', mt: -1,
                '&:hover': { color: C.sky }
              }}
            >
              Forgot your password?
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: C.bg, borderTop: `1px solid ${C.border}` }}>
        <Typography sx={{ fontSize: '0.75rem', color: C.ink3 }}>
          By continuing, you agree to the VICAS Lab terms of use and privacy policy.
        </Typography>
      </Box>
    </Dialog>
  );
}
