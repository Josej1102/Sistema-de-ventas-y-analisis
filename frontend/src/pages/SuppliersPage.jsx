import { useEffect, useMemo, useState } from 'react';
import {
  Edit3,
  Plus,
  Search,
  Truck,
  TruckIcon,
} from 'lucide-react';
import { asList, get, post, put } from '../api/http';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/PageState';

const emptyForm = {
  nombre: '',
  contacto: '',
  telefono: '',
  email: '',
  direccion: '',
};

export default function SuppliersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
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
      const data = await get('/proveedores');
      setItems(asList(data));
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
    const value = search.toLowerCase().trim();

    if (!value) return items;

    return items.filter((supplier) =>
      `${supplier.nombre} ${supplier.contacto || ''} ${supplier.email || ''}`
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(supplier) {
    setEditingId(supplier.id_proveedor);

    setForm({
      nombre: supplier.nombre || '',
      contacto: supplier.contacto || '',
      telefono: supplier.telefono || '',
      email: supplier.email || '',
      direccion: supplier.direccion || '',
    });

    setModalOpen(true);
  }

  function change(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [
          key,
          value.trim(),
        ])
      );

      if (editingId) {
        await put(`/proveedores/${editingId}`, body);
        setMessage('Proveedor actualizado correctamente.');
      } else {
        await post('/proveedores', body);
        setMessage('Proveedor creado correctamente.');
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(supplier) {
    const nuevoEstado = !supplier.estado;

    const confirmMessage = nuevoEstado
      ? '¿Activar este proveedor?'
      : '¿Desactivar este proveedor?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await put(`/proveedores/${supplier.id_proveedor}`, {
        estado: nuevoEstado,
      });

      setMessage(
        nuevoEstado
          ? 'Proveedor activado correctamente.'
          : 'Proveedor desactivado correctamente.'
      );

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
            <span className="eyebrow">Abastecimiento</span>
            <h3>Proveedores</h3>
          </div>

          <div className="head-actions">
            <div className="search-box">
              <Search size={17} />

              <input
                placeholder="Buscar proveedor..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button className="primary-btn" onClick={openCreate}>
              <Plus size={17} />
              Nuevo proveedor
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState text="Cargando proveedores..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Todavía no hay proveedores"
            description="Registra el primer proveedor para poder gestionar tus compras."
            action={
              <button className="primary-btn" onClick={openCreate}>
                <Plus size={17} />
                Crear proveedor
              </button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No encontramos coincidencias"
            description="Prueba con otro nombre, contacto o correo."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((supplier) => (
                  <tr key={supplier.id_proveedor}>
                    <td>
                      <strong>{supplier.nombre}</strong>
                    </td>

                    <td>
                      {supplier.contacto || '—'}
                    </td>

                    <td>
                      {supplier.telefono || '—'}
                    </td>

                    <td>
                      {supplier.email || '—'}
                    </td>

                    <td>
                      <span
                        className={`status ${
                          supplier.estado
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {supplier.estado
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(supplier)}
                          title="Editar proveedor"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          className={`icon-btn ${
                            supplier.estado ? 'danger' : ''
                          }`}
                          onClick={() =>
                            toggleStatus(supplier)
                          }
                          title={
                            supplier.estado
                              ? 'Desactivar proveedor'
                              : 'Activar proveedor'
                          }
                        >
                          {supplier.estado ? (
                            <Truck size={16} />
                          ) : (
                            <TruckIcon size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId
            ? 'Editar proveedor'
            : 'Nuevo proveedor'
        }
        wide
      >
        <form className="form-stack" onSubmit={save}>
          <div className="form-grid">
            <label>
              Nombre

              <input
                name="nombre"
                value={form.nombre}
                onChange={change}
                required
              />
            </label>

            <label>
              Contacto

              <input
                name="contacto"
                value={form.contacto}
                onChange={change}
              />
            </label>

            <label>
              Teléfono

              <input
                name="telefono"
                value={form.telefono}
                onChange={change}
              />
            </label>

            <label>
              Email

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                required
              />
            </label>

            <label>
              Dirección

              <input
                name="direccion"
                value={form.direccion}
                onChange={change}
                required
              />
            </label>
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

            <button
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : 'Guardar proveedor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}