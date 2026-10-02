import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Search, Trash2 } from 'lucide-react';
import { asList, get, post } from '../api/http';
import { Toast } from '../components/Toast';
import { ErrorState, LoadingState } from '../components/PageState';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function createReference() {
  return `REF-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
}

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [methods, setMethods] = useState([]);
  const [cart, setCart] = useState([]);
  const [clientId, setClientId] = useState('');
  const [search, setSearch] = useState('');
  const [tax, setTax] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [payment, setPayment] = useState('0');
  const [methodId, setMethodId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [productsData, clientsData, methodsData] = await Promise.all([
        get('/productos'),
        get('/clientes'),
        get('/Metodos_de_Pago'),
      ]);

      setProducts(asList(productsData));
      setClients(asList(clientsData));
      setMethods(asList(methodsData));
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

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const total = Math.max(
    0,
    subtotal + Number(tax || 0) - Number(discount || 0)
  );

  const paymentValue = Number(payment || 0);

  function addProduct(product) {
    if (Number(product.stock) <= 0) return;

    setCart((current) => {
      const existing = current.find(
        (item) => item.id_producto === product.id_producto
      );

      if (existing) {
        if (existing.qty >= existing.stock) return current;

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
          price: Number(product.precio_venta),
          stock: Number(product.stock),
          qty: 1,
        },
      ];
    });
  }

  function changeQuantity(id, delta) {
    setCart((current) =>
      current.map((item) =>
        item.id_producto === id
          ? {
              ...item,
              qty: Math.min(
                item.stock,
                Math.max(1, item.qty + delta)
              ),
            }
          : item
      )
    );
  }

  async function submitSale(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!clientId) {
      setError('Selecciona un cliente.');
      return;
    }

    if (!cart.length) {
      setError('Agrega al menos un producto.');
      return;
    }

    if (paymentValue < 0 || paymentValue > total) {
      setError('El pago no puede ser negativo ni superar el total.');
      return;
    }

    if (paymentValue > 0 && !methodId) {
      setError('Selecciona el método de pago.');
      return;
    }

    setBusy(true);

    try {
      const data = await post('/ventas', {
        id_cliente: Number(clientId),
        productos: cart.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.qty,
        })),
        impuesto: Number(tax) || 0,
        descuento: Number(discount) || 0,
        pagos:
          paymentValue > 0
            ? [
                {
                  id_metodo_pago: Number(methodId),
                  monto: paymentValue,
                  referencia: createReference(),
                },
              ]
            : [],
      });

      setMessage(
        `Venta #${data.venta || 'registrada'} creada correctamente.`
      );
      setCart([]);
      setClientId('');
      setPayment('0');
      setMethodId('');
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
    return <LoadingState text="Preparando el punto de venta..." />;
  }

  if (error && !products.length && !clients.length) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="pos-layout">
      <Toast message={message} />
      <Toast message={error} type="error" />

      <section className="pos-products panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Punto de venta</span>
            <h3>Seleccionar productos</h3>
          </div>

          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty">
            No hay productos activos disponibles para vender.
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <button
                className="product-tile"
                key={product.id_producto}
                onClick={() => addProduct(product)}
                disabled={Number(product.stock) <= 0}
              >
                <span className="product-code">{product.codigo_sku}</span>
                <strong>{product.nombre}</strong>
                <span>{money(product.precio_venta)}</span>
                <small>
                  {Number(product.stock) > 0
                    ? `Stock ${product.stock}`
                    : 'Sin stock'}
                </small>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="cart panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Ticket</span>
            <h3>Venta actual</h3>
          </div>
          <span className="cart-count">
            {cart.reduce((sum, item) => sum + item.qty, 0)}
          </span>
        </div>

        <form onSubmit={submitSale} className="form-stack">
          <label>
            Cliente
            <select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clients
                .filter((client) => client.estado)
                .map((client) => (
                  <option key={client.id_cliente} value={client.id_cliente}>
                    {client.nombre} {client.apellido || ''} ·{' '}
                    {client.numero_documento}
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

          <div className="payment-box">
            <label>
              Pago inicial
              <input
                type="number"
                min="0"
                step="0.01"
                value={payment}
                onChange={(event) => setPayment(event.target.value)}
              />
            </label>

            {paymentValue > 0 && (
              <label>
                Método de pago
                <select
                  value={methodId}
                  onChange={(event) => setMethodId(event.target.value)}
                  required
                >
                  <option value="">Seleccionar método...</option>
                  {methods.map((method) => (
                    <option
                      key={method.id_metodo_pago}
                      value={method.id_metodo_pago}
                    >
                      {method.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {paymentValue > 0 && (
              <div className="payment-reference">
                La referencia interna se genera automáticamente.
              </div>
            )}
          </div>

          <button
            className="primary-btn full"
            disabled={busy || !cart.length || !clients.length}
          >
            {busy ? 'Registrando...' : `Registrar venta · ${money(total)}`}
          </button>

          {cart.length > 0 && (
            <button
              type="button"
              className="text-btn full"
              onClick={() => setCart([])}
            >
              <Trash2 size={15} />
              Vaciar ticket
            </button>
          )}
        </form>
      </aside>
    </div>
  );
}
