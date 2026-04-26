import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, CircularProgress, Box, Alert } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
const C = { navy: '#0A2540', bg: '#F8FAFC', ink: '#111827', border: '#E5E7EB', success: '#059669' };

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      // Prompt user to log in if they aren't, redirect back here after login
      localStorage.setItem('redirectAfterLogin', `/invite/${token}`);
      navigate('/');
      return;
    }

    const acceptInvite = async () => {
      try {
        const authToken = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/api/btp/accept-invite`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ token })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          setMessage('You have successfully joined the project!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to accept invitation.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [user, token, navigate]);

  if (!user) return null; // Wait for redirect to happen

  return (
    <Container maxWidth="sm" sx={{ py: 12, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <Box>
            <CircularProgress size={48} sx={{ color: C.navy, mb: 3 }} />
            <Typography sx={{ color: C.ink, fontWeight: 600 }}>Processing invitation...</Typography>
          </Box>
        ) : status === 'success' ? (
          <Box>
            <CheckCircleIcon sx={{ fontSize: 64, color: C.success, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: C.navy, mb: 1 }}>Success!</Typography>
            <Typography sx={{ color: C.ink, mb: 4 }}>{message}</Typography>
            <Button variant="contained" onClick={() => navigate('/btp')} sx={{ bgcolor: C.navy, borderRadius: '8px', px: 4 }}>
              Go to BTP Portal
            </Button>
          </Box>
        ) : (
          <Box>
            <ErrorIcon sx={{ fontSize: 64, color: '#DC2626', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: C.navy, mb: 1 }}>Invitation Failed</Typography>
            <Typography sx={{ color: C.ink, mb: 4 }}>{message}</Typography>
            <Button variant="outlined" onClick={() => navigate('/btp')} sx={{ color: C.navy, borderColor: C.border, borderRadius: '8px', px: 4 }}>
              Return to Portal
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
