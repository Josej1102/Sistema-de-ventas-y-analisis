import { useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw, Search, Undo2 } from 'lucide-react';
import { asList, get, patch, post } from '../api/http';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';

const emptyForm = {
  id_venta: '',
  id_metodo_pago: '',
  monto: '',
};

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function createReference() {
  return `REF-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
}

export default function PaymentsPage() {
  const [items, setItems] = useState([]);
  const [methods, setMethods] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [payments, paymentMethods, sales] = await Promise.all([
        get('/pagos'),
        get('/Metodos_de_Pago'),
        get('/ventas'),
      ]);

      setItems(asList(payments));
      setMethods(asList(paymentMethods));
      setPendingSales(
        asList(sales).filter((sale) => sale.id_estado_venta === 1)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return items;

    return items.filter((payment) =>
      `${payment.id_pago} ${payment.id_venta} ${payment.referencia || ''}`
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  function openCreate() {
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await post('/pagos', {
        id_venta: Number(form.id_venta),
        id_metodo_pago: Number(form.id_metodo_pago),
        monto: Number(form.monto),
        referencia: createReference(),
      });

      setMessage('Pago registrado correctamente.');
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function refund(id) {
    if (!window.confirm('¿Reembolsar este pago?')) return;

    try {
      await patch(`/pagos/${id}/reembolsar`);
      setMessage('Pago reembolsado correctamente.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const selectedSale = pendingSales.find(
    (sale) => String(sale.id_venta) === String(form.id_venta)
  );

  return (
    <div className="page-stack">
      <Toast message={message} />
      <Toast message={error} type="error" />

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Tesorería</span>
            <h3>Pagos</h3>
          </div>

          <div className="head-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Buscar pago, venta o referencia..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <button className="primary-btn" onClick={openCreate}>
              <Plus size={17} />
              Registrar pago
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState text="Cargando pagos..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Todavía no hay pagos"
            description="Los pagos realizados durante las ventas aparecerán aquí. También puedes registrar un abono para una venta pendiente."
            action={
              <button className="primary-btn" onClick={openCreate}>
                <Plus size={17} />
                Registrar primer pago
              </button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No encontramos coincidencias"
            description="Prueba con otro ID de venta, pago o referencia."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Venta</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Referencia</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((payment) => {
                  const method = methods.find(
                    (item) => item.id_metodo_pago === payment.id_metodo_pago
                  );

                  return (
                    <tr key={payment.id_pago}>
                      <td>#{payment.id_pago}</td>
                      <td>#{payment.id_venta}</td>
                      <td>{method?.nombre || `#${payment.id_metodo_pago}`}</td>
                      <td className="money">{money(payment.monto)}</td>
                      <td>
                        <span className={`status status-${payment.id_estado_pago}`}>
                          {payment.id_estado_pago === 1
                            ? 'Aprobado'
                            : payment.id_estado_pago === 2
                              ? 'Rechazado'
                              : 'Reembolsado'}
                        </span>
                      </td>
                      <td>
                        {new Date(payment.fecha_pago).toLocaleString('es-CO')}
                      </td>
                      <td><code>{payment.referencia || '—'}</code></td>
                      <td>
                        {payment.id_estado_pago === 1 && (
                          <button
                            className="icon-btn danger"
                            onClick={() => refund(payment.id_pago)}
                            title="Reembolsar pago"
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar pago"
      >
        <form className="form-stack" onSubmit={save}>
          <label>
            Venta pendiente
            <select
              name="id_venta"
              value={form.id_venta}
              onChange={change}
              required
            >
              <option value="">Seleccionar venta...</option>
              {pendingSales.map((sale) => (
                <option key={sale.id_venta} value={sale.id_venta}>
                  #{sale.numero_factura || sale.id_venta} · {money(sale.total)}
                </option>
              ))}
            </select>
          </label>

          {selectedSale && (
            <div className="info-box">
              Total de la venta: <strong>{money(selectedSale.total)}</strong>
            </div>
          )}

          <label>
            Método de pago
            <select
              name="id_metodo_pago"
              value={form.id_metodo_pago}
              onChange={change}
              required
            >
              <option value="">Seleccionar método...</option>
              {methods.map((method) => (
                <option key={method.id_metodo_pago} value={method.id_metodo_pago}>
                  {method.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Monto
            <input
              type="number"
              name="monto"
              min="0.01"
              step="0.01"
              value={form.monto}
              onChange={change}
              required
            />
          </label>

          <div className="info-box">
            <RotateCcw size={16} />
            La referencia interna se genera automáticamente al registrar el pago.
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button className="primary-btn" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
