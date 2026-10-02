import { CheckCircle2, XCircle } from 'lucide-react'

export function Toast({ message, type = 'success' }) {
  if (!message) return null
  return <div className={`toast ${type}`}><>{type === 'success' ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}</><span>{message}</span></div>
}
