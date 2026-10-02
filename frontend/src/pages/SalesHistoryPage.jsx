import { useEffect, useMemo, useState } from 'react';
import { Ban, Eye, Search } from 'lucide-react';
import { asList, get, patch } from '../api/http';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function saleStatus(id) {
  if (id === 1) return 'Pendiente';
  if (id === 2) return 'Pagada';
  return 'Anulada';
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [salesData, clientsData] = await Promise.all([
        get('/ventas'),
        get('/clientes'),
      ]);

      setSales(asList(salesData));
      setClients(asList(clientsData));
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
    const value = search.toLowerCase().trim();
    if (!value) return sales;

    return sales.filter((sale) => {
      const client = clients.find(
        (item) => item.id_cliente === sale.id_cliente
      );

      return `${sale.numero_factura} ${sale.id_venta} ${client?.nombre || ''} ${client?.apellido || ''} ${client?.numero_documento || ''}`
        .toLowerCase()
        .includes(value);
    });
  }, [sales, clients, search]);

  async function cancelSale(id) {
    if (
      !window.confirm(
        '¿Anular esta venta? El stock será restaurado y los pagos aprobados se marcarán como reembolsados.'
      )
    ) {
      return;
    }

    try {
      await patch(`/ventas/${id}/anular`);
      setMessage('Venta anulada correctamente.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <Toast message={message} />
      <Toast message={error} type="error" />

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Histórico</span>
            <h3>Ventas registradas</h3>
          </div>

          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Factura, cliente o documento..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingState text="Cargando ventas..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : sales.length === 0 ? (
          <EmptyState
            title="Todavía no hay ventas"
            description="Las ventas que registres desde el punto de venta aparecerán aquí."
          />
        ) : filteredSales.length === 0 ? (
          <EmptyState
            title="No encontramos ventas"
            description="Prueba con otra factura, cliente o documento."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Empleado</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const client = clients.find(
                    (item) => item.id_cliente === sale.id_cliente
                  );

                  return (
                    <tr key={sale.id_venta}>
                      <td><strong>#{sale.numero_factura || sale.id_venta}</strong></td>
                      <td>{new Date(sale.fecha_venta).toLocaleString('es-CO')}</td>
                      <td>
                        {client
                          ? `${client.nombre} ${client.apellido || ''}`
                          : `Cliente #${sale.id_cliente}`}
                      </td>
                      <td>#{sale.id_empleado}</td>
                      <td>
                        <span className={`status status-${sale.id_estado_venta}`}>
                          {saleStatus(sale.id_estado_venta)}
                        </span>
                      </td>
                      <td className="money">{money(sale.total)}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn"
                            onClick={() => setSelected(sale)}
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                          {sale.id_estado_venta !== 3 && (
                            <button
                              className="icon-btn danger"
                              onClick={() => cancelSale(sale.id_venta)}
                              title="Anular venta"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Venta #${selected?.numero_factura || selected?.id_venta || ''}`}
      >
        {selected && (
          <div className="detail-grid">
            <div>
              <span>Cliente</span>
              <strong>
                {clients.find((c) => c.id_cliente === selected.id_cliente)?.nombre ||
                  `#${selected.id_cliente}`}
              </strong>
            </div>
            <div><span>Empleado</span><strong>#{selected.id_empleado}</strong></div>
            <div><span>Estado</span><strong>{saleStatus(selected.id_estado_venta)}</strong></div>
            <div><span>Subtotal</span><strong>{money(selected.subtotal)}</strong></div>
            <div><span>Impuesto</span><strong>{money(selected.impuesto)}</strong></div>
            <div><span>Descuento</span><strong>{money(selected.descuento)}</strong></div>
            <div><span>Total</span><strong>{money(selected.total)}</strong></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
