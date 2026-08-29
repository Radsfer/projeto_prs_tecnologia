import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

// Layout minimalista do operador (mobile-first): sem navegação administrativa.
export default function OperatorLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="op-shell">
      <header className="op-topbar">
        <div className="brand">ProdTrack</div>
        <div className="account">
          <span>{user?.name}</span>
          <button className="ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </header>
      <main className="op-content">
        <Outlet />
      </main>
    </div>
  );
}
