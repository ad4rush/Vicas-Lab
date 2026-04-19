import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  Science as ScienceIcon,
  Lightbulb as IdeaIcon,
  Hub as HubIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import main_1 from '../../Photos/main_1.jpeg';
import main_2 from '../../Photos/main_2.jpeg';
import main_3 from '../../Photos/main_3.jpeg';
import main_4 from '../../Photos/main_4.jpeg';
import Dr_Anuj_Grover from '../../Photos/Professor/Dr. Anuj Grover.jpeg';

/* ─── DESIGN TOKENS (unchanged) ─────────────────────────── */
const C = {
  white:    '#FFFFFF',
  navy:     '#0A2540',
  navyDark: '#061626',
  sky:      '#00B4D8',
  border:   '#E5E7EB',
  bg:       '#F8FAFC',
  welcomeBg:'#f7f9fc',
  ink:      '#111827',
  ink2:     '#374151',
  ink3:     '#6B7280',
};

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

/* ─── STATIC DATA ────────────────────────────────────────── */
const STATS = [
  { value: '25+', label: 'Publications' },
  { value: '12',  label: 'Lab Members'  },
  { value: '8',   label: 'Live Projects'},
  { value: '6+',  label: 'Years Active' },
];

const RESEARCH = [
  {
    icon: <ScienceIcon />,
    title: 'In-Memory Compute',
    desc:  'SRAM-based compute architectures that run edge-AI inference directly in memory, eliminating costly data-movement.',
  },
  {
    icon: <IdeaIcon />,
    title: 'Reliable Systems',
    desc:  'Aging-aware designs and error-correction for long-term hardware stability across process corners and temperatures.',
  },
  {
    icon: <HubIcon />,
    title: 'Edge Architectures',
    desc:  'Ultra low-power VLSI circuits for IoT and wearable devices operating under tight energy and area budgets.',
  },
];

/* ─── GLOBAL STYLES ──────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    .slick-dots { bottom: 28px; }
    .slick-dots li button:before { color: #fff !important; opacity: 0.4; font-size: 7px; }
    .slick-dots li.slick-active button:before { opacity: 1; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    .vicas-fade    { animation: fadeUp 0.6s ease both; }
    .vicas-fade-d1 { animation-delay: 0.12s; }
    .vicas-fade-d2 { animation-delay: 0.24s; }

    .research-panel {
      padding: 40px 36px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: background 0.2s ease;
    }
    .research-panel:hover { background: ${C.welcomeBg}; }

    .vicas-text-link {
      font-family: ${sysFont};
      font-size: 0.82rem;
      font-weight: 700;
      color: ${C.sky};
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border-bottom: 1px solid transparent;
      transition: border-color 0.18s;
    }
    .vicas-text-link:hover { border-color: ${C.sky}; }

    /*
     * Transparent-header integration:
     * In your Header/Navbar, listen for the 'vicas-hero-scroll' event:
     *
     *   window.addEventListener('vicas-hero-scroll', (e) => {
     *     setIsTransparent(!e.detail.scrolled);  // your header state
     *   });
     *
     * Apply:
     *   bgcolor: isTransparent && isHomePage ? 'transparent' : C.navy
     *   boxShadow: isTransparent ? 'none' : '0 2px 12px rgba(0,0,0,0.15)'
     *   transition: 'background 0.35s ease, box-shadow 0.35s ease'
     */
  `}</style>
);

/* ─── REUSABLE ATOMS ─────────────────────────────────────── */
const Eyebrow = ({ children, light = false, sx = {} }) => (
  <Typography sx={{
    fontFamily: sysFont,
    fontSize:   '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: light ? C.sky : C.sky,
    mb: 2,
    ...sx,
  }}>
    {children}
  </Typography>
);

/* ─── HERO ───────────────────────────────────────────────── */
const HeroSection = ({ images }) => {
  const settings = {
    dots: true, infinite: true, speed: 1400, fade: true,
    slidesToShow: 1, slidesToScroll: 1,
    autoplay: true, autoplaySpeed: 4200,
    cssEase: 'linear', arrows: false,
  };

  return (
    <Box sx={{ height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {/* Slider */}
      <Slider {...settings} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {images.map((img, i) => (
          <Box
            key={i}
            sx={{
              width: '100%', height: '100vh',
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}
          />
        ))}
      </Slider>

      {/* Overlay — heavier on the left where text sits */}
      <Box sx={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(105deg, rgba(6,22,38,0.92) 40%, rgba(6,22,38,0.52) 100%)',
      }} />

      {/* Left accent line */}
      <Box sx={{
        position: 'absolute', left: 0, top: '15%', bottom: '15%',
        width: '3px', bgcolor: C.sky, zIndex: 2,
      }} />

      <Container maxWidth="lg" sx={{ zIndex: 2, position: 'relative', pt: { xs: 10, md: 8 } }}>
        <Box sx={{ maxWidth: '620px' }}>
          <Eyebrow>IIIT Delhi — Department of ECE</Eyebrow>

          <Typography
            variant="h1"
            className="vicas-fade"
            sx={{
              fontFamily:    sysFont,
              fontWeight:    800,
              color:         'white',
              lineHeight:    1.06,
              letterSpacing: '-0.025em',
              fontSize:      { xs: '2.6rem', sm: '3.4rem', md: '4.2rem' },
              mb: 3,
            }}
          >
            VLSI Circuits<br />&amp; Systems Lab
          </Typography>

          <Box sx={{ width: 44, height: 2, bgcolor: C.sky, mb: 3 }} />

          <Typography
            className="vicas-fade vicas-fade-d1"
            sx={{
              fontFamily: sysFont,
              color:      'rgba(255,255,255,0.78)',
              fontSize:   { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.8,
              mb: 5,
              maxWidth: '480px',
            }}
          >
            Advancing ultra low-power in-memory compute, edge-AI acceleration,
            and aging-resilient hardware security.
          </Typography>

          <Box className="vicas-fade vicas-fade-d2" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link} to="/research"
              sx={{
                bgcolor: C.sky, color: 'white', borderRadius: '2px',
                fontFamily: sysFont, fontWeight: 700, textTransform: 'none',
                px: 3.5, py: 1.35, fontSize: '0.88rem',
                '&:hover': { bgcolor: '#009eb5' },
              }}
            >
              Research Areas
            </Button>
            <Button
              component={Link} to="/projects"
              variant="outlined"
              sx={{
                color: 'rgba(255,255,255,0.80)', borderColor: 'rgba(255,255,255,0.28)',
                borderRadius: '2px', fontFamily: sysFont, textTransform: 'none',
                px: 3.5, py: 1.35, fontSize: '0.88rem',
                '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              Publications
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Scroll hint */}
      <Box sx={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      }}>
        <Typography sx={{ fontFamily: sysFont, fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase' }}>
          Scroll
        </Typography>
        <Box sx={{ width: '1px', height: 34, bgcolor: 'rgba(255,255,255,0.2)' }} />
      </Box>
    </Box>
  );
};

/* ─── STATS STRIP ────────────────────────────────────────── */
const StatsStrip = () => (
  <Box sx={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, py: { xs: 4.5, md: 5.5 }, bgcolor: 'white' }}>
    <Container maxWidth="lg">
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: { xs: '32px 0', md: 0 },
      }}>
        {STATS.map((s, i) => (
          <Box
            key={i}
            sx={{
              textAlign: 'center',
              borderLeft: {
                xs: i % 2 !== 0   ? `1px solid ${C.border}` : 'none',
                md: i > 0         ? `1px solid ${C.border}` : 'none',
              },
            }}
          >
            <Typography sx={{ fontFamily: sysFont, fontWeight: 800, color: C.navy, lineHeight: 1, fontSize: { xs: '2rem', md: '2.6rem' } }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontFamily: sysFont, fontSize: '0.7rem', color: C.ink3, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', mt: 1 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

/* ─── ABOUT + FACULTY ────────────────────────────────────── */
const AboutSection = () => (
  <Box sx={{ py: { xs: 9, md: 13 }, bgcolor: C.welcomeBg }}>
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">

        {/* Text */}
        <Grid item xs={12} md={6}>
          <Eyebrow>About the Lab</Eyebrow>
          <Typography
            variant="h2"
            sx={{ fontFamily: sysFont, fontWeight: 800, color: C.navy, lineHeight: 1.18, fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 4 }}
          >
            Where Circuits<br />Meet Intelligence
          </Typography>
          <Typography sx={{ fontFamily: sysFont, fontSize: '0.97rem', lineHeight: 1.88, color: C.ink2, mb: 2.5 }}>
            Located within IIIT Delhi's ECE department, the VICAS Lab is a focused research group
            working at the intersection of VLSI design, memory systems, and machine-learning hardware.
          </Typography>
          <Typography sx={{ fontFamily: sysFont, fontSize: '0.97rem', lineHeight: 1.88, color: C.ink2, mb: 5 }}>
            We design SRAM-based compute-in-memory circuits, study hardware reliability under aging,
            and build error-resilient architectures for resource-constrained edge deployments.
          </Typography>
          <Link to="/about" className="vicas-text-link">
            More about VICAS <ArrowIcon sx={{ fontSize: 14 }} />
          </Link>
        </Grid>

        {/* Faculty card */}
        <Grid item xs={12} md={6}>
          <Box sx={{ bgcolor: 'white', border: `1px solid ${C.border}`, borderRadius: '4px', overflow: 'hidden' }}>
            {/* Header band */}
            <Box sx={{ bgcolor: C.navy, px: { xs: 3, md: 4 }, py: 2 }}>
              <Typography sx={{ fontFamily: sysFont, fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Lab Director
              </Typography>
            </Box>

            {/* Body */}
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 3.5 }}>
                <img
                  src={Dr_Anuj_Grover}
                  alt="Dr. Anuj Grover"
                  style={{ width: 80, height: 80, borderRadius: '4px', objectFit: 'cover', display: 'block', flexShrink: 0 }}
                />
                <Box>
                  <Typography sx={{ fontFamily: sysFont, fontWeight: 800, color: C.navy, fontSize: '1.15rem', lineHeight: 1.2 }}>
                    Dr. Anuj Grover
                  </Typography>
                  <Typography sx={{ fontFamily: sysFont, fontSize: '0.8rem', color: C.sky, fontWeight: 600, mt: 0.5, mb: 1 }}>
                    Assistant Professor, ECE
                  </Typography>
                  <Typography sx={{ fontFamily: sysFont, fontSize: '0.8rem', color: C.ink3, lineHeight: 1.65 }}>
                    IIIT Delhi, Okhla Phase III<br />New Delhi — 110020
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ borderTop: `1px solid ${C.border}`, pt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Email',   value: 'anuj@iiitd.ac.in',    href: 'mailto:anuj@iiitd.ac.in'      },
                  { label: 'Profile', value: 'bit.ly/anuj-grover →', href: 'https://bit.ly/anuj-grover'  },
                ].map((row) => (
                  <Box key={row.label} sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <Typography sx={{ fontFamily: sysFont, fontSize: '0.72rem', color: C.ink3, minWidth: 50, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {row.label}
                    </Typography>
                    <Typography
                      component="a" href={row.href}
                      target={row.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      sx={{ fontFamily: sysFont, fontSize: '0.85rem', color: C.ink2, textDecoration: 'none', '&:hover': { color: C.sky } }}
                    >
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

/* ─── RESEARCH AREAS ─────────────────────────────────────── */
const ResearchSection = () => (
  <Box sx={{ py: { xs: 9, md: 13 }, bgcolor: 'white' }}>
    <Container maxWidth="lg">
      <Box sx={{ mb: { xs: 6, md: 8 } }}>
        <Eyebrow>What We Do</Eyebrow>
        <Typography
          variant="h2"
          sx={{ fontFamily: sysFont, fontWeight: 800, color: C.navy, fontSize: { xs: '1.75rem', md: '2.1rem' } }}
        >
          Research Focus Areas
        </Typography>
      </Box>

      {/* Single bordered container — all panels share one border, no mismatched card heights */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        border: `1px solid ${C.border}`,
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        {RESEARCH.map((area, i) => (
          <Box
            key={i}
            className="research-panel"
            sx={{
              borderRight: { xs: 'none', md: i < RESEARCH.length - 1 ? `1px solid ${C.border}` : 'none' },
              borderBottom: { xs: i < RESEARCH.length - 1 ? `1px solid ${C.border}` : 'none', md: 'none' },
            }}
          >
            <Box sx={{ color: C.sky }}>
              {React.cloneElement(area.icon, { sx: { fontSize: 26 } })}
            </Box>

            <Typography sx={{ fontFamily: sysFont, fontWeight: 800, color: C.navy, fontSize: '1rem', lineHeight: 1.3 }}>
              {area.title}
            </Typography>

            <Typography sx={{ fontFamily: sysFont, fontSize: '0.88rem', color: C.ink3, lineHeight: 1.75, flexGrow: 1 }}>
              {area.desc}
            </Typography>

            <Link to="/research" className="vicas-text-link" style={{ marginTop: 6 }}>
              Learn more <ArrowIcon sx={{ fontSize: 13 }} />
            </Link>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

/* ─── CTA BANNER ─────────────────────────────────────────── */
const CtaSection = () => (
  <Box sx={{ bgcolor: C.navy, py: { xs: 7, md: 9 } }}>
    <Container maxWidth="lg">
      <Grid container alignItems="center" spacing={{ xs: 4, md: 2 }}>
        <Grid item xs={12} md={8}>
          <Eyebrow>Archive</Eyebrow>
          <Typography
            variant="h3"
            sx={{ fontFamily: sysFont, fontWeight: 800, color: 'white', fontSize: { xs: '1.5rem', md: '1.85rem' }, mb: 1 }}
          >
            Browse Publications &amp; Gallery
          </Typography>
          <Typography sx={{ fontFamily: sysFont, color: 'rgba(255,255,255,0.45)', fontSize: '0.92rem' }}>
            Explore our research output, lab photos, and ongoing projects.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button
            component={Link} to="/gallery"
            sx={{
              bgcolor: 'white', color: C.navy, borderRadius: '2px',
              fontFamily: sysFont, fontWeight: 700, textTransform: 'none',
              px: 3, py: 1.25, fontSize: '0.88rem',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.88)' },
            }}
          >
            Gallery
          </Button>
          <Button
            component={Link} to="/research"
            variant="outlined"
            sx={{
              color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.22)',
              borderRadius: '2px', fontFamily: sysFont, textTransform: 'none',
              px: 3, py: 1.25, fontSize: '0.88rem',
              '&:hover': { borderColor: 'white', color: 'white' },
            }}
          >
            Publications
          </Button>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

/* ─── ROOT ───────────────────────────────────────────────── */
const HomePage = () => {
  const galleryImages = [main_1, main_2, main_3, main_4];

  /*
   * Fires a custom DOM event on every scroll tick.
   * Your Navbar component can listen to 'vicas-hero-scroll'
   * and switch between transparent ↔ navy based on e.detail.scrolled.
   */
  useEffect(() => {
    const dispatch = () =>
      window.dispatchEvent(
        new CustomEvent('vicas-hero-scroll', { detail: { scrolled: window.scrollY > 60 } })
      );
    window.addEventListener('scroll', dispatch, { passive: true });
    dispatch();
    return () => window.removeEventListener('scroll', dispatch);
  }, []);

  return (
    <Box sx={{ bgcolor: 'white', color: C.ink, fontFamily: sysFont }}>
      <GlobalStyles />
      <HeroSection  images={galleryImages} />
      <StatsStrip   />
      <AboutSection />
      <ResearchSection />
      <CtaSection   />
    </Box>
  );
};

export default HomePage;