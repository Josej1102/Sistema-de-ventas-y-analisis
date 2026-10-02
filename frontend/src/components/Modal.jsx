import { X } from 'lucide-react'

export default function Modal({ open, title, children, onClose, wide = false }) {
  if (!open) return null
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className={`modal ${wide ? 'modal-wide' : ''}`} onMouseDown={e => e.stopPropagation()}>
      <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={19}/></button></div>
      {children}
    </div>
  </div>
}
