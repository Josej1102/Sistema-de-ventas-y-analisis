import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { asList, get, post, put } from '../api/http';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';

const emptyForm = {
  codigo_sku: '',
  nombre: '',
  descripcion: '',
  id_categoria: '',
  precio_compra: 0,
  precio_venta: 0,
  stock: 0,
  stock_minimo: 5,
};

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const [productsData, categoriesData] = await Promise.all([
        get('/productos'),
        get('/categorias'),
      ]);

      setItems(asList(productsData));
      setCategories(asList(categoriesData));
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

    return items.filter((product) =>
      `${product.nombre} ${product.codigo_sku}`
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingId(product.id_producto);
    setForm({
      codigo_sku: product.codigo_sku || '',
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      id_categoria: product.id_categoria || '',
      precio_compra: product.precio_compra || 0,
      precio_venta: product.precio_venta || 0,
      stock: product.stock || 0,
      stock_minimo: product.stock_minimo || 5,
    });
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
      const body = {
        codigo_sku: form.codigo_sku.trim(),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        id_categoria: Number(form.id_categoria),
        precio_compra: Number(form.precio_compra),
        precio_venta: Number(form.precio_venta),
        stock: Number(form.stock),
        stock_minimo: Number(form.stock_minimo),
      };

      if (editingId) {
        await put(`/productos/${editingId}`, body);
        setMessage('Producto actualizado correctamente.');
      } else {
        await post('/productos', body);
        setMessage('Producto creado correctamente.');
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    if (!window.confirm('¿Desactivar este producto?')) return;

    try {
      await put(`/productos/${id}`, { estado: false });
      setMessage('Producto desactivado correctamente.');
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
            <span className="eyebrow">Catálogo</span>
            <h3>Productos</h3>
          </div>

          <div className="head-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Buscar producto o SKU..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <button className="primary-btn" onClick={openCreate}>
              <Plus size={17} />
              Nuevo producto
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState text="Cargando productos..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Todavía no hay productos"
            description="Crea el primer producto para comenzar a vender y controlar inventario."
            action={
              <button className="primary-btn" onClick={openCreate}>
                <Plus size={17} />
                Crear producto
              </button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No encontramos productos"
            description="Prueba con otro nombre o código SKU."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Venta</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((product) => (
                  <tr key={product.id_producto}>
                    <td><code>{product.codigo_sku || '—'}</code></td>
                    <td>
                      <strong>{product.nombre}</strong>
                      <small className="table-sub">
                        {product.descripcion || 'Sin descripción'}
                      </small>
                    </td>
                    <td>{product.categoria || `#${product.id_categoria}`}</td>
                    <td className="money">{money(product.precio_venta)}</td>
                    <td>
                      <span
                        className={
                          Number(product.stock) <= Number(product.stock_minimo)
                            ? 'stock-low'
                            : ''
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          product.estado
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {product.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(product)}
                          title="Editar producto"
                        >
                          <Edit3 size={16} />
                        </button>
                        {product.estado && (
                          <button
                            className="icon-btn danger"
                            onClick={() => deactivate(product.id_producto)}
                            title="Desactivar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
        title={editingId ? 'Editar producto' : 'Nuevo producto'}
        wide
      >
        <form className="form-stack" onSubmit={save}>
          <div className="form-grid">
            <label>
              SKU
              <input
                name="codigo_sku"
                value={form.codigo_sku}
                onChange={change}
                required
                maxLength={50}
              />
            </label>
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={change} required />
            </label>
            <label>
              Categoría
              <select
                name="id_categoria"
                value={form.id_categoria}
                onChange={change}
                required
              >
                <option value="">Seleccionar...</option>
                {categories
                  .filter((category) => category.estado)
                  .map((category) => (
                    <option
                      key={category.id_categoria}
                      value={category.id_categoria}
                    >
                      {category.nombre}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Precio de venta
              <input
                type="number"
                name="precio_venta"
                min="0"
                step="0.01"
                value={form.precio_venta}
                onChange={change}
                required
              />
            </label>
            <label>
              Precio de compra
              <input
                type="number"
                name="precio_compra"
                min="0"
                step="0.01"
                value={form.precio_compra}
                onChange={change}
              />
            </label>
            <label>
              Stock inicial
              <input
                type="number"
                name="stock"
                min="0"
                value={form.stock}
                onChange={change}
              />
            </label>
            <label>
              Stock mínimo
              <input
                type="number"
                name="stock_minimo"
                min="0"
                value={form.stock_minimo}
                onChange={change}
              />
            </label>
          </div>

          <label>
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={change}
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
              {saving ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
