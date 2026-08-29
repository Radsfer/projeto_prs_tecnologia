import { useEffect, useState } from 'react';
import { api } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  anonymized: boolean;
}

const roleLabel: Record<string, string> = {
  GESTOR: 'Gestor',
  OPERADOR: 'Operador',
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const data = await api<{ users: User[] }>('/api/users');
    setUsers(data.users);
  }

  useEffect(() => {
    load().catch((e) => setError((e as Error).message));
  }, []);

  async function anonymize(u: User) {
    const ok = confirm(
      `Anonimizar ${u.name}? Os apontamentos associados serão preservados, mas os dados pessoais (nome/e-mail) serão substituídos de forma irrecuperável.`,
    );
    if (!ok) return;
    setError('');
    setSuccess('');
    try {
      await api(`/api/users/${u.id}`, { method: 'DELETE' });
      setSuccess('Usuário anonimizado com sucesso');
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Usuários</h1>
          <p>Governança de identidades — exclusão lógica e anonimização (LGPD)</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{roleLabel[u.role] ?? u.role}</td>
                  <td>
                    {u.anonymized ? (
                      <span className="badge neutral">anonimizado</span>
                    ) : u.active ? (
                      <span className="badge ok">ativo</span>
                    ) : (
                      <span className="badge neutral">inativo</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!u.anonymized && (
                      <button className="danger" onClick={() => anonymize(u)}>
                        Anonimizar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
