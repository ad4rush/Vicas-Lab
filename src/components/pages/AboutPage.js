import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Amit_Kumar_Ratrey from '../../Photos/Student/Amit Kumar Ratrey.jpeg';
import Anuj_Grover_Profile from '../../Photos/Student/Anuj Grover.jpeg'; 
import Anushree_Vardish from '../../Photos/Student/Anushree Vardish.jpeg';
import Ashutosh_Singh from '../../Photos/Student/Ashutosh Singh.jpeg';
import Belal_Iqbal from '../../Photos/Student/Belal Iqbal.jpeg';
import Manish_Tikyani from '../../Photos/Student/Manish Tikyani.jpeg';
import Mohammad_Umar_Salim from '../../Photos/Student/Mohammad Umar Salim.jpeg';
import Prashasti from '../../Photos/Student/Prashasti.jpeg';
import Sadia_Naaz from '../../Photos/Student/Sadia Naaz.jpeg';
import Sonia_Bondwal from '../../Photos/Student/Sonia Bondwal.jpeg';
import main_3 from '../../Photos/main_3.jpeg';
import Dr_Anuj_Grover from '../../Photos/Professor/Dr. Anuj Grover.jpeg';

import Dr_AV_Subramanyam from '../../Photos/Professor/Dr. AV Subramanyam.jpeg';
import Dr_Pravesh_Biyani from '../../Photos/Professor/Dr. Pravesh Biyani.jpeg';
import Dr_Ranjan_Bose from '../../Photos/Professor/Dr. Ranjan Bose.jpeg';
import Dr_Ranjitha_Prasad from '../../Photos/Professor/Dr. Ranjitha Prasad.jpeg';
import Dr_Shobha_Sundar_Ram from '../../Photos/Professor/Dr. Shobha Sundar Ram.jpeg';
import Dr_Sujey_Deb from '../../Photos/Professor/Dr. Sujey Deb.jpeg';
import Dr_Sumit_J_Darak from '../../Photos/Professor/Dr. Sumit J Darak.jpeg';

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

const GlobalStyles = () => (
  <style>{`
    @keyframes heroFadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes heroPulse {
      0%, 100% { opacity: 0.04; }
      50% { opacity: 0.08; }
    }
    .hero-fade { animation: heroFadeUp 0.7s ease both; }
    .hero-fade-d1 { animation-delay: 0.15s; }
    .hero-fade-d2 { animation-delay: 0.3s; }

    .vicas-member-card {
      background: ${C.white};
      border: 1px solid ${C.border};
      border-radius: 16px;
      padding: 32px 24px;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: 100%;
    }
    .vicas-member-card:hover {
      box-shadow: 0 12px 32px rgba(10, 37, 64, 0.08);
      border-color: ${C.sky};
      transform: translateY(-4px);
    }
    .vicas-member-avatar {
      transition: all 0.3s ease;
      border: 2px solid ${C.border};
    }
    .vicas-member-card:hover .vicas-member-avatar {
      border-color: ${C.sky} !important;
      transform: scale(1.05);
    }

    @media (max-width: 1024px) {
      .vicas-about-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .vicas-welcome-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
    }
    @media (max-width: 768px) {
      .vicas-about-grid { grid-template-columns: 1fr !important; }
      .director-inner { flex-direction: column !important; text-align: center !important; }
      .director-info { align-items: center !important; }
    }
  `}</style>
);

