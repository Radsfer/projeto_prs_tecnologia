import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export default function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('14:00');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const data = await api<{ shifts: Shift[] }>('/api/shifts');
    setShifts(data.shifts);
  }

  useEffect(() => {
    load().catch((e) => setError((e as Error).message));
  }, []);

  function resetForm() {
    setName('');
    setStartTime('06:00');
    setEndTime('14:00');
    setEditingId(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const body = { name, startTime, endTime };
      if (editingId) {
        await api(`/api/shifts/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        setSuccess('Turno atualizado');
      } else {
        await api('/api/shifts', { method: 'POST', body: JSON.stringify(body) });
        setSuccess('Turno criado');
      }
      resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function startEdit(s: Shift) {
    setEditingId(s.id);
    setName(s.name);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Turnos</h1>
          <p>Segmentação temporal da operação (horários HH:MM)</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>{editingId ? 'Editar turno' : 'Novo turno'}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              <span>Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              <span>Início</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </label>
            <label>
              <span>Término</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
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
                <th>Nome</th>
                <th>Início</th>
                <th>Término</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.startTime}</td>
                  <td>{s.endTime}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="ghost" onClick={() => startEdit(s)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    Nenhum turno cadastrado.
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
