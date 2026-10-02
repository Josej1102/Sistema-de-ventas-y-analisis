export default function StatCard({ icon: Icon, label, value, tone = '' }) {
  return <article className={`stat-card ${tone}`}><div className="stat-icon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong></div></article>
}