/* ─── DATA ──────────────────────────────────────────────────────── */
const TEAM = {
  director: {
    name: 'Dr. Anuj Grover',
    title: 'Principal Investigator',
    role: 'Associate Professor, ECE',
    desc: 'Leading research in ultra low-power VLSI design, in-memory architectures, and reliable hardware systems.',
    img: Dr_Anuj_Grover,
  },
  faculty: [
    { name: 'Dr. A V Subramanyam', title: 'Professor, ECE', img: Dr_AV_Subramanyam },
    { name: 'Dr. Pravesh Biyani', title: 'Professor, ECE', img: Dr_Pravesh_Biyani },
    { name: 'Dr. Ranjan Bose', title: 'Director, IIITD', img: Dr_Ranjan_Bose },
    { name: 'Dr. Ranjitha Prasad', title: 'Professor, ECE', img: Dr_Ranjitha_Prasad },
    { name: 'Dr. Shobha Sundar Ram', title: 'Professor, ECE', img: Dr_Shobha_Sundar_Ram },
    { name: 'Dr. Sujay Deb', title: 'Professor, ECE', img: Dr_Sujey_Deb },
    { name: 'Dr. Sumit J Darak', title: 'Professor, ECE', img: Dr_Sumit_J_Darak },
  ],
  students: [
    { name: 'Amit Kumar Ratrey', title: 'Research Student', img: Amit_Kumar_Ratrey },
    { name: 'Anushree Vardish', title: 'Research Student', img: Anushree_Vardish },
    { name: 'Ashutosh Singh', title: 'Research Student', img: Ashutosh_Singh },
    { name: 'Belal Iqbal', title: 'Research Student', img: Belal_Iqbal },
    { name: 'Manish Tikyani', title: 'Research Student', img: Manish_Tikyani },
    { name: 'Md. Umar Salim', title: 'Research Student', img: Mohammad_Umar_Salim },
    { name: 'Prashasti', title: 'Research Student', img: Prashasti },
    { name: 'Sadia Naaz', title: 'Research Student', img: Sadia_Naaz },
    { name: 'Sonia Bondwal', title: 'Research Student', img: Sonia_Bondwal },
  ],
};

