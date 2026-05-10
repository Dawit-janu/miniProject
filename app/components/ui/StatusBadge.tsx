const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  not_run:  { label: 'Not Run',  classes: 'bg-gray-100 text-gray-600' },
  pass:     { label: 'Pass',     classes: 'bg-green-100 text-green-700' },
  fail:     { label: 'Fail',     classes: 'bg-red-100 text-red-700' },
  blocked:  { label: 'Blocked',  classes: 'bg-orange-100 text-orange-700' },
  skip:     { label: 'Skip',     classes: 'bg-yellow-100 text-yellow-700' },
  draft:    { label: 'Draft',    classes: 'bg-gray-100 text-gray-500' },
  active:   { label: 'Active',   classes: 'bg-blue-100 text-blue-700' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
