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
  nombre: '',
  apellido: '',
  cargo: '',
  telefono: '',
  email: '',
  password: '',
  rol: 'empleado',
};

export default function EmployeesPage() {
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
      const data = await get('/empleados');
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

    return items.filter((employee) =>
      `${employee.nombre} ${employee.apellido || ''} ${employee.email || ''} ${employee.cargo || ''}`
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(employee) {
    setEditingId(employee.id_empleado);

    setForm({
      nombre: employee.nombre || '',
      apellido: employee.apellido || '',
      cargo: employee.cargo || '',
      telefono: employee.telefono || '',
      email: employee.email || '',
      password: '',
      rol: employee.rol || 'empleado',
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
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        cargo: form.cargo.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        rol: form.rol,
      };

      if (form.password.trim()) {
        body.password = form.password;
      }

      if (editingId) {
        await put(`/empleados/${editingId}`, body);
        setMessage('Empleado actualizado correctamente.');
      } else {
        await post('/empleados', {
          ...body,
          password: form.password,
        });

        setMessage('Empleado creado correctamente.');
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(employee) {
    const nuevoEstado = !employee.estado;

    const confirmMessage = nuevoEstado
      ? '¿Activar este empleado?'
      : '¿Desactivar este empleado?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await put(`/empleados/${employee.id_empleado}`, {
        estado: nuevoEstado,
      });

      setMessage(
        nuevoEstado
          ? 'Empleado activado correctamente.'
          : 'Empleado desactivado correctamente.'
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
            <span className="eyebrow">Administración</span>
            <h3>Empleados</h3>
          </div>

          <div className="head-actions">
            <div className="search-box">
              <Search size={17} />

              <input
                placeholder="Buscar empleado..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button className="primary-btn" onClick={openCreate}>
              <Plus size={17} />
              Nuevo empleado
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState text="Cargando empleados..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Todavía no hay empleados"
            description="Crea el primer usuario del sistema desde esta sección."
            action={
              <button className="primary-btn" onClick={openCreate}>
                <Plus size={17} />
                Crear empleado
              </button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No encontramos coincidencias"
            description="Prueba con otro nombre, cargo o correo."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Cargo</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((employee) => (
                  <tr key={employee.id_empleado}>
                    <td>
                      <strong>
                        {employee.nombre} {employee.apellido || ''}
                      </strong>
                    </td>

                    <td>{employee.cargo}</td>

                    <td>{employee.email}</td>

                    <td>
                      <span className="role-pill">
                        {employee.rol}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status ${
                          employee.estado
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {employee.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(employee)}
                          title="Editar empleado"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          className={`icon-btn ${
                            employee.estado ? 'danger' : ''
                          }`}
                          onClick={() => toggleStatus(employee)}
                          title={
                            employee.estado
                              ? 'Desactivar empleado'
                              : 'Activar empleado'
                          }
                        >
                          {employee.estado ? (
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
        title={editingId ? 'Editar empleado' : 'Nuevo empleado'}
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
              Apellido
              <input
                name="apellido"
                value={form.apellido}
                onChange={change}
              />
            </label>

            <label>
              Cargo
              <input
                name="cargo"
                value={form.cargo}
                onChange={change}
                required
              />
            </label>

            <label>
              Teléfono
              <input
                name="telefono"
                value={form.telefono}
                onChange={change}
                required
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
              Contraseña
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={change}
                placeholder={
                  editingId
                    ? 'Dejar vacía para conservar'
                    : ''
                }
                required={!editingId}
                minLength={8}
              />
            </label>

            <label>
              Rol
              <select
                name="rol"
                value={form.rol}
                onChange={change}
              >
                <option value="empleado">
                  Empleado
                </option>
                <option value="admin">
                  Administrador
                </option>
              </select>
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
                : 'Guardar empleado'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}