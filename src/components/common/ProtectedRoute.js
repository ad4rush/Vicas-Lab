import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

/**
 * ProtectedRoute - wraps a route to require authentication and optionally specific roles.
 * 
 * Usage:
 *   <Route path="/upload" element={<ProtectedRoute><GalleryUpload /></ProtectedRoute>} />
 *   <Route path="/admin" element={<ProtectedRoute roles={['admin','super_admin']}><AdminPanel /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return (
      <Box sx={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '60vh', p: 3 
      }}>
        <Paper sx={{ 
          p: 6, textAlign: 'center', maxWidth: 480, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}>
          <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page.
          </Typography>
          <Button variant="contained" href="/" sx={{ borderRadius: '50px', px: 4 }}>
            Go Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
}
