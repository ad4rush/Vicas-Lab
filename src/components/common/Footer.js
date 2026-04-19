import React from 'react';
import { Box, Container, IconButton, Typography, Divider } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

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

/* ─── SHARED MICRO-COMPONENTS ───────────────────────────────────── */
const FooterLabel = ({ children }) => (
  <p style={{
    fontFamily: sysFont,
    fontSize: '0.75rem', 
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: C.navy, 
    textTransform: 'uppercase',
    margin: '0 0 16px 0',
  }}>{children}</p>
);

const FooterLink = ({ href, children, target, rel }) => (
  <a 
    href={href} 
    target={target} 
    rel={rel}
    className="vicas-footer-link"
    style={{
      display: 'block',
      fontFamily: sysFont,
      fontSize: '0.9rem',
      color: C.ink2,
      textDecoration: 'none',
      marginBottom: '10px',
      transition: 'all 0.2s ease',
    }}
  >
    {children}
  </a>
);

const GlobalStyles = () => (
  <style>{`
    .vicas-footer-link:hover {
      color: ${C.navy} !important;
      padding-left: 2px;
    }
    .vicas-social-icon:hover {
      color: ${C.navy} !important;
      background: ${C.bg} !important;
      border-color: ${C.navy} !important;
    }
    @media (max-width: 768px) {
      .vicas-footer-grid {
        grid-template-columns: 1fr !important;
        gap: 32px !important;
      }
      .vicas-footer-bottom {
        flex-direction: column !important;
        text-align: center !important;
        gap: 16px !important;
      }
    }
  `}</style>
);

function Footer() {
  return (
    <footer style={{ 
      background: C.white, 
      borderTop: `1px solid ${C.border}`,
      padding: '80px 0 40px 0',
      fontFamily: sysFont
    }}>
      <GlobalStyles />
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px)' }}>
        
        <div className="vicas-footer-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 0.8fr 1fr 1.2fr', 
          gap: '40px',
          marginBottom: '64px'
        }}>
          
          {/* Brand & Address */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '20px', background: C.navy }} />
              <h3 style={{ 
                fontSize: '1.4rem', 
                fontWeight: 800, 
                color: C.navy, 
                margin: 0,
                letterSpacing: '-0.01em'
              }}>VICAS Lab</h3>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: C.ink2, maxWidth: '280px' }}>
              VLSI Circuits and Systems Lab<br />
              Indraprastha Institute of Information Technology, Delhi<br />
              Okhla Industrial Estate, Phase III<br />
              New Delhi - 110020
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <FooterLabel>Explore</FooterLabel>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/research">Research</FooterLink>
            <FooterLink href="/projects">Projects</FooterLink>
          </div>

          {/* Contact */}
          <div>
            <FooterLabel>Connect</FooterLabel>
            <FooterLink href="mailto:anuj@iiitd.ac.in">anuj@iiitd.ac.in</FooterLink>
            <p style={{ fontSize: '0.9rem', color: C.ink2, margin: '0 0 10px 0' }}>+91-11-26907494</p>
            <FooterLink href="https://bit.ly/anuj-grover" target="_blank" rel="noopener">Faculty Record →</FooterLink>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              {[
                { icon: <FacebookIcon fontSize="small" />, aria: 'Facebook' },
                { icon: <TwitterIcon fontSize="small" />, aria: 'Twitter' },
                { icon: <LinkedInIcon fontSize="small" />, aria: 'LinkedIn' }
              ].map((social, i) => (
                <IconButton 
                  key={i}
                  size="small"
                  aria-label={social.aria}
                  className="vicas-social-icon"
                  sx={{ 
                    color: C.ink3, 
                    padding: '8px',
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <FooterLabel>Location</FooterLabel>
            <div style={{ 
              border: `1px solid ${C.border}`, 
              padding: '4px', 
              background: C.bg,
              height: '180px',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2695.2159678137273!2d77.2734967345629!3d28.545202986298268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3e45d85d3e3%3A0x691393414902968e!2sIIIT-Delhi%20R%26D%20Building!5e0!3m2!1sen!2sin!4v1756955691731!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>

        <Divider sx={{ mb: 4, borderColor: C.border }} />

        {/* Bottom Bar */}
        <div className="vicas-footer-bottom" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <p style={{ 
            fontSize: '11px', 
            color: C.ink3, 
            fontWeight: 500,
            margin: 0
          }}>
            © 2025 VLSI Circuits and Systems Lab. All Rights Reserved.
          </p>
          <p style={{ 
            fontSize: '11px', 
            color: C.ink3, 
            margin: 0 
          }}>
            Developed by <a href="#" style={{ color: C.navy, textDecoration: 'none', fontWeight: 600 }}>Kothari and Jha</a>
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;