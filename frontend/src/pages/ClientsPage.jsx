import { useEffect, useMemo, useState } from 'react';
import {
  Edit3,
  Plus,
  Search,
  UserRound,
  UserRoundCheck,
} from 'lucide-react';
import { asList, get, post, put } from '../api/http';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';

const emptyForm = {
  tipo_documento: 'CC',
  numero_documento: '',
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  direccion: '',
  ciudad: '',
};

export default function ClientsPage() {
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
      const data = await get('/clientes');
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

    return items.filter((client) =>
      `${client.nombre} ${client.apellido || ''} ${client.numero_documento}`
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(client) {
    setEditingId(client.id_cliente);

    setForm({
      tipo_documento: client.tipo_documento || 'CC',
      numero_documento: client.numero_documento || '',
      nombre: client.nombre || '',
      apellido: client.apellido || '',
      telefono: client.telefono || '',
      email: client.email || '',
      direccion: client.direccion || '',
      ciudad: client.ciudad || '',
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
      const body = {
        ...form,
        tipo_documento: form.tipo_documento.trim(),
        numero_documento: form.numero_documento.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
      };

      if (editingId) {
        await put(`/clientes/${editingId}`, body);
        setMessage('Cliente actualizado correctamente.');
      } else {
        await post('/clientes', body);
        setMessage('Cliente creado correctamente.');
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(client) {
    const nuevoEstado = !client.estado;

    const confirmMessage = nuevoEstado
      ? '¿Activar este cliente?'
      : '¿Desactivar este cliente?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await put(`/clientes/${client.id_cliente}`, {
        estado: nuevoEstado,
      });

      setMessage(
        nuevoEstado
          ? 'Cliente activado correctamente.'
          : 'Cliente desactivado correctamente.'
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
            <span className="eyebrow">Relación comercial</span>
            <h3>Clientes</h3>
          </div>

          <div className="head-actions">
            <div className="search-box">
              <Search size={17} />

              <input
                placeholder="Nombre o documento..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button className="primary-btn" onClick={openCreate}>
              <Plus size={17} />
              Nuevo cliente
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState text="Cargando clientes..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Todavía no hay clientes"
            description="Registra el primer cliente para poder asociarlo a las ventas."
            action={
              <button className="primary-btn" onClick={openCreate}>
                <Plus size={17} />
                Crear cliente
              </button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No encontramos coincidencias"
            description="Prueba con otro nombre o número de documento."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((client) => (
                  <tr key={client.id_cliente}>
                    <td>
                      <strong>{client.tipo_documento}</strong>{' '}
                      {client.numero_documento}
                    </td>

                    <td>
                      <strong>
                        {client.nombre} {client.apellido || ''}
                      </strong>
                    </td>

                    <td>
                      {client.telefono || '—'}

                      <small className="table-sub">
                        {client.email || ''}
                      </small>
                    </td>

                    <td>{client.ciudad || '—'}</td>

                    <td>
                      <span
                        className={`status ${
                          client.estado
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {client.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(client)}
                          title="Editar cliente"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          className={`icon-btn ${
                            client.estado ? 'danger' : ''
                          }`}
                          onClick={() => toggleStatus(client)}
                          title={
                            client.estado
                              ? 'Desactivar cliente'
                              : 'Activar cliente'
                          }
                        >
                          {client.estado ? (
                            <UserRound size={16} />
                          ) : (
                            <UserRoundCheck size={16} />
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
        title={editingId ? 'Editar cliente' : 'Nuevo cliente'}
        wide
      >
        <form className="form-stack" onSubmit={save}>
          <div className="form-grid">
            <label>
              Tipo de documento

              <select
                name="tipo_documento"
                value={form.tipo_documento}
                onChange={change}
              >
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </label>

            <label>
              Número de documento

              <input
                name="numero_documento"
                value={form.numero_documento}
                onChange={change}
                required
              />
            </label>

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
              Apellido

              <input
                name="apellido"
                value={form.apellido}
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
              Ciudad

              <input
                name="ciudad"
                value={form.ciudad}
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

            <button className="primary-btn" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}