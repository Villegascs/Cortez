import Link from 'next/link';

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
        alignItems: 'center',
        gap: '20px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          CORTEZ
        </h2>
        
        <a 
          href="https://www.instagram.com/cortez/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--icon-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span>SÍGUENOS EN INSTAGRAM</span>
        </a>
        
        <div style={{
          width: '100%',
          height: '1px',
          background: 'var(--border-color)',
          margin: '20px 0'
        }} />
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
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
