import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Tags,
  Truck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import PageErrorBoundary from './PageErrorBoundary';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ventas/nueva', label: 'Nueva venta', icon: ShoppingCart },
  { to: '/ventas', label: 'Ventas', icon: ClipboardList },
  { to: '/productos', label: 'Productos', icon: Boxes },
  { to: '/clientes', label: 'Clientes', icon: UsersRound },
  { to: '/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/pagos', label: 'Pagos', icon: CreditCard },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, admin: true },
  { to: '/compras/nueva', label: 'Nueva compra', icon: FilePlus2, admin: true },
  { to: '/empleados', label: 'Empleados', icon: UserRound, admin: true },
  { to: '/categorias', label: 'Categorías', icon: Tags },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const current = nav.find((item) => location.pathname === item.to);
  const title = current?.label || (
    location.pathname.startsWith('/ventas/') ? 'Ventas' : 'Gestión comercial'
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <strong>Seguimiento Ventas</strong>
            <span>Gestión comercial</span>
          </div>
        </div>

        <nav className="nav-list">
          {nav
            .filter((item) => !item.admin || isAdmin)
            .map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.to === '/ventas/nueva' && (
                    <ChevronRight size={15} className="nav-arrow" />
                  )}
                </NavLink>
              );
            })}
        </nav>

        <div className="sidebar-foot">
          <div className="user-mini">
            <div className="avatar">
              {user?.nombre?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <strong>
                {user?.nombre} {user?.apellido || ''}
              </strong>
              <span>{user?.rol}</span>
            </div>
          </div>

          <button
            className="logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={17} />
            Salir
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">Operación</span>
            <h1>{title}</h1>
          </div>
          <div className="topbar-user">
            <div className="status-dot" />
            Sesión activa
            <span className="top-avatar">
              {user?.nombre?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        </header>

        <div className="content">
          <PageErrorBoundary>
            <Outlet />
          </PageErrorBoundary>
        </div>
      </main>
    </div>
  );
}
