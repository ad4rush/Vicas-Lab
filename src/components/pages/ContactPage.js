import React from 'react';
import { Container, Box, Typography, Grid } from '@mui/material';
import {
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import main_4 from '../../Photos/main_4.jpeg';

const C = {
  white: '#FFFFFF',
  navy: '#0A2540',
  navyDark: '#061626',
  sky: '#00B4D8',
  border: '#E5E7EB',
  bg: '#F8FAFC',
  ink: '#111827',
  ink2: '#374151',
  ink3: '#6B7280',
};

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: sysFont, fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.15em', color: C.sky, textTransform: 'uppercase', margin: '0 0 10px 0',
  }}>{children}</p>
);

const ContactItem = ({ icon, label, value, href }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 4 }}>
    <Box sx={{
      width: 48, height: 48, bgcolor: 'rgba(0,180,216,0.08)', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      border: '1px solid rgba(0,180,216,0.2)'
    }}>
      {React.cloneElement(icon, { sx: { color: C.sky, fontSize: 22 } })}
    </Box>
    <div>
      <p style={{ fontFamily: sysFont, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.ink3, margin: '0 0 4px 0' }}>{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: sysFont, fontWeight: 600, color: C.navy, fontSize: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {value} <OpenInNewIcon sx={{ fontSize: 14, color: C.sky }} />
        </a>
      ) : (
        <p style={{ fontFamily: sysFont, fontWeight: 600, color: C.navy, fontSize: '1rem', margin: 0 }}>{value}</p>
      )}
    </div>
  </Box>
);

const ContactPage = () => {
  return (
    <div style={{ fontFamily: sysFont, background: C.bg, minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', height: '40vh', minHeight: '300px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_4})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.87)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
          <SectionLabel>Reach Out</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>Get in<br />Touch</h1>
        </div>
      </section>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={8}>

          {/* Left: Contact Details */}
          <Grid item xs={12} md={5}>
            <SectionLabel>Contact Information</SectionLabel>
            <h2 style={{ fontFamily: sysFont, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: C.navy, margin: '0 0 40px 0', lineHeight: 1.2 }}>
              We'd love to hear from you
            </h2>

            <ContactItem
              icon={<EmailIcon />}
              label="Email"
              value="anuj@iiitd.ac.in"
              href="mailto:anuj@iiitd.ac.in"
            />
            <ContactItem
              icon={<PhoneIcon />}
              label="Phone"
              value="+91-11-26907494"
            />
            <ContactItem
              icon={<LocationIcon />}
              label="Address"
              value="VLSI Circuits & Systems Lab, IIIT-Delhi, Okhla Phase III, New Delhi — 110020"
              href="https://maps.google.com/?q=IIIT+Delhi"
            />
          </Grid>

          {/* Right: Map + Office Hours */}
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 5, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(10,37,64,0.07)' }}>
              <iframe
                title="IIIT Delhi Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.9541613348707!2d77.26879497506386!3d28.54503388732978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3e564daac1d%3A0x2c582e340e7bc556!2sIndraprastha%20Institute%20of%20Information%20Technology%20Delhi!5e0!3m2!1sen!2sin!4v1712941234567"
                width="100%"
                height="340"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Box>

            <Box sx={{ p: 4, bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', boxShadow: '0 4px 16px rgba(10,37,64,0.04)' }}>
              <SectionLabel>Office Hours</SectionLabel>
              <h3 style={{ fontFamily: sysFont, fontSize: '1.3rem', fontWeight: 800, color: C.navy, margin: '0 0 20px 0' }}>When to Reach Us</h3>
              {[
                { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM IST' },
                { day: 'Saturday', time: '10:00 AM – 2:00 PM IST' },
                { day: 'Sunday', time: 'Closed' },
              ].map(({ day, time }) => (
                <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: `1px solid ${C.border}` }}>
                  <Typography sx={{ fontFamily: sysFont, fontWeight: 600, color: C.ink2 }}>{day}</Typography>
                  <Typography sx={{ fontFamily: sysFont, color: C.ink3, fontWeight: 500 }}>{time}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default ContactPage;
