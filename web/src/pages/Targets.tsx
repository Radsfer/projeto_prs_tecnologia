import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';

interface Machine {
  id: string;
  name: string;
  unit: string;
}

interface Shift {
  id: string;
  name: string;
}

interface Target {
  id: string;
  machineId: string;
  shiftId: string;
  date: string;
  quantity: number;
  machine: { name: string; unit: string };
  shift: { name: string };
}

const unitLabel: Record<string, string> = {
  pieces: 'peças',
  kg: 'kg',
  liters: 'litros',
  meters: 'metros',
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Targets() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [machineId, setMachineId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [date, setDate] = useState(today());
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadTargets() {
    const data = await api<{ targets: Target[] }>('/api/targets');
    setTargets(data.targets);
  }

  useEffect(() => {
    api<{ machines: Machine[]; shifts: Shift[] }>('/api/catalog')
      .then((d) => {
        setMachines(d.machines);
        setShifts(d.shifts);
        setMachineId(d.machines[0]?.id ?? '');
        setShiftId(d.shifts[0]?.id ?? '');
      })
      .catch((e) => setError((e as Error).message));
    loadTargets().catch((e) => setError((e as Error).message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api('/api/targets', {
        method: 'POST',
        body: JSON.stringify({ machineId, shiftId, date, quantity: Number(quantity) }),
      });
      setSuccess('Meta criada');
      setQuantity('');
      await loadTargets();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remover esta meta?')) return;
    setError('');
    setSuccess('');
    try {
      await api(`/api/targets/${id}`, { method: 'DELETE' });
      setSuccess('Meta removida');
      await loadTargets();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const ddmm = (iso: string) => iso.split('-').reverse().join('/');

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Metas de produção</h1>
          <p>Alvos quantitativos por máquina, turno e data (unicidade composta)</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>Nova meta</h2>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              <span>Máquina</span>
              <select value={machineId} onChange={(e) => setMachineId(e.target.value)} required>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Turno</span>
              <select value={shiftId} onChange={(e) => setShiftId(e.target.value)} required>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Data</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              <span>Quantidade (máx. 999.999)</span>
              <input
                type="number"
                min={1}
                max={999999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </label>
            <div>
              <button className="primary" type="submit">
                Criar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Máquina</th>
                <th>Turno</th>
                <th>Data</th>
                <th>Meta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id}>
                  <td>{t.machine.name}</td>
                  <td>{t.shift.name}</td>
                  <td>{ddmm(t.date)}</td>
                  <td>
                    {t.quantity.toLocaleString('pt-BR')} {unitLabel[t.machine.unit] ?? t.machine.unit}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="danger" onClick={() => remove(t.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {targets.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    Nenhuma meta cadastrada.
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
