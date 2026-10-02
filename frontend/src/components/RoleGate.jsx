import { useAuth } from '../auth/AuthContext'

export default function RoleGate({ children, role = 'admin', fallback = null }) {
  const { user } = useAuth()
  return user?.rol === role ? children : fallback
}
