import { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Layout from './components/Layout';
import OperatorLayout from './components/OperatorLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Shifts from './pages/Shifts';
import Targets from './pages/Targets';
import Records from './pages/Records';
import Users from './pages/Users';
import Apontamento from './pages/Apontamento';

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// O Gestor acessa o painel administrativo; o Operador vai para o apontamento.
function RequireGestor() {
  const { user } = useAuth();
  return user?.role === 'GESTOR' ? <Layout /> : <Navigate to="/apontamento" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/apontamento"
            element={
              <Protected>
                <OperatorLayout />
              </Protected>
            }
          >
            <Route index element={<Apontamento />} />
          </Route>

          <Route
            element={
              <Protected>
                <RequireGestor />
              </Protected>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/records" element={<Records />} />
            <Route path="/users" element={<Users />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
