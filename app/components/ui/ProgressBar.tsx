interface ProgressBarProps {
  value: number;
  color?: string;
  label?: string;
}

export default function ProgressBar({ value, color = 'bg-blue-500', label }: ProgressBarProps) {
  const pct = Math.min(Math.max(Math.round(value), 0), 100);
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
