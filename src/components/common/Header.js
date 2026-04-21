import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, 
  List, ListItem, ListItemButton, ListItemText, Snackbar, Alert,
  Avatar, Menu, MenuItem, Divider, Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, Close as CloseIcon, 
  KeyboardArrowDown as ExpandIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import LoginDialog from './LoginDialog';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

/* ─── DESIGN TOKENS (Navy Theme) ─────────────────────────────────── */
const C = {
  white:    '#FFFFFF',
  navy:     '#0A2540',
  navyDark: '#061626',
  sky:      '#00B4D8',
  border:   '#E5E7EB',
  ink:      '#111827',
  ink2:     '#374151',
  ink3:     '#6B7280',
};

const navItemsMain = [
  { text: 'About', path: '/about' },
  { text: 'Research', path: '/research' },
  { text: 'Projects', path: '/projects' },
  { text: 'News', path: '/news' },
  { text: 'Gallery', path: '/gallery' },
  { text: 'Albums', path: '/albums' },
  { text: 'BTP Portal', path: '/btp' },
];

const Header = () => {
  const { user, isAuthenticated, isAdmin, login, logout, role } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [anchorMore, setAnchorMore] = useState(null);
  const [anchorUser, setAnchorUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenMore = (e) => setAnchorMore(e.currentTarget);
  const handleCloseMore = () => setAnchorMore(null);
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
  const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

  return (
    <>
      <style>{`
        .header-nav-link {
          font-family: ${sysFont} !important;
          font-size: 0.9rem !important;
          font-weight: 500 !important;
          text-transform: none !important;
          color: ${C.ink2} !important;
          padding: 8px 16px !important;
          transition: all 0.25s ease !important;
        }
        .header-nav-link:hover {
          color: ${C.navy} !important;
          background: rgba(10, 37, 64, 0.05) !important;
        }

        .dropdown-menu .MuiPaper-root {
          border: 1px solid ${C.border} !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
          border-radius: 4px !important;
        }
        .dropdown-item {
          font-family: ${sysFont} !important;
          font-size: 0.9rem !important;
          color: ${C.ink2} !important;
          padding: 12px 24px !important;
        }
        .dropdown-item:hover {
          background: ${C.bg} !important;
          color: ${C.navy} !important;
        }
      `}</style>

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: scrolled || !isHome ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
          boxShadow: scrolled || !isHome ? '0 1px 0 rgba(0,0,0,0.05)' : 'none',
          backdropFilter: scrolled || !isHome ? 'blur(8px)' : 'none',
          transition: 'all 0.4s ease',
          borderBottom: scrolled || !isHome ? `1px solid ${C.border}` : 'none',
        }}
      >
        <Toolbar sx={{ 
          height: { xs: 64, md: 80 }, 
          maxWidth: '1300px', 
          width: '100%', 
          margin: '0 auto',
          px: { xs: 2, md: 'clamp(24px, 5vw, 64px)' } 
        }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 1, md: 0 } }}>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                color: (scrolled || !isHome) ? C.navy : C.white,
                textDecoration: 'none',
                letterSpacing: '-0.02em',
              }}
            >
              VICAS Lab
            </Typography>
          </Box>

          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', md: 'flex' }, 
            justifyContent: 'center',
            gap: 1
          }}>
            {navItemsMain.map((item) => (
              <Button 
                key={item.text}
                component={Link}
                to={item.path}
                className="header-nav-link"
                style={{ color: (scrolled || !isHome) ? C.ink : 'rgba(255,255,255,0.9)' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
            {!isAuthenticated ? (
              <Button 
                onClick={() => setLoginOpen(true)}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: (scrolled || !isHome) ? C.navy : C.white,
                  border: `1px solid ${(scrolled || !isHome) ? C.navy : 'rgba(255,255,255,0.3)'}`,
                  px: 3, py: 1,
                  borderRadius: '4px',
                  '&:hover': {
                    borderColor: C.navy,
                    bgcolor: 'rgba(10, 37, 64, 0.05)'
                  }
                }}
              >
                Login
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button 
                  component={Link}
                  to="/submit"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: C.white,
                    background: C.sky,
                    px: 3, py: 1,
                    borderRadius: '4px',
                    display: { xs: 'none', md: 'flex' },
                    '&:hover': {
                      background: '#0096B4'
                    }
                  }}
                >
                  Submit Content
                </Button>
                <Tooltip title={user.name}>
                  <IconButton onClick={handleOpenUser} sx={{ p: 0.5, border: `1px solid ${C.border}` }}>
                    <Avatar 
                      src={user.photoURL} 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: C.navy,
                        borderRadius: '4px'
                      }}
                    >
                      {user.name && user.name[0]}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorUser}
                  open={Boolean(anchorUser)}
                  onClose={handleCloseUser}
                  className="dropdown-menu"
                  disableScrollLock
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <Box sx={{ px: 3, py: 2, minWidth: 200 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.navy }}>{user.name}</Typography>
                    <Typography sx={{ fontSize: '11px', color: C.ink3, textTransform: 'uppercase', mt: 0.5 }}>{role && role.replace('_', ' ')}</Typography>
                  </Box>
                  <Divider />
                  {isAdmin && (
                    <MenuItem component={Link} to="/admin" onClick={handleCloseUser} className="dropdown-item">
                      <AdminIcon sx={{ fontSize: 18, mr: 1.5 }} /> Admin Panel
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/upload" onClick={handleCloseUser} className="dropdown-item">
                    <UploadIcon sx={{ fontSize: 18, mr: 1.5 }} /> Upload Photo
                  </MenuItem>
                  {role === 'user' && (
                    <MenuItem onClick={handleRequestAdmin} className="dropdown-item">
                      <SendIcon sx={{ fontSize: 18, mr: 1.5 }} /> Request Admin
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={() => { logout(); handleCloseUser(); }} className="dropdown-item" sx={{ color: '#ef4444 !important' }}>
                    <LogoutIcon sx={{ fontSize: 18, mr: 1.5 }} /> Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}

            <IconButton
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, color: (scrolled || !isHome) ? C.navy : C.white }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>

            <Button
              component={Link}
              to="/contact"
              sx={{
                display: { xs: 'none', lg: 'inline-flex' },
                background: C.navy,
                color: C.white,
                fontWeight: 600,
                fontSize: '0.8rem',
                px: 3, py: 1.2,
                borderRadius: '4px',
                '&:hover': { background: C.navyDark }
              }}
            >
              Get in Touch
            </Button>
          </Box>
        </Toolbar>

        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={(me) => login(me)} />
      </AppBar>

      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          zIndex: 1100,
          '& .MuiDrawer-paper': { width: '100%', background: C.white, pt: 10, pb: 4 },
        }}
      >
        <List sx={{ px: 3 }}>
          {navItemsMain.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path} onClick={handleDrawerToggle} sx={{ py: 1.5 }}>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600, color: C.navy }} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ mt: 3 }}>
            <Button fullWidth component={Link} to="/contact" onClick={handleDrawerToggle} sx={{ background: C.navy, color: C.white, py: 2 }}>
              Contact Us
            </Button>
          </ListItem>
        </List>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 0 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;