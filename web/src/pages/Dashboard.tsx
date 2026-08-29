import { useEffect, useState } from 'react';
import { api } from '../api';

interface UnitAgg {
  unit: string;
  production: number;
  target: number;
  downtimeHours: number;
  efficiency: number | null;
}

interface MachineAgg {
  machineId: string;
  name: string;
  unit: string;
  production: number;
  target: number;
  downtimeHours: number;
  efficiency: number | null;
}

interface DashboardData {
  byUnit: UnitAgg[];
  critical: MachineAgg[];
  machines: MachineAgg[];
}

const unitLabel: Record<string, string> = {
  pieces: 'peças',
  kg: 'kg',
  liters: 'litros',
  meters: 'metros',
};

const pct = (n: number | null): string => (n === null ? '—' : `${n}%`);

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<DashboardData>('/api/dashboard')
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Produção, metas e eficiência do parque fabril</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {data && (
        <>
          <div className="metrics">
            {data.byUnit.map((u) => (
              <div className="metric" key={u.unit}>
                <div className="label">Produção — {unitLabel[u.unit] ?? u.unit}</div>
                <div className="value">{u.production.toLocaleString('pt-BR')}</div>
                <div className="hint">
                  meta {u.target.toLocaleString('pt-BR')} · {pct(u.efficiency)}
                </div>
              </div>
            ))}
            {data.byUnit.map((u) => (
              <div className="metric" key={`d-${u.unit}`}>
                <div className="label">Paradas — {unitLabel[u.unit] ?? u.unit}</div>
                <div className="value">{u.downtimeHours}h</div>
                <div className="hint">tempo não produtivo</div>
              </div>
            ))}
          </div>

          {data.critical.length > 0 && (
            <div className="panel" style={{ marginBottom: 20 }}>
              <h2>Atenção — abaixo de 80%</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Máquina</th>
                      <th>Unidade</th>
                      <th>Produção</th>
                      <th>Meta</th>
                      <th>Eficiência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.critical.map((m) => (
                      <tr key={m.machineId}>
                        <td>{m.name}</td>
                        <td>{unitLabel[m.unit] ?? m.unit}</td>
                        <td>{m.production.toLocaleString('pt-BR')}</td>
                        <td>{m.target.toLocaleString('pt-BR')}</td>
                        <td>
                          <span className="badge critical">{pct(m.efficiency)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="panel">
            <h2>Máquinas</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Máquina</th>
                    <th>Unidade</th>
                    <th>Produção</th>
                    <th>Meta</th>
                    <th>Parada</th>
                    <th>Eficiência</th>
                  </tr>
                </thead>
                <tbody>
                  {data.machines.map((m) => (
                    <tr key={m.machineId}>
                      <td>{m.name}</td>
                      <td>{unitLabel[m.unit] ?? m.unit}</td>
                      <td>{m.production.toLocaleString('pt-BR')}</td>
                      <td>{m.target.toLocaleString('pt-BR')}</td>
                      <td>{m.downtimeHours}h</td>
                      <td>
                        <span
                          className={`badge ${
                            m.efficiency === null ? 'neutral' : m.efficiency < 80 ? 'critical' : 'ok'
                          }`}
                        >
                          {pct(m.efficiency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
