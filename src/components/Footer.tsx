import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-container {
          background: var(--surface-color);
          color: var(--text-primary);
          padding: 40px 20px 24px 20px;
          border-top: 1px solid var(--border-color);
          margin-top: auto;
          width: 100%;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-top-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60px;
          width: 100%;
        }

        .footer-instagram-link {
          position: absolute;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: transform 0.2s ease, color 0.2s ease;
          border-radius: 50%;
        }

        .footer-instagram-link:hover {
          color: var(--text-primary);
          transform: scale(1.1);
        }

        /* ========================================================= */
        /* SECCIÓN LOGO FOOTER: WEB / LAPTOPS (>= 769px)             */
        /* ========================================================= */
        .footer-logo-desktop {
          display: none;
        }

        .footer-logo-img-desktop {
          filter: var(--logo-invert);
          object-fit: contain;
          transform-origin: center;
          width: 170px;
          height: 40px;
          transform: scale(1.95);
        }

        /* ========================================================= */
        /* SECCIÓN LOGO FOOTER: MÓVILES (<= 768px)                   */
        /* ========================================================= */
        .footer-logo-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-logo-img-mobile {
          filter: var(--logo-invert);
          object-fit: contain;
          transform-origin: center;
          width: 120px;
          height: 30px;
          transform: scale(1.2);
        }

        @media (max-width: 768px) {
          .footer-logo-desktop { display: none !important; }
          .footer-logo-mobile { display: flex !important; }
        }

        @media (max-width: 480px) {
          .footer-logo-img-mobile {
            width: 110px;
            height: 28px;
            transform: scale(1.1);
          }
        }

        @media (min-width: 769px) {
          .footer-logo-mobile { display: none !important; }
          .footer-logo-desktop { display: flex !important; }
        }
      `}</style>

      <footer className="footer-container">
        <div className="footer-inner">
          {/* Top Row: Logo & Instagram */}
          <div className="footer-top-row">
            {/* SECCIÓN 1: Logo Cortez Web / Laptops */}
            <div className="footer-logo-desktop">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Image 
                  src="/logo.png" 
                  alt="Cortez Logo" 
                  width={170} 
                  height={40} 
                  className="footer-logo-img-desktop"
                />
              </Link>
            </div>

            {/* SECCIÓN 2: Logo Cortez Móviles */}
            <div className="footer-logo-mobile">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Image 
                  src="/logo.png" 
                  alt="Cortez Logo" 
                  width={120} 
                  height={30} 
                  className="footer-logo-img-mobile"
                />
              </Link>
            </div>
            
            {/* Instagram Right */}
            <a 
              href="https://www.instagram.com/cortez.ve/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-instagram-link"
              title="Síguenos en Instagram"
              aria-label="Instagram de Cortez"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
          
          <div style={{
            width: '100%',
            height: '1px',
            background: 'var(--border-color)',
            margin: '6px 0'
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            letterSpacing: '0.3px'
          }}>
            <p>&copy; {new Date().getFullYear()} Cortez. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
