import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/authors', label: 'Authors' },
    { path: '/categories', label: 'Categories' },
    { path: '/books', label: 'Books' },
    { path: '/members', label: 'Members' },
    { path: '/loans', label: 'Loans' },
  ];

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#1e293b' }}>
      {links.map(link => (
        <Link
          key={link.path}
          to={link.path}
          style={{
            color: location.pathname === link.path ? '#38bdf8' : '#fff',
            textDecoration: 'none',
            fontWeight: location.pathname === link.path ? 'bold' : 'normal'
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default Navbar;