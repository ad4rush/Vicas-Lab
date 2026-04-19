import React, { useState } from 'react';
import { 
  Container, Typography, Box, 
  Select, MenuItem, FormControl, InputLabel,
  useMediaQuery
} from '@mui/material';
import main_2 from '../../Photos/main_2.jpeg';

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

const publications = [
  { year: 2023, topic: 'Low-Power', author: 'Dr. A', title: 'A Novel Low-Power SRAM', journal: 'Journal of VLSI Design' },
  { year: 2023, topic: 'High-Speed', author: 'Dr. B', title: 'A 1GS/s ADC Design', journal: 'IEEE TCAS-I' },
  { year: 2022, topic: 'AI Hardware', author: 'Dr. A', title: 'Accelerator for CNNs', journal: 'Journal of Solid-State Circuits' },
  { year: 2022, topic: 'Low-Power', author: 'Dr. B', title: 'Sub-threshold Logic Design', journal: 'International Symposium on Low Power' },
];

/* ─── SHARED MICRO-COMPONENTS ───────────────────────────────────── */
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

const SectionTitle = ({ children, style = {} }) => (
  <h2 style={{
    fontFamily: sysFont,
    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
    fontWeight: 800, color: C.navy,
    lineHeight: 1.15, margin: 0,
    ...style,
  }}>{children}</h2>
);

const GlobalStyles = () => (
  <style>{`
    .vicas-pub-card {
      padding: 32px 0;
      border-bottom: 1px solid ${C.border};
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 32px;
      transition: all 0.2s ease;
      cursor: default;
    }
    .vicas-pub-card:hover {
      background: ${C.bg};
      padding-left: 20px;
    }
    .vicas-pub-card:last-child {
      border-bottom: none;
    }

    .vicas-filter-form .MuiOutlinedInput-root {
      border-radius: 4px;
      background: ${C.white};
      font-family: ${sysFont};
      font-size: 13px;
      font-weight: 500;
    }
    .vicas-filter-form .MuiOutlinedInput-notchedOutline {
      border-color: ${C.border};
    }
    .vicas-filter-form .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
      border-color: ${C.navy};
    }
    .vicas-filter-form .MuiInputLabel-root {
      font-family: ${sysFont};
      font-size: 13px;
      font-weight: 600;
      color: ${C.ink3};
    }

    @media (max-width: 768px) {
      .vicas-pub-card { grid-template-columns: 1fr !important; gap: 12px; }
      .vicas-filter-stack { flex-direction: column !important; width: 100%; }
      .vicas-filter-stack .MuiFormControl-root { width: 100% !important; }
    }
  `}</style>
);

const ResearchPage = () => {
  const [year, setYear] = useState('');
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  // const isMobile = useMediaQuery('(max-width:768px)');

  const filteredPublications = publications.filter(p => 
    (year ? p.year === year : true) &&
    (topic ? p.topic === topic : true) &&
    (author ? p.author === author : true)
  );

  return (
    <div style={{ fontFamily: sysFont, background: C.white, color: C.ink, overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* Hero */}
      <section style={{ position: 'relative', height: '45vh', minHeight: '350px', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${main_2})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(10, 37, 64, 0.85)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: C.sky, zIndex: 3 }} />
        
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px, 5vw, 64px)', maxWidth: '850px' }}>
          <SectionLabel>Academic Archive</SectionLabel>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>Research &<br />Publications</h1>
        </div>
      </section>

      {/* Filters */}
      <section style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '48px 0' }}>
        <Container maxWidth="lg">
          <Box className="vicas-filter-stack vicas-filter-form" sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Year</InputLabel>
              <Select value={year} label="Year" onChange={e => setYear(e.target.value)} MenuProps={{ disableScrollLock: true }}>
                <MenuItem value=""><em>All Deliveries</em></MenuItem>
                <MenuItem value={2023}>2023</MenuItem>
                <MenuItem value={2022}>2022</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select value={topic} label="Topic" onChange={e => setTopic(e.target.value)} MenuProps={{ disableScrollLock: true }}>
                <MenuItem value=""><em>All Topics</em></MenuItem>
                <MenuItem value="Low-Power">Low-Power</MenuItem>
                <MenuItem value="High-Speed">High-Speed</MenuItem>
                <MenuItem value="AI Hardware">AI Hardware</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Author</InputLabel>
              <Select value={author} label="Author" onChange={e => setAuthor(e.target.value)} MenuProps={{ disableScrollLock: true }}>
                <MenuItem value=""><em>All Investigators</em></MenuItem>
                <MenuItem value="Dr. A">Dr. A</MenuItem>
                <MenuItem value="Dr. B">Dr. B</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Container>
      </section>

      {/* Publications List */}
      <section style={{ padding: '80px 0', minHeight: '500px' }}>
        <Container maxWidth="lg">
          <div style={{ marginBottom: '48px' }}>
            <SectionLabel>Records</SectionLabel>
            <SectionTitle>Publication Archive — {filteredPublications.length} Results</SectionTitle>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {filteredPublications.map((pub, index) => (
              <div key={index} className="vicas-pub-card">
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy }}>
                  {pub.year}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.ink, lineHeight: 1.4, margin: '0 0 12px 0' }}>{pub.title}</h3>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.sky, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{pub.author}</p>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: C.border }} />
                    <p style={{ fontSize: '0.95rem', color: C.ink3, fontStyle: 'italic', margin: 0 }}>{pub.journal}</p>
                    <Box sx={{ ml: 'auto', bgcolor: C.bg, border: `1px solid ${C.border}`, px: 1.5, py: 0.5, borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: C.navy, textTransform: 'uppercase' }}>{pub.topic}</Box>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPublications.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography sx={{ color: C.ink3, fontWeight: 500 }}>No repository entries found matching your filter criteria.</Typography>
            </Box>
          )}
        </Container>
      </section>

    </div>
  );
};

export default ResearchPage;
