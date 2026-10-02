import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { asList, get } from '../api/http';
import StatCard from '../components/StatCard';
import { ErrorState, LoadingState } from '../components/PageState';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

// Convierte una fecha a la fecha correspondiente en Colombia
const getColombiaDate = (date) =>
  new Date(date).toLocaleDateString('en-CA', {
    timeZone: 'America/Bogota',
  });

// Obtiene la fecha actual en Colombia
const getTodayColombia = () =>
  new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Bogota',
  });

export default function DashboardPage() {
  const [data, setData] = useState({
    products: [],
    clients: [],
    sales: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');

    try {
      const [products, clients, sales] = await Promise.all([
        get('/productos'),
        get('/clientes'),
        get('/ventas'),
      ]);

      setData({
        products: asList(products),
        clients: asList(clients),
        sales: asList(sales),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Cargar información al entrar al Dashboard
    load();

    // Actualizar cuando el usuario vuelve a la pestaña
    const handleFocus = () => {
      load();
    };

    // Actualizar automáticamente cada 30 segundos
    const interval = setInterval(() => {
      load();
    }, 30000);

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const metrics = useMemo(() => {
    const today = getTodayColombia();

    const todaySales = data.sales.filter(
      (sale) =>
        getColombiaDate(sale.fecha_venta) === today &&
        Number(sale.id_estado_venta) !== 3
    );

    return {
      revenue: todaySales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      ),

      sales: todaySales.length,

      products: data.products.filter(
        (product) => product.estado
      ).length,

      low: data.products.filter(
        (product) =>
          product.estado &&
          Number(product.stock) <= Number(product.stock_minimo)
      ).length,
    };
  }, [data]);

  const recentSales = [...data.sales]
    .sort(
      (a, b) =>
        new Date(b.fecha_venta).getTime() -
        new Date(a.fecha_venta).getTime()
    )
    .slice(0, 7);

  if (loading) {
    return (
      <LoadingState text="Cargando resumen operativo..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={load}
      />
    );
  }

  const lowStockProducts = data.products
    .filter(
      (product) =>
        product.estado &&
        Number(product.stock) <= Number(product.stock_minimo)
    )
    .slice(0, 8);

  return (
    <div className="page-stack">
      <div className="welcome">
        <div>
          <span className="eyebrow">Resumen operativo</span>

          <h2>Tu negocio, en una vista.</h2>

          <p>
            Monitorea la operación y entra rápido a las
            tareas del día.
          </p>
        </div>

        <div className="welcome-badge">
          <TrendingUp size={18} />
          Operación activa
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={CircleDollarSign}
          label="Ventas de hoy"
          value={money(metrics.revenue)}
          tone="accent"
        />

        <StatCard
          icon={ShoppingBag}
          label="Transacciones hoy"
          value={metrics.sales}
        />

        <StatCard
          icon={Boxes}
          label="Productos activos"
          value={metrics.products}
        />

        <StatCard
          icon={AlertTriangle}
          label="Stock por revisar"
          value={metrics.low}
          tone={metrics.low ? 'warning' : ''}
        />
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Actividad</span>

              <h3>Ventas recientes</h3>
            </div>

            <span className="muted">
              {data.sales.length} registradas
            </span>
          </div>

          {recentSales.length === 0 ? (
            <div className="empty">
              Aún no hay ventas.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id_venta}>
                      <td>
                        <strong>
                          #
                          {sale.numero_factura ||
                            sale.id_venta}
                        </strong>
                      </td>

                      <td>
                        {new Date(
                          sale.fecha_venta
                        ).toLocaleString('es-CO', {
                          timeZone: 'America/Bogota',
                        })}
                      </td>

                      <td>
                        Cliente #{sale.id_cliente}
                      </td>

                      <td className="money">
                        {money(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                Inventario
              </span>

              <h3>Alertas de stock</h3>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="empty">
              <Boxes size={28} />

              No hay productos bajo mínimo.
            </div>
          ) : (
            lowStockProducts.map((product) => (
              <div
                className="alert-row"
                key={product.id_producto}
              >
                <div>
                  <strong>
                    {product.nombre}
                  </strong>

                  <span>
                    SKU {product.codigo_sku}
                  </span>
                </div>

                <b>
                  {product.stock} / mín.{' '}
                  {product.stock_minimo}
                </b>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}