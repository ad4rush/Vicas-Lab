import React from 'react';
import { Box } from '@mui/material';
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

/* ─── GLOBAL STYLES INJECTION ───────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    .vicas-member-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: default;
      border-radius: 8px;
    }
    .vicas-member-card:hover {
      border-color: ${C.sky} !important;
      transform: translateY(-6px);
      box-shadow: 0 16px 48px rgba(10, 37, 64, 0.1);
    }
    .vicas-member-card:hover .vicas-member-avatar {
      border-color: ${C.sky} !important;
    }

    @media (max-width: 1024px) {
      .vicas-about-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .vicas-welcome-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
    }
    @media (max-width: 768px) {
      .vicas-about-grid { grid-template-columns: 1fr !important; }
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
  <div className="vicas-member-card" style={{
    background: C.white,
    border: `1px solid ${C.border}`,
    padding: size === 'large' ? '40px' : '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    height: '100%',
  }}>
    <div className="vicas-member-avatar" style={{
      width: size === 'large' ? '120px' : '90px',
      height: size === 'large' ? '120px' : '90px',
      border: `1px solid ${C.border}`,
      borderRadius: '50%',
      padding: '4px',
      overflow: 'hidden',
      marginBottom: '20px',
      transition: 'all 0.3s ease',
    }}>
      <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
    </div>
    <h3 style={{
      fontFamily: sysFont,
      fontSize: size === 'large' ? '1.25rem' : '1.1rem',
      fontWeight: 700, color: C.navy,
      margin: '0 0 6px 0'
    }}>{member.name}</h3>
    <p style={{
      fontFamily: sysFont,
      fontSize: '0.7rem',
      fontWeight: 700,
      color: C.sky,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      margin: 0
    }}>{member.title}</p>
  </div>
);

/* ─── PAGE COMPONENT ────────────────────────────────────────────── */
const AboutPage = () => {
  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '60vh', minHeight: '450px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_3})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.8)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(32px, 7vw, 100px)', maxWidth: '900px' }}>
          <SectionLabel>Network & Collaborations</SectionLabel>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800, color: '#FFFFFF',
            lineHeight: 1.1, margin: '0 0 24px 0'
          }}>About the<br />VICAS Lab</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', fontWeight: 400, margin: 0, maxWidth: '580px' }}>
            A multidisciplinary research group at IIIT Delhi dedicated to pioneering efficient hardware systems and low-power VLSI circuitry.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '100px 0', background: C.white }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px)' }}>
          <div className="vicas-welcome-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '100px', alignItems: 'start' }}>
            
            <div>
              <SectionLabel>Our Mission</SectionLabel>
              <SectionTitle>Pioneering the Future of VLSI</SectionTitle>
              <div style={{ width: '40px', height: '4px', background: C.sky, margin: '24px 0 32px 0' }} />
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: C.ink2, margin: '0 0 24px 0' }}>
                The VLSI Circuits and Systems (VICAS) Lab in the Department of Electronics and Communication Engineering at IIIT Delhi is dedicated to cutting-edge research in hardware design. Our work addresses the critical challenges of energy efficiency, reliability, and security in modern computing paradigms.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: C.ink2, margin: 0 }}>
                From modeling aging effects like NBTI and HCI to innovating sub-threshold SRAM architectures and processing-in-memory (PIM) concepts, our group strives to make intelligent edge devices a reality. We are situated in A-613 of the R&D block at IIIT Delhi.
              </p>
            </div>

            {/* Principal Investigator */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ width: '150px', height: '150px', margin: '0 auto 28px', border: `1px solid ${C.border}`, padding: '4px', borderRadius: '50%', overflow: 'hidden' }}>
                <img src={TEAM.director.img} alt={TEAM.director.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <SectionLabel>Director</SectionLabel>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.navy, margin: '0 0 8px 0' }}>{TEAM.director.name}</h3>
              <p style={{ fontSize: '1rem', color: C.ink3, fontWeight: 500, mb: 4 }}>{TEAM.director.role}</p>
              <div style={{ borderTop: `1px solid ${C.border}`, margin: '24px auto', width: '40px' }} />
              <p style={{ fontSize: '0.95rem', color: C.ink2, lineHeight: 1.6, fontStyle: 'italic' }}>"{TEAM.director.desc}"</p>
            </div>

          </div>
        </div>
      </section>

      {/* Faculty */}
      <section style={{ padding: '100px 0', background: C.bg, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px)' }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionLabel>Network</SectionLabel>
            <SectionTitle>Faculty Collaborators</SectionTitle>
          </Box>

          <div className="vicas-about-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '32px' 
          }}>
            {TEAM.faculty.map((f, i) => (
              <MemberCard key={i} member={f} size="large" />
            ))}
          </div>
        </div>
      </section>

      {/* Students */}
      <section style={{ padding: '100px 0', background: C.white }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px)' }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SectionLabel>The Group</SectionLabel>
            <SectionTitle>Research Students</SectionTitle>
          </Box>

          <div className="vicas-about-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '24px' 
          }}>
            {TEAM.students.map((s, i) => (
              <MemberCard key={i} member={s} size="small" />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;