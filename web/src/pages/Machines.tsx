import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

interface Machine {
  id: string;
  name: string;
  code: string;
  unit: string;
  active: boolean;
}

const unitLabel: Record<string, string> = {
  pieces: 'peças',
  kg: 'kg',
  liters: 'litros',
  meters: 'metros',
};

const units = ['pieces', 'kg', 'liters', 'meters'];

export default function Machines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('pieces');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const data = await api<{ machines: Machine[] }>('/api/machines');
    setMachines(data.machines);
  }

  useEffect(() => {
    load().catch((e) => setError((e as Error).message));
  }, []);

  function resetForm() {
    setName('');
    setCode('');
    setUnit('pieces');
    setEditingId(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const body = { name, code, unit };
      if (editingId) {
        await api(`/api/machines/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        setSuccess('Máquina atualizada');
      } else {
        await api('/api/machines', { method: 'POST', body: JSON.stringify(body) });
        setSuccess('Máquina criada');
      }
      resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function startEdit(m: Machine) {
    setEditingId(m.id);
    setName(m.name);
    setCode(m.code);
    setUnit(m.unit);
  }

  async function toggleActive(m: Machine) {
    setError('');
    setSuccess('');
    try {
      if (m.active) {
        await api(`/api/machines/${m.id}`, { method: 'DELETE' });
        setSuccess('Máquina inativada (histórico preservado)');
      } else {
        await api(`/api/machines/${m.id}`, { method: 'PUT', body: JSON.stringify({ active: true }) });
        setSuccess('Máquina reativada');
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Máquinas</h1>
          <p>Cadastro parametrizado de equipamentos (unidade de medida restrita)</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>{editingId ? 'Editar máquina' : 'Nova máquina'}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              <span>Nome (3–100)</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              <span>Código (alfanumérico)</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <label>
              <span>Unidade de medida</span>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {unitLabel[u]}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <button className="primary" type="submit">
                {editingId ? 'Salvar' : 'Criar'}
              </button>
              {editingId && (
                <button className="ghost" type="button" onClick={resetForm} style={{ marginLeft: 8 }}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Unidade</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr key={m.id}>
                  <td>{m.code}</td>
                  <td>{m.name}</td>
                  <td>{unitLabel[m.unit] ?? m.unit}</td>
                  <td>
                    <span className={`badge ${m.active ? 'ok' : 'neutral'}`}>
                      {m.active ? 'ativa' : 'inativa'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="ghost" onClick={() => startEdit(m)}>
                      Editar
                    </button>
                    <button className={m.active ? 'danger' : 'primary'} onClick={() => toggleActive(m)}>
                      {m.active ? 'Inativar' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {machines.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    Nenhuma máquina cadastrada.
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