/* ─── SHARED MICRO-COMPONENTS ───────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: sysFont,
    fontSize: '0.75rem', 
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: C.sky, 
    textTransform: 'uppercase',
    margin: '0 0 12px 0',
  }}>{children}</p>
);

const SectionTitle = ({ children, style = {} }) => (
  <h2 style={{
    fontFamily: sysFont,
    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
    fontWeight: 800, color: C.navy,
    lineHeight: 1.15, margin: 0,
    ...style,
  }}>{children}</h2>
);

const MemberCard = ({ member, size = 'large' }) => (
  <div className="vicas-member-card">
    <div className="vicas-member-avatar" style={{
      width: size === 'large' ? '110px' : '85px',
      height: size === 'large' ? '110px' : '85px',
      borderRadius: '50%',
      overflow: 'hidden',
      marginBottom: '20px',
    }}>
      <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <Typography sx={{
      fontFamily: sysFont,
      fontSize: size === 'large' ? '1.15rem' : '1rem',
      fontWeight: 700, color: C.navy,
      lineHeight: 1.2, mb: 0.5
    }}>{member.name}</Typography>
    <Typography sx={{
      fontFamily: sysFont,
      fontSize: '0.65rem',
      fontWeight: 700,
      color: C.sky,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }}>{member.title}</Typography>
  </div>
);

/* ─── PAGE COMPONENT ────────────────────────────────────────────── */
const AboutPage = () => {
  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '60vh', minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_3})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        
        {/* Dark overlay — Same as Home */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(6,22,38,0.88) 0%, rgba(6,22,38,0.72) 50%, rgba(6,22,38,0.92) 100%)',
        }} />

        {/* Decorative grid pattern — Same as Home */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'heroPulse 6s ease-in-out infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px', textAlign: 'center', maxWidth: '900px' }}>
          <div className="hero-fade">
            <SectionLabel>Network & Collaborations</SectionLabel>
          </div>
          <h1 className="hero-fade hero-fade-d1" style={{
            fontFamily: sysFont,
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            fontWeight: 800, color: '#FFFFFF',
            lineHeight: 1.08, letterSpacing: '-0.03em',
            margin: '0 0 24px 0'
          }}>
            About the<br />VICAS Lab
          </h1>
          <div className="hero-fade hero-fade-d1" style={{ width: 48, height: 3, background: C.sky, margin: '0 auto 32px', borderRadius: 2 }} />
          <p className="hero-fade hero-fade-d2" style={{ 
            fontFamily: sysFont, fontSize: '1.1rem', lineHeight: 1.7, 
            color: 'rgba(255,255,255,0.75)', fontWeight: 400, margin: '0 auto', maxWidth: '600px' 
          }}>
            A multidisciplinary research group at IIIT Delhi dedicated to pioneering efficient hardware systems and low-power VLSI circuitry.
          </p>
        </div>
      </section>

      {/* Mission */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: C.white }}>
        <Container maxWidth="lg">
          <Box className="vicas-welcome-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 6, md: 10 }, alignItems: 'center' }}>
            <div>
              <SectionLabel>Our Mission</SectionLabel>
              <SectionTitle>Pioneering the Future of VLSI</SectionTitle>
              <Box sx={{ width: 40, height: 4, bgcolor: C.sky, my: 4, borderRadius: 2 }} />
              <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.8, color: C.ink2, mb: 3 }}>
                The VLSI Circuits and Systems (VICAS) Lab in the Department of Electronics and Communication Engineering at IIIT Delhi is dedicated to cutting-edge research in hardware design. Our work addresses the critical challenges of energy efficiency, reliability, and security in modern computing paradigms.
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.8, color: C.ink2 }}>
                From modeling aging effects to innovating sub-threshold SRAM architectures and processing-in-memory (PIM) concepts, our group strives to make intelligent edge devices a reality.
              </Typography>
            </div>
            <Box sx={{ position: 'relative', height: { xs: 300, md: 400 } }}>
               <Box sx={{ position: 'absolute', top: 20, right: 0, width: '85%', height: '85%', bgcolor: C.bg, border: `1px solid ${C.border}`, borderRadius: '12px', zIndex: 0 }} />
               <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 1, boxShadow: '0 12px 40px rgba(10,37,64,0.12)', border: `3px solid ${C.white}` }}>
                 <img src={main_3} alt="VICAS Lab" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Principal Investigator — Home style */}
      <Box sx={{ py: { xs: 10, md: 12 }, bgcolor: C.navy, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box className="director-inner" sx={{
            display: 'flex', gap: { xs: 4, md: 6 }, alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', p: { xs: 4, md: 6 }
          }}>
            <Box sx={{ flexShrink: 0 }}>
              <Box sx={{ width: { xs: 120, md: 160 }, height: { xs: 120, md: 160 }, borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)' }}>
                <img src={TEAM.director.img} alt={TEAM.director.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            </Box>
            <Box className="director-info" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <SectionLabel>Lab Director</SectionLabel>
              <Typography sx={{ fontFamily: sysFont, fontWeight: 800, color: C.white, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.2 }}>
                {TEAM.director.name}
              </Typography>
              <Typography sx={{ fontFamily: sysFont, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {TEAM.director.role}
              </Typography>
              <Typography sx={{ fontFamily: sysFont, fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontStyle: 'italic', mt: 1 }}>
                "{TEAM.director.desc}"
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Faculty */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: C.bg, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <SectionLabel>Collaborations</SectionLabel>
            <SectionTitle>Faculty Collaborators</SectionTitle>
          </Box>
          <Box className="vicas-about-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {TEAM.faculty.map((f, i) => (
              <MemberCard key={i} member={f} size="large" />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Students */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: C.white }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <SectionLabel>The Group</SectionLabel>
            <SectionTitle>Research Students</SectionTitle>
          </Box>
          <Box className="vicas-about-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2.5 }}>
            {TEAM.students.map((s, i) => (
              <MemberCard key={i} member={s} size="small" />
            ))}
          </Box>
        </Container>
      </Box>

    </div>
  );
};

export default AboutPage;