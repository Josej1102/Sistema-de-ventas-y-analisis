import { useState } from 'react';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }

    setBusy(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-brand">
          <div className="brand-mark big">V</div>
          <div>
            <strong>Seguimiento Ventas</strong>
            <span>Gestión comercial</span>
          </div>
        </div>

        <div className="login-copy">
          <span className="eyebrow">Sistema de ventas e inventario</span>
          <h1>
            Opera tu negocio
            <br />
            <em>con claridad.</em>
          </h1>
          <p>
            Ventas, compras, inventario, clientes y pagos en un solo lugar.
          </p>
        </div>

        <div className="security-note">
          <ShieldCheck size={18} />
          <span>Acceso protegido por autenticación y roles.</span>
        </div>
      </div>

      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <span className="eyebrow">Bienvenido</span>
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para continuar.</p>

          {error && <div className="form-error">{error}</div>}

          <label>
            Correo electrónico
            <div className="input-icon">
              <Mail size={17} />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="username"
                placeholder="usuario@empresa.com"
                required
              />
            </div>
          </label>

          <label>
            Contraseña
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <button className="primary-btn full" disabled={busy}>
            {busy ? 'Validando...' : 'Entrar al sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
