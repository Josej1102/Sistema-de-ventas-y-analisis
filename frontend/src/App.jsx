import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import ProductsPage from './pages/ProductsPage';
import ClientsPage from './pages/ClientsPage';
import SuppliersPage from './pages/SuppliersPage';
import PaymentsPage from './pages/PaymentsPage';
import PurchasesPage from './pages/PurchasesPage';
import EmployeesPage from './pages/EmployeesPage';
import CategoriesPage from './pages/CategoriesPage';
import ReportsPage from './pages/ReportsPage';

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ventas/nueva" element={<SalesPage />} />
          <Route path="ventas" element={<SalesHistoryPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="proveedores" element={<SuppliersPage />} />
          <Route path="pagos" element={<PaymentsPage />} />


          <Route 
            path="reportes" 
            element={<AdminRoute>
              <ReportsPage />
            </AdminRoute> } />

          <Route
            path="compras/nueva"
            element={
              <AdminRoute>
                <PurchasesPage />
              </AdminRoute>
            }
          />

          <Route
            path="empleados"
            element={
              <AdminRoute>
                <EmployeesPage />
              </AdminRoute>
            }
          />

          <Route
            path="categorias"
            element={
              
                <CategoriesPage />
              
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
