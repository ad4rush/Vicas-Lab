import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Snackbar, Alert, Avatar, Menu, MenuItem, Divider, Tooltip, Chip
} from '@mui/material';
import {
  Menu as MenuIcon, Close as CloseIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  CloudUpload as UploadIcon,
  Send as SendIcon,
  NoteAdd as SubmitIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import LoginDialog from './LoginDialog';
import { useAuth } from '../../contexts/AuthContext';

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

/* ─── NAVIGATION DEFINITIONS ────────────────────────────────────── */
const publicNav = [
  { text: 'About', path: '/about' },
  { text: 'Research', path: '/research' },
  { text: 'Projects', path: '/projects' },
  { text: 'News', path: '/news' },
  { text: 'Gallery', path: '/gallery' },
  { text: 'Albums', path: '/albums' },
];

const authNav = [
  { text: 'BTP Portal', path: '/btp' },
];

/* ─── STYLES ────────────────────────────────────────────────────── */
const HeaderStyles = () => (
  <style>{`
    @keyframes vicas-overlay-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes vicas-slide-up {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .vicas-nav-link {
      position: relative;
      font-family: ${sysFont};
      font-size: 0.84rem;
      font-weight: 500;
      text-transform: none;
      padding: 6px 14px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    .vicas-nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      width: 18px;
      height: 2px;
      border-radius: 1px;
      transform: translateX(-50%) scaleX(0);
      transition: transform 0.25s ease;
    }
    .vicas-nav-link.active::after {
      transform: translateX(-50%) scaleX(1);
    }
    .vicas-mobile-link {
      display: block;
      padding: 16px 0;
      font-family: ${sysFont};
      font-size: 1.05rem;
      font-weight: 600;
      color: ${C.ink2};
      text-decoration: none;
      border-bottom: 1px solid ${C.border};
      transition: all 0.2s ease;
    }
    .vicas-mobile-link:hover,
    .vicas-mobile-link.active {
      color: ${C.navy};
      padding-left: 6px;
    }
    .vicas-mobile-link.active {
      border-bottom-color: ${C.sky};
    }
    .vicas-dd-item {
      font-family: ${sysFont} !important;
      font-size: 0.88rem !important;
      color: ${C.ink2} !important;
      padding: 10px 20px !important;
      gap: 10px !important;
      transition: background 0.15s !important;
    }
    .vicas-dd-item:hover {
      background: ${C.bg} !important;
      color: ${C.navy} !important;
    }
  `}</style>
);

/* ─── HEADER COMPONENT ──────────────────────────────────────────── */
const Header = () => {
  const { user, isAuthenticated, isAdmin, login, logout, role } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorUser, setAnchorUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleOpenUser = (e) => setAnchorUser(e.currentTarget);
  const handleCloseUser = () => setAnchorUser(null);

  async function handleRequestAdmin() {
    handleCloseUser();
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_BASE}/api/gallery/request-admin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request');
      setSnackbar({ open: true, message: 'Admin access request submitted!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  }

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;
  const navItems = isAuthenticated ? [...publicNav, ...authNav] : publicNav;
  const isActive = (path) => location.pathname === path;

  const getRoleColor = () => {
    if (role === 'super_admin') return { bg: 'rgba(10,37,64,0.1)', color: C.navy, border: 'rgba(10,37,64,0.2)' };
    if (role === 'admin') return { bg: 'rgba(217,119,6,0.1)', color: '#D97706', border: 'rgba(217,119,6,0.2)' };
    return { bg: C.bg, color: C.ink3, border: C.border };
  };

  return (
    <>
      <HeaderStyles />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: transparent ? 'transparent' : 'rgba(255,255,255,0.97)',
          backdropFilter: transparent ? 'none' : 'blur(12px)',
          borderBottom: transparent ? 'none' : `1px solid ${C.border}`,
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: transparent ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Toolbar sx={{
          height: { xs: 64, md: 72 },
          maxWidth: '1300px',
          width: '100%',
          margin: '0 auto',
          px: { xs: 2, md: 4 },
        }}>
          {/* ── Logo ── */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              fontFamily: sysFont, fontWeight: 800,
              fontSize: { xs: '1.15rem', md: '1.3rem' },
              color: transparent ? C.white : C.navy,
              textDecoration: 'none', letterSpacing: '-0.02em',
              transition: 'color 0.35s ease',
              flexShrink: 0,
            }}
          >
            VICAS Lab
          </Typography>

          {/* ── Desktop Nav (centered) ── */}
          <Box sx={{
            flexGrow: 1,
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            gap: 0.5,
          }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                className={`vicas-nav-link ${isActive(item.path) ? 'active' : ''}`}
                sx={{
                  color: transparent
                    ? (isActive(item.path) ? C.white : 'rgba(255,255,255,0.78)')
                    : (isActive(item.path) ? C.navy : C.ink3),
                  fontWeight: isActive(item.path) ? 700 : 500,
                  '&::after': { bgcolor: transparent ? C.sky : C.navy },
                  '&:hover': {
                    color: transparent ? C.white : C.navy,
                    bgcolor: transparent ? 'rgba(255,255,255,0.08)' : 'rgba(10,37,64,0.04)',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* ── Right Controls ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { xs: 'auto', md: 0 }, flexShrink: 0 }}>
            {!isAuthenticated ? (
              <Button
                onClick={() => setLoginOpen(true)}
                sx={{
                  fontFamily: sysFont, fontWeight: 600, fontSize: '0.82rem',
                  color: transparent ? C.white : C.navy,
                  border: `1.5px solid ${transparent ? 'rgba(255,255,255,0.3)' : C.navy}`,
                  borderRadius: '8px', px: 2.5, py: 0.8, textTransform: 'none',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: transparent ? C.white : C.navy,
                    bgcolor: transparent ? 'rgba(255,255,255,0.1)' : 'rgba(10,37,64,0.05)',
                  },
                }}
              >
                Sign In
              </Button>
            ) : (
              <>
                <Button
                  component={Link} to="/submit"
                  sx={{
                    display: { xs: 'none', lg: 'inline-flex' },
                    fontFamily: sysFont, fontWeight: 600, fontSize: '0.8rem',
                    color: C.white, bgcolor: C.sky, borderRadius: '8px',
                    px: 2.5, py: 0.8, textTransform: 'none',
                    '&:hover': { bgcolor: '#0096B4' },
                  }}
                >
                  Submit Content
                </Button>

                <Tooltip title={user?.name || 'Account'}>
                  <IconButton onClick={handleOpenUser} sx={{ p: 0 }}>
                    <Avatar
                      src={user?.photoURL}
                      sx={{
                        width: 36, height: 36, bgcolor: C.navy,
                        fontSize: '0.85rem', fontWeight: 700,
                        border: `2px solid ${transparent ? 'rgba(255,255,255,0.3)' : C.border}`,
                        transition: 'border-color 0.25s ease',
                      }}
                    >
                      {user?.name?.[0]}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                {/* User Dropdown */}
                <Menu
                  anchorEl={anchorUser}
                  open={Boolean(anchorUser)}
                  onClose={handleCloseUser}
                  disableScrollLock
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      mt: 1.5, borderRadius: '12px',
                      border: `1px solid ${C.border}`,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                      minWidth: 220, overflow: 'hidden',
                    },
                  }}
                >
                  <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${C.border}` }}>
                    <Typography sx={{ fontFamily: sysFont, fontWeight: 700, fontSize: '0.95rem', color: C.navy }}>
                      {user?.name}
                    </Typography>
                    <Typography sx={{ fontFamily: sysFont, fontSize: '0.75rem', color: C.ink3, mt: 0.3 }}>
                      {user?.email}
                    </Typography>
                    {role && (
                      <Chip
                        label={role.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          mt: 1, height: 22, fontSize: '0.65rem',
                          fontWeight: 700, letterSpacing: '0.05em',
                          bgcolor: getRoleColor().bg, color: getRoleColor().color,
                          border: `1px solid ${getRoleColor().border}`,
                        }}
                      />
                    )}
                  </Box>
                  {isAdmin && (
                    <MenuItem component={Link} to="/admin" onClick={handleCloseUser} className="vicas-dd-item">
                      <AdminIcon sx={{ fontSize: 18, color: C.ink3 }} /> Admin Panel
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/upload" onClick={handleCloseUser} className="vicas-dd-item">
                    <UploadIcon sx={{ fontSize: 18, color: C.ink3 }} /> Upload Photo
                  </MenuItem>
                  <MenuItem component={Link} to="/submit" onClick={handleCloseUser} className="vicas-dd-item"
                    sx={{ display: { lg: 'none' } }}
                  >
                    <SubmitIcon sx={{ fontSize: 18, color: C.ink3 }} /> Submit Content
                  </MenuItem>
                  {role === 'user' && (
                    <MenuItem onClick={handleRequestAdmin} className="vicas-dd-item">
                      <SendIcon sx={{ fontSize: 18, color: C.ink3 }} /> Request Admin
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem
                    onClick={() => { logout(); handleCloseUser(); }}
                    className="vicas-dd-item"
                    sx={{ color: '#DC2626 !important' }}
                  >
                    <LogoutIcon sx={{ fontSize: 18, color: '#DC2626' }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Mobile hamburger */}
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{
                display: { md: 'none' },
                color: transparent ? C.white : C.navy,
                ml: 0.5,
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>

        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={(me) => login(me)} />
      </AppBar>

      {/* ─── Full-Screen Mobile Overlay ──────────────────────────── */}
      {mobileOpen && (
        <Box
          sx={{
            position: 'fixed', inset: 0, zIndex: 1200,
            bgcolor: C.white,
            animation: 'vicas-overlay-in 0.25s ease',
            display: { md: 'none' },
            overflowY: 'auto',
          }}
        >
          {/* Mobile top bar */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 64, px: 2, borderBottom: `1px solid ${C.border}`,
          }}>
            <Typography sx={{ fontFamily: sysFont, fontWeight: 800, fontSize: '1.15rem', color: C.navy }}>
              VICAS Lab
            </Typography>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: C.navy }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Mobile nav sections */}
          <Box sx={{ px: 3, pt: 3, pb: 6 }}>
            {/* Explore section */}
            <Typography sx={{
              fontFamily: sysFont, fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: C.sky, mb: 1,
            }}>
              Explore
            </Typography>
            {publicNav.map((item, i) => (
              <Link
                key={item.text}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`vicas-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {item.text}
              </Link>
            ))}

            {/* Auth section */}
            {isAuthenticated && (
              <Box sx={{ mt: 4 }}>
                <Typography sx={{
                  fontFamily: sysFont, fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: C.sky, mb: 1,
                }}>
                  Your Account
                </Typography>
                {authNav.map((item, i) => (
                  <Link
                    key={item.text}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`vicas-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                    style={{ animationDelay: `${(publicNav.length + i) * 0.04}s` }}
                  >
                    {item.text}
                  </Link>
                ))}
                <Link
                  to="/submit"
                  onClick={() => setMobileOpen(false)}
                  className={`vicas-mobile-link ${isActive('/submit') ? 'active' : ''}`}
                >
                  Submit Content
                </Link>
                <Link
                  to="/upload"
                  onClick={() => setMobileOpen(false)}
                  className={`vicas-mobile-link ${isActive('/upload') ? 'active' : ''}`}
                >
                  Upload Photo
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={`vicas-mobile-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    Admin Panel
                  </Link>
                )}
              </Box>
            )}

            {/* Bottom actions */}
            <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {!isAuthenticated ? (
                <Button
                  fullWidth
                  onClick={() => { setMobileOpen(false); setLoginOpen(true); }}
                  sx={{
                    bgcolor: C.navy, color: C.white, py: 1.8,
                    borderRadius: '10px', fontFamily: sysFont,
                    fontWeight: 700, fontSize: '0.95rem', textTransform: 'none',
                    '&:hover': { bgcolor: C.navyDark },
                  }}
                >
                  Sign In
                </Button>
              ) : (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  p: 2, bgcolor: C.bg, borderRadius: '12px',
                  border: `1px solid ${C.border}`,
                }}>
                  <Avatar src={user?.photoURL} sx={{ width: 44, height: 44, bgcolor: C.navy, fontWeight: 700 }}>
                    {user?.name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: sysFont, fontWeight: 700, fontSize: '0.95rem', color: C.navy }}>
                      {user?.name}
                    </Typography>
                    <Typography sx={{ fontFamily: sysFont, fontSize: '0.75rem', color: C.ink3 }}>
                      {role?.replace('_', ' ')}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    sx={{
                      color: '#DC2626', fontFamily: sysFont,
                      fontWeight: 700, fontSize: '0.8rem', textTransform: 'none',
                      minWidth: 'auto',
                    }}
                  >
                    Sign Out
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '8px', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;