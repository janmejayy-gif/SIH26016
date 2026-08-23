export default function ChartCard({ title, subtitle, children }) {
  return (
    <section className="card card-pad">
      <div className="chart-card-head">
        <div>
          <h2 className="chart-title">{title}</h2>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
