import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/machines', label: 'Máquinas' },
  { to: '/shifts', label: 'Turnos' },
  { to: '/targets', label: 'Metas' },
  { to: '/records', label: 'Apontamentos' },
  { to: '/users', label: 'Usuários' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">ProdTrack</div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <span>{user?.name}</span>
          <button className="ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
