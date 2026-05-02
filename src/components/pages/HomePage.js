import React, { useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  Science as ScienceIcon,
  Lightbulb as IdeaIcon,
  Hub as HubIcon,
  Email as EmailIcon,
  OpenInNew as LinkIcon,
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

/* ─── DESIGN TOKENS ─────────────────────────────────────────────── */
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

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

const RESEARCH = [
  {
    icon: <ScienceIcon />,
    title: 'In-Memory Compute',
    desc: 'SRAM-based compute architectures that run edge-AI inference directly in memory, eliminating costly data-movement.',
  },
  {
    icon: <IdeaIcon />,
    title: 'Reliable Systems',
    desc: 'Aging-aware designs and error-correction for long-term hardware stability across process corners and temperatures.',
  },
  {
    icon: <HubIcon />,
    title: 'Edge Architectures',
    desc: 'Ultra low-power VLSI circuits for IoT and wearable devices operating under tight energy and area budgets.',
  },
];

/* ─── GLOBAL STYLES ──────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    .slick-dots { bottom: 28px; }
    .slick-dots li button:before { color: #fff !important; opacity: 0.35; font-size: 7px; }
    .slick-dots li.slick-active button:before { opacity: 1; }

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
    .hero-fade-d3 { animation-delay: 0.45s; }

    .research-card {
      background: ${C.white};
      border: 1px solid ${C.border};
      border-radius: 16px;
      padding: 40px 32px;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
    }
    .research-card:hover {
      box-shadow: 0 12px 32px rgba(10, 37, 64, 0.08);
      border-color: ${C.sky};
    }
    .research-card:hover .rc-icon {
      background: ${C.navy} !important;
    }
    .rc-icon {
      transition: background 0.3s ease;
    }

    .vicas-text-link {
      font-family: ${sysFont};
      font-size: 0.84rem;
      font-weight: 700;
      color: ${C.sky};
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border-bottom: 1.5px solid transparent;
      transition: border-color 0.2s;
    }
    .vicas-text-link:hover { border-color: ${C.sky}; }

    .stat-item {
      text-align: center;
      padding: 0 24px;
    }

    @media (max-width: 900px) {
      .hero-content { text-align: center !important; }
      .hero-buttons { justify-content: center !important; }
      .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
      .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
      .research-grid { grid-template-columns: 1fr !important; }
      .director-inner { flex-direction: column !important; text-align: center !important; }
      .director-img { margin: 0 auto !important; }
      .director-info { align-items: center !important; }
      .cta-buttons { flex-direction: column !important; align-items: center !important; }
    }
    @media (max-width: 600px) {
      .stats-card { margin: 0 16px !important; }
    }
  `}</style>
);

/* ─── EYEBROW ATOM ───────────────────────────────────────────────── */
const Eyebrow = ({ children, light = false, center = false }) => (
  <Typography sx={{
    fontFamily: sysFont, fontSize: '0.7rem', fontWeight: 700,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: C.sky, mb: 2, textAlign: center ? 'center' : 'left',
  }}>
    {children}
  </Typography>
);

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════════════════════════════ */
const HeroSection = ({ images }) => {
  const settings = {
    dots: true, infinite: true, speed: 1400, fade: true,
    slidesToShow: 1, slidesToScroll: 1,
    autoplay: true, autoplaySpeed: 4200,
    cssEase: 'linear', arrows: false,
  };

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero area */}
      <Box sx={{ height: { xs: '100vh', md: '100vh' }, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background slider */}
        <Slider {...settings} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
          {images.map((img, i) => (
            <Box key={i} sx={{
              width: '100%', height: '100vh',
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
          ))}
        </Slider>

        {/* Dark overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(6,22,38,0.88) 0%, rgba(6,22,38,0.72) 50%, rgba(6,22,38,0.92) 100%)',
        }} />

        {/* Decorative grid pattern */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'heroPulse 6s ease-in-out infinite',
        }} />

        {/* Content — centered */}
        <Container maxWidth="md" sx={{ zIndex: 2, position: 'relative', textAlign: 'center' }}>
          <Box className="hero-content">
            <Typography className="hero-fade" sx={{
              fontFamily: sysFont, fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: C.sky, mb: 3,
            }}>
              IIIT Delhi — Department of ECE
            </Typography>

            <Typography variant="h1" className="hero-fade hero-fade-d1" sx={{
              fontFamily: sysFont, fontWeight: 800, color: 'white',
              lineHeight: 1.08, letterSpacing: '-0.03em',
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4.2rem' },
              mb: 3,
            }}>
              VLSI Circuits<br />&amp; Systems Lab
            </Typography>

            <Box className="hero-fade hero-fade-d1" sx={{ width: 48, height: 3, bgcolor: C.sky, mx: 'auto', mb: 3, borderRadius: 2 }} />

            <Typography className="hero-fade hero-fade-d2" sx={{
              fontFamily: sysFont, color: 'rgba(255,255,255,0.7)',
              fontSize: { xs: '0.95rem', md: '1.1rem' }, lineHeight: 1.8,
              maxWidth: '520px', mx: 'auto', mb: 5,
            }}>
              Advancing ultra low-power in-memory compute, edge-AI acceleration,
              and aging-resilient hardware security.
            </Typography>

            <Box className="hero-fade hero-fade-d3 hero-buttons" sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link} to="/research"
                sx={{
                  bgcolor: C.sky, color: 'white', borderRadius: '10px',
                  fontFamily: sysFont, fontWeight: 700, textTransform: 'none',
                  px: 4, py: 1.5, fontSize: '0.9rem',
                  boxShadow: '0 4px 20px rgba(0,180,216,0.3)',
                  '&:hover': { bgcolor: '#009eb5', boxShadow: '0 6px 28px rgba(0,180,216,0.4)' },
                }}
              >
                Research Areas
              </Button>
              <Button
                component={Link} to="/projects"
                variant="outlined"
                sx={{
                  color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)',
                  borderRadius: '10px', fontFamily: sysFont, textTransform: 'none',
                  px: 4, py: 1.5, fontSize: '0.9rem',
                  '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Publications
              </Button>
            </Box>
          </Box>
        </Container>

      </Box>

    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1.5 — LATEST UPDATES (Dynamic)
   ═══════════════════════════════════════════════════════════════════ */
const LatestUpdatesSection = () => {
  const [updates, setUpdates] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const [newsRes, achRes] = await Promise.all([
          fetch(`${API_BASE}/api/content/news`),
          fetch(`${API_BASE}/api/content/achievement`)
        ]);
        const newsData = await newsRes.json();
        const achData = await achRes.json();
        
        let combined = [];
        if (newsRes.ok && newsData.items) {
          combined = [...combined, ...newsData.items.map(i => ({ ...i, type: 'news' }))];
        }
        if (achRes.ok && achData.items) {
          combined = [...combined, ...achData.items.map(i => ({ ...i, type: 'achievement' }))];
        }
        
        // Sort by date (descending)
        combined.sort((a, b) => {
          const dateA = new Date(a.metadata?.date || a.created_at);
          const dateB = new Date(b.metadata?.date || b.created_at);
          return dateB - dateA;
        });
        
        setUpdates(combined.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch updates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  if (loading || updates.length === 0) return null;

  return (
    <Box sx={{ 
      py: { xs: 8, md: 10 }, 
      bgcolor: C.bg, 
      borderBottom: `1px solid ${C.border}`,
      position: 'relative' 
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
          <Box>
            <Eyebrow>Latest Updates</Eyebrow>
            <Typography variant="h3" sx={{ 
              fontFamily: sysFont, fontWeight: 800, color: C.navy,
              fontSize: { xs: '1.75rem', md: '2.2rem' }
            }}>
              Lab News & Achievements
            </Typography>
          </Box>
          <Button 
            component={Link} to="/news"
            endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
            sx={{ 
              textTransform: 'none', fontWeight: 700, color: C.sky,
              fontFamily: sysFont, mb: 1,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            See all
          </Button>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {updates.map((item, i) => {
            const date = new Date(item.metadata?.date || item.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });
            return (
              <Box key={i} sx={{ 
                bgcolor: C.white, p: 3, borderRadius: '16px',
                border: `1px solid ${C.border}`,
                transition: 'all 0.3s ease',
                display: 'flex', flexDirection: 'column',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(10,37,64,0.08)', borderColor: C.sky }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ 
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                    color: item.type === 'achievement' ? '#F59E0B' : C.sky,
                    textTransform: 'uppercase', bgcolor: item.type === 'achievement' ? 'rgba(245,158,11,0.1)' : 'rgba(0,180,216,0.1)',
                    px: 1.2, py: 0.4, borderRadius: '4px'
                  }}>
                    {item.type === 'achievement' ? 'Achievement' : 'News'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: C.ink3, fontWeight: 500 }}>
                    {date}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontFamily: sysFont, fontWeight: 700, color: C.navy, 
                  fontSize: '1.05rem', mb: 1.5, lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {item.title}
                </Typography>
                <Typography sx={{ 
                  fontFamily: sysFont, color: C.ink2, fontSize: '0.9rem', 
                  lineHeight: 1.6, mb: 2, flexGrow: 1,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {item.description}
                </Typography>
                <Link to="/news" style={{ 
                  color: C.sky, fontSize: '0.85rem', fontWeight: 700, 
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' 
                }}>
                  Read more <ArrowIcon sx={{ fontSize: 14 }} />
                </Link>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — ABOUT
   ═══════════════════════════════════════════════════════════════════ */
const AboutSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: C.white }}>
    <Container maxWidth="lg">
      <Box className="about-grid" sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: { xs: 6, md: 10 },
        alignItems: 'center',
      }}>
        {/* Text */}
        <Box>
          <Eyebrow>About the Lab</Eyebrow>
          <Typography variant="h2" sx={{
            fontFamily: sysFont, fontWeight: 800, color: C.navy,
            lineHeight: 1.15, fontSize: { xs: '1.75rem', md: '2.2rem' }, mb: 4,
          }}>
            Where Circuits<br />Meet Intelligence
          </Typography>
          <Typography sx={{ fontFamily: sysFont, fontSize: '1rem', lineHeight: 1.85, color: C.ink2, mb: 2.5 }}>
            Located within IIIT Delhi's ECE department, the VICAS Lab is a focused research group
            working at the intersection of VLSI design, memory systems, and machine-learning hardware.
          </Typography>
          <Typography sx={{ fontFamily: sysFont, fontSize: '1rem', lineHeight: 1.85, color: C.ink2, mb: 5 }}>
            We design SRAM-based compute-in-memory circuits, study hardware reliability under aging,
            and build error-resilient architectures for resource-constrained edge deployments.
          </Typography>
          <Link to="/about" className="vicas-text-link">
            More about VICAS <ArrowIcon sx={{ fontSize: 14 }} />
          </Link>
        </Box>

        {/* Image composition */}
        <Box sx={{ position: 'relative', height: { xs: 320, md: 420 } }}>
          {/* Decorative bg rectangle */}
          <Box sx={{
            position: 'absolute', top: 20, right: 0, width: '85%', height: '85%',
            bgcolor: C.bg, border: `1px solid ${C.border}`, borderRadius: '12px', zIndex: 0,
          }} />
          {/* Main image */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, width: '70%', height: '75%',
            borderRadius: '12px', overflow: 'hidden', zIndex: 1,
            boxShadow: '0 12px 40px rgba(10,37,64,0.12)',
            border: `3px solid ${C.white}`,
          }}>
            <img src={main_1} alt="VICAS Lab" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Box>
          {/* Secondary image */}
          <Box sx={{
            position: 'absolute', bottom: 0, right: 0, width: '55%', height: '55%',
            borderRadius: '12px', overflow: 'hidden', zIndex: 2,
            boxShadow: '0 12px 40px rgba(10,37,64,0.15)',
            border: `3px solid ${C.white}`,
          }}>
            <img src={main_3} alt="Lab team" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Box>
          {/* Accent dot */}
          <Box sx={{
            position: 'absolute', top: -12, right: '40%', width: 24, height: 24,
            bgcolor: C.sky, borderRadius: '50%', zIndex: 3, opacity: 0.6,
          }} />
        </Box>
      </Box>
    </Container>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — RESEARCH
   ═══════════════════════════════════════════════════════════════════ */
const ResearchSection = () => (
  <Box sx={{
    py: { xs: 10, md: 14 },
    background: `linear-gradient(180deg, ${C.bg} 0%, ${C.white} 100%)`,
  }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
        <Eyebrow center>What We Do</Eyebrow>
        <Typography variant="h2" sx={{
          fontFamily: sysFont, fontWeight: 800, color: C.navy,
          fontSize: { xs: '1.75rem', md: '2.2rem' },
        }}>
          Research Focus Areas
        </Typography>
      </Box>

      <Box className="research-grid" sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 3,
      }}>
        {RESEARCH.map((area, i) => (
          <div key={i} className="research-card">
            <Box className="rc-icon" sx={{
              width: 52, height: 52, borderRadius: '14px',
              bgcolor: 'rgba(0,180,216,0.1)', color: C.sky,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {React.cloneElement(area.icon, { sx: { fontSize: 26 } })}
            </Box>
            <Typography sx={{ fontFamily: sysFont, fontWeight: 800, color: C.navy, fontSize: '1.1rem' }}>
              {area.title}
            </Typography>
            <Typography sx={{ fontFamily: sysFont, fontSize: '0.92rem', color: C.ink3, lineHeight: 1.75, flexGrow: 1 }}>
              {area.desc}
            </Typography>
            <Link to="/research" className="vicas-text-link" style={{ marginTop: 8 }}>
              Learn more <ArrowIcon sx={{ fontSize: 13 }} />
            </Link>
          </div>
        ))}
      </Box>
    </Container>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — DIRECTOR SPOTLIGHT
   ═══════════════════════════════════════════════════════════════════ */
const DirectorSection = () => (
  <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: C.navy, position: 'relative', overflow: 'hidden' }}>
    {/* Decorative pattern */}
    <Box sx={{
      position: 'absolute', inset: 0,
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
    }} />

    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
      <Box className="director-inner" sx={{
        display: 'flex', gap: { xs: 4, md: 6 },
        alignItems: 'center',
        bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        p: { xs: 4, md: 6 },
      }}>
        {/* Photo */}
        <Box className="director-img" sx={{ flexShrink: 0 }}>
          <Box sx={{
            width: { xs: 120, md: 150 }, height: { xs: 120, md: 150 },
            borderRadius: '16px', overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.15)',
          }}>
            <img src={Dr_Anuj_Grover} alt="Dr. Anuj Grover"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        </Box>

        {/* Info */}
        <Box className="director-info" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{
            fontFamily: sysFont, fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: C.sky,
          }}>
            Lab Director
          </Typography>
          <Typography sx={{ fontFamily: sysFont, fontWeight: 800, color: C.white, fontSize: { xs: '1.4rem', md: '1.8rem' }, lineHeight: 1.2 }}>
            Dr. Anuj Grover
          </Typography>
          <Typography sx={{ fontFamily: sysFont, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, lineHeight: 1.6 }}>
            Assistant Professor, ECE — IIIT Delhi, Okhla Phase III, New Delhi — 110020
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 16, color: C.sky }} />
              <Typography component="a" href="mailto:anuj@iiitd.ac.in" sx={{
                fontFamily: sysFont, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none', '&:hover': { color: C.sky },
              }}>
                anuj@iiitd.ac.in
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon sx={{ fontSize: 16, color: C.sky }} />
              <Typography component="a" href="https://bit.ly/anuj-grover" target="_blank" rel="noopener noreferrer" sx={{
                fontFamily: sysFont, fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none', '&:hover': { color: C.sky },
              }}>
                Faculty Profile →
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — CTA BANNER
   ═══════════════════════════════════════════════════════════════════ */
const CtaSection = () => (
  <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: C.white, textAlign: 'center' }}>
    <Container maxWidth="md">
      <Eyebrow center>Archive</Eyebrow>
      <Typography variant="h3" sx={{
        fontFamily: sysFont, fontWeight: 800, color: C.navy,
        fontSize: { xs: '1.5rem', md: '2rem' }, mb: 2,
      }}>
        Browse Publications &amp; Gallery
      </Typography>
      <Typography sx={{
        fontFamily: sysFont, color: C.ink3, fontSize: '1rem', mb: 5,
        maxWidth: '480px', mx: 'auto', lineHeight: 1.7,
      }}>
        Explore our research output, lab photos, and ongoing projects.
      </Typography>

      <Box className="cta-buttons" sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          component={Link} to="/gallery"
          sx={{
            bgcolor: C.navy, color: C.white, borderRadius: '10px',
            fontFamily: sysFont, fontWeight: 700, textTransform: 'none',
            px: 4, py: 1.5, fontSize: '0.9rem',
            '&:hover': { bgcolor: C.navyDark },
          }}
        >
          View Gallery
        </Button>
        <Button
          component={Link} to="/research"
          variant="outlined"
          sx={{
            color: C.navy, borderColor: C.navy, borderRadius: '10px',
            fontFamily: sysFont, fontWeight: 700, textTransform: 'none',
            px: 4, py: 1.5, fontSize: '0.9rem',
            '&:hover': { bgcolor: C.navy, color: C.white, borderColor: C.navyDark },
          }}
        >
          Publications
        </Button>
      </Box>
    </Container>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const galleryImages = [main_1, main_2, main_3, main_4];

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
    <Box sx={{ bgcolor: C.white, color: C.ink, fontFamily: sysFont }}>
      <GlobalStyles />
      <HeroSection images={galleryImages} />
      <LatestUpdatesSection />
      <AboutSection />
      <ResearchSection />
      <DirectorSection />
      <CtaSection />
    </Box>
  );
};

export default HomePage;