import { useEffect, useState } from 'react';
import { Edit3, Plus } from 'lucide-react';
import { get, post, put, asList } from '../api/http';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';

const emptyForm = {
  nombre: '',
  descripcion: '',
  estado: true,
};

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const data = await get('/categorias');
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

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditingId(category.id_categoria);
    setForm({
      nombre: category.nombre || '',
      descripcion: category.descripcion || '',
      estado: Boolean(category.estado),
    });
    setModalOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
      };

      if (editingId) {
        await put(`/categorias/${editingId}`, body);
        setMessage('Categoría actualizada correctamente.');
      } else {
        await post('/categorias', body);
        setMessage('Categoría creada correctamente.');
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <Toast message={message} />
      <Toast message={error} type="error" />

      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Catálogo</span>
            <h3>Categorías</h3>
          </div>

          <button className="primary-btn" onClick={openCreate}>
            <Plus size={17} />
            Nueva categoría
          </button>
        </div>

        {loading ? (
          <LoadingState text="Cargando categorías..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Todavía no hay categorías"
            description="Crea la primera categoría para comenzar a organizar tus productos."
            action={
              <button className="primary-btn" onClick={openCreate}>
                <Plus size={17} />
                Crear categoría
              </button>
            }
          />
        ) : (
          <div className="category-grid">
            {items.map((category) => (
              <article className="category-card" key={category.id_categoria}>
                <div className="category-symbol">
                  {(category.nombre || '?')[0].toUpperCase()}
                </div>

                <div>
                  <strong>{category.nombre}</strong>
                  <p>{category.descripcion || 'Sin descripción'}</p>
                  <span
                    className={`status ${
                      category.estado
                        ? 'status-active'
                        : 'status-inactive'
                    }`}
                  >
                    {category.estado ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <button
                  className="icon-btn"
                  onClick={() => openEdit(category)}
                  title="Editar categoría"
                >
                  <Edit3 size={16} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar categoría' : 'Nueva categoría'}
      >
        <form className="form-stack" onSubmit={save}>
          <label>
            Nombre
            <input
              value={form.nombre}
              onChange={(event) =>
                setForm({ ...form, nombre: event.target.value })
              }
              required
              maxLength={100}
              autoFocus
            />
          </label>

          <label>
            Descripción
            <textarea
              value={form.descripcion}
              onChange={(event) =>
                setForm({ ...form, descripcion: event.target.value })
              }
              maxLength={255}
            />
          </label>

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
              {saving ? 'Guardando...' : 'Guardar categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
