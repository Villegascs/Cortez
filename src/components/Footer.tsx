import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface-color)',
      color: 'var(--text-primary)',
      padding: '40px 20px 20px 20px',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Top Row: Logo & Instagram */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo Cortez Left */}
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Cortez Logo" 
              width={140} 
              height={35} 
              style={{ filter: 'var(--logo-invert)', objectFit: 'contain' }} 
            />
          </Link>
          
          {/* Instagram Right */}
          <a 
            href="https://www.instagram.com/cortez.ve/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            title="Síguenos en Instagram"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--icon-color)"
              strokeWidth="1.5"
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
          margin: '10px 0'
        }} />
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          <p>&copy; {new Date().getFullYear()} Cortez. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
