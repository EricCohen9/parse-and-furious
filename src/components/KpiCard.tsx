interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  valueClass?: string;
}

export function KpiCard({ title, value, subtitle, valueClass }: KpiCardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="subheader">{title}</div>
        <div className={`h2 m-0 text-truncate ${valueClass || ""}`}>{value}</div>
        {subtitle && <div className="text-secondary mt-1" style={{ fontSize: "0.75rem" }}>{subtitle}</div>}
      </div>
    </div>
  );
}
