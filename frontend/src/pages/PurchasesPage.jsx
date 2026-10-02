import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Search } from 'lucide-react';
import { asList, get, post } from '../api/http';
import { Toast } from '../components/Toast';
import { ErrorState, LoadingState } from '../components/PageState';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function PurchasesPage() {
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [providerId, setProviderId] = useState('');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [tax, setTax] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [providersData, productsData] = await Promise.all([
        get('/proveedores'),
        get('/productos'),
      ]);

      setProviders(asList(providersData));
      setProducts(asList(productsData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products
      .filter((product) => product.estado)
      .filter((product) =>
        `${product.nombre} ${product.codigo_sku}`
          .toLowerCase()
          .includes(value)
      )
      .slice(0, 18);
  }, [products, search]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const total = Math.max(
    0,
    subtotal + Number(tax || 0) - Number(discount || 0)
  );

  function addProduct(product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id_producto === product.id_producto
      );

      if (existing) {
        return current.map((item) =>
          item.id_producto === product.id_producto
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id_producto: product.id_producto,
          name: product.nombre,
          price: Number(product.precio_compra),
          qty: 1,
        },
      ];
    });
  }

  function changeQuantity(id, delta) {
    setCart((current) =>
      current.map((item) =>
        item.id_producto === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  }

  async function submitPurchase(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!providerId) {
      setError('Selecciona un proveedor.');
      return;
    }

    if (!cart.length) {
      setError('Agrega al menos un producto.');
      return;
    }

    setBusy(true);

    try {
      await post('/compras', {
        id_proveedor: Number(providerId),
        productos: cart.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.qty,
          precio_unitario: item.price,
        })),
        impuesto: Number(tax) || 0,
        descuento: Number(discount) || 0,
      });

      setMessage('Compra registrada y stock actualizado.');
      setCart([]);
      setProviderId('');
      setTax('0');
      setDiscount('0');

      const productsData = await get('/productos');
      setProducts(asList(productsData));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingState text="Preparando el módulo de compras..." />;
  }

  if (error && !products.length && !providers.length) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="pos-layout">
      <Toast message={message} />
      <Toast message={error} type="error" />

      <section className="pos-products panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Abastecimiento</span>
            <h3>Seleccionar productos</h3>
          </div>

          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Buscar producto o SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty">No hay productos activos disponibles.</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <button
                className="product-tile"
                key={product.id_producto}
                onClick={() => addProduct(product)}
              >
                <span className="product-code">{product.codigo_sku}</span>
                <strong>{product.nombre}</strong>
                <span>{money(product.precio_compra)}</span>
                <small>Stock actual {product.stock}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="cart panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Entrada de inventario</span>
            <h3>Nueva compra</h3>
          </div>
        </div>

        <form className="form-stack" onSubmit={submitPurchase}>
          <label>
            Proveedor
            <select
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              required
            >
              <option value="">Seleccionar proveedor...</option>
              {providers
                .filter((provider) => provider.estado)
                .map((provider) => (
                  <option
                    key={provider.id_proveedor}
                    value={provider.id_proveedor}
                  >
                    {provider.nombre}
                  </option>
                ))}
            </select>
          </label>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty small">
                Agrega productos para comenzar.
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id_producto}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{money(item.price)} c/u</span>
                  </div>

                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id_producto, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <b>{item.qty}</b>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id_producto, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <b>{money(item.price * item.qty)}</b>
                </div>
              ))
            )}
          </div>

          <div className="form-grid">
            <label>
              Impuesto
              <input
                type="number"
                min="0"
                step="0.01"
                value={tax}
                onChange={(event) => setTax(event.target.value)}
              />
            </label>
            <label>
              Descuento
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
            </label>
          </div>

          <div className="summary">
            <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <div><span>Impuesto</span><b>{money(tax)}</b></div>
            <div><span>Descuento</span><b>-{money(discount)}</b></div>
            <div className="grand">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
          </div>

          <button className="primary-btn full" disabled={busy || !cart.length}>
            {busy ? 'Registrando...' : 'Registrar compra'}
          </button>
        </form>
      </aside>
    </div>
  );
}
