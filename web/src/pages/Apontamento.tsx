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

interface SubmitResult {
  record: { id: string; quantity: number; quantityWithUnit: string };
  target: { quantity: number } | null;
  efficiency: number | null;
  alert: boolean;
}

const unitLabel: Record<string, string> = {
  pieces: 'peças',
  kg: 'kg',
  liters: 'litros',
  meters: 'metros',
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Apontamento() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [machineId, setMachineId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [date, setDate] = useState(today());
  const [quantity, setQuantity] = useState('');
  const [downtime, setDowntime] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(false);

  const machine = machines.find((m) => m.id === machineId);

  useEffect(() => {
    api<{ machines: Machine[]; shifts: Shift[] }>('/api/catalog')
      .then((d) => {
        setMachines(d.machines);
        setShifts(d.shifts);
        setMachineId(d.machines[0]?.id ?? '');
        setShiftId(d.shifts[0]?.id ?? '');
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api<SubmitResult>('/api/records', {
        method: 'POST',
        body: JSON.stringify({
          machineId,
          shiftId,
          date,
          quantity: Number(quantity),
          downtimeMinutes: Number(downtime || 0),
        }),
      });
      setResult(data);
      setQuantity('');
      setDowntime('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="apontamento">
      <h1>Novo apontamento</h1>
      <p className="muted">Registre a produção e as paradas do turno</p>

      {error && <div className="error">{error}</div>}

      {result &&
        (result.alert ? (
          <div className="alert-banner critical">
            <strong>Eficiência abaixo de 80%</strong>
            <span>
              Produção {result.record.quantityWithUnit} · eficiência {result.efficiency}%
            </span>
          </div>
        ) : result.target === null ? (
          <div className="alert-banner neutral">
            <strong>Registrado sem meta</strong>
            <span>Este apontamento não possui planejamento prévio.</span>
          </div>
        ) : (
          <div className="alert-banner ok">
            <strong>Apontamento registrado</strong>
            <span>
              Eficiência {result.efficiency}% · meta {result.target?.quantity}{' '}
              {unitLabel[machine?.unit ?? ''] ?? ''}
            </span>
          </div>
        ))}

      <form className="op-form" onSubmit={onSubmit}>
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
          <span>Produção ({unitLabel[machine?.unit ?? ''] ?? 'quantidade'})</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>

        <label>
          <span>Parada (minutos)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={downtime}
            onChange={(e) => setDowntime(e.target.value)}
            placeholder="0"
          />
        </label>

        <button className="primary" type="submit" disabled={loading || !machineId || !shiftId}>
          {loading ? 'Registrando…' : 'Registrar apontamento'}
        </button>
      </form>
    </div>
  );
}
