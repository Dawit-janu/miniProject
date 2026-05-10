interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  valueClass?: string;
}

export default function MetricCard({ label, value, sub, valueClass = 'text-gray-900' }: MetricCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
