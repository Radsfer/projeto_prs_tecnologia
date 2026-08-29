import { useEffect, useState } from 'react';
import { api, download } from '../api';

interface Record {
  id: string;
  date: string;
  quantity: number;
  downtimeMinutes: number;
  source: string;
  machine: { name: string; unit: string };
  shift: { name: string };
  operatorName: string | null;
  quantityWithUnit: string;
  efficiency: number | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function Records() {
  const [records, setRecords] = useState<Record[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [machines, setMachines] = useState<{ id: string; name: string }[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [machineId, setMachineId] = useState('');
  const [error, setError] = useState('');

  const pageSize = 20;

  async function load(p: number) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('pageSize', String(pageSize));
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (machineId) params.set('machineId', machineId);

    const data = await api<{ records: Record[]; pagination: Pagination }>(`/api/records?${params.toString()}`);
    setRecords(data.records);
    setPagination(data.pagination);
  }

  useEffect(() => {
    load(1).catch((e) => setError((e as Error).message));
    api<{ machines: { id: string; name: string }[] }>('/api/machines')
      .then((d) => setMachines(d.machines))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applyFilters() {
    setError('');
    try {
      await load(1);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function exportCsv() {
    setError('');
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (machineId) params.set('machineId', machineId);
      await download(`/api/export?${params.toString()}`, 'prodtrack-apontamentos.csv');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const ddmm = (iso: string) => iso.split('-').reverse().join('/');

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Apontamentos</h1>
          <p>Auditoria do histórico produtivo (manual + IoT)</p>
        </div>
        <button className="primary" onClick={exportCsv}>
          Exportar CSV
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="form-row">
          <label style={{ marginBottom: 0 }}>
            <span>De</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label style={{ marginBottom: 0 }}>
            <span>Até</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label style={{ marginBottom: 0 }}>
            <span>Máquina</span>
            <select value={machineId} onChange={(e) => setMachineId(e.target.value)}>
              <option value="">Todas</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <button onClick={applyFilters}>Filtrar</button>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Máquina</th>
                <th>Turno</th>
                <th>Operador</th>
                <th>Produção</th>
                <th>Parada</th>
                <th>Eficiência</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{ddmm(r.date)}</td>
                  <td>{r.machine.name}</td>
                  <td>{r.shift.name}</td>
                  <td>{r.operatorName ?? <span className="muted">—</span>}</td>
                  <td>{r.quantityWithUnit}</td>
                  <td>{r.downtimeMinutes} min</td>
                  <td>
                    <span
                      className={`badge ${r.efficiency === null ? 'neutral' : r.efficiency < 80 ? 'critical' : 'ok'}`}
                    >
                      {r.efficiency === null ? '—' : `${r.efficiency}%`}
                    </span>
                  </td>
                  <td>
                    <span className="badge neutral">{r.source === 'IOT' ? 'IoT' : 'Manual'}</span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    Nenhum apontamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <button disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>
            Anterior
          </button>
          <span>
            Página {pagination.page} de {Math.max(pagination.totalPages, 1)} · {pagination.total} registros
          </span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
