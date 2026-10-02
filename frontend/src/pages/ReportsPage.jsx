import { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { asList, get } from '../api/http';
import StatCard from '../components/StatCard';
import { ErrorState, LoadingState } from '../components/PageState';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function getSaleStatus(id) {
  if (id === 1) return 'Pendiente';
  if (id === 2) return 'Pagada';
  return 'Anulada';
}

function buildCsv(rows) {
  const header = [
    'Factura',
    'Fecha',
    'Cliente',
    'Empleado',
    'Estado',
    'Total',
  ];

  const body = rows.map((sale) => [
    sale.numero_factura || sale.id_venta,
    new Date(sale.fecha_venta).toLocaleString('es-CO'),
    sale.id_cliente,
    sale.id_empleado,
    getSaleStatus(sale.id_estado_venta),
    Number(sale.total),
  ]);

  return [header, ...body]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    )
    .join('\n');
}

export default function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [range, setRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [salesData, productsData] = await Promise.all([
        get('/ventas'),
        get('/productos'),
      ]);

      setSales(asList(salesData));
      setProducts(asList(productsData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredSales = useMemo(() => {
    if (range === 'all') return sales;

    const now = Date.now();
    const days = range === '7' ? 7 : 30;

    return sales.filter((sale) => {
      const date = new Date(sale.fecha_venta).getTime();
      return (now - date) / 86400000 <= days;
    });
  }, [sales, range]);

  const paidSales = filteredSales.filter(
    (sale) => sale.id_estado_venta === 2
  );

  const revenue = paidSales.reduce(
    (sum, sale) => sum + Number(sale.total),
    0
  );

  const average = paidSales.length ? revenue / paidSales.length : 0;

  const lowStock = products.filter(
    (product) =>
      product.estado &&
      Number(product.stock) <= Number(product.stock_minimo)
  ).length;

  function downloadCsv() {
    const blob = new Blob([buildCsv(filteredSales)], {
      type: 'text/csv;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `reporte-ventas-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <LoadingState text="Preparando reportes..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  return (
    <div className="page-stack">
      <div className="welcome">
        <div>
          <span className="eyebrow">Análisis</span>
          <h2>Reportes operativos</h2>
          <p>Indicadores calculados con la información disponible en tu API.</p>
        </div>

        <div className="head-actions">
          <select value={range} onChange={(event) => setRange(event.target.value)}>
            <option value="all">Todo el histórico</option>
            <option value="30">Últimos 30 días</option>
            <option value="7">Últimos 7 días</option>
          </select>

          <button className="primary-btn" onClick={downloadCsv}>
            <Download size={17} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={TrendingUp}
          label="Ventas pagadas"
          value={money(revenue)}
          tone="accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Transacciones pagadas"
          value={paidSales.length}
        />
        <StatCard
          icon={TrendingUp}
          label="Ticket promedio"
          value={money(average)}
        />
        <StatCard
          icon={TrendingUp}
          label="Alertas de stock"
          value={lowStock}
        />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Ventas</span>
            <h3>Detalle exportable</h3>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="empty">No hay ventas para el periodo seleccionado.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.slice(0, 100).map((sale) => (
                  <tr key={sale.id_venta}>
                    <td>#{sale.numero_factura || sale.id_venta}</td>
                    <td>{new Date(sale.fecha_venta).toLocaleString('es-CO')}</td>
                    <td>#{sale.id_cliente}</td>
                    <td>{getSaleStatus(sale.id_estado_venta)}</td>
                    <td className="money">{money(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
