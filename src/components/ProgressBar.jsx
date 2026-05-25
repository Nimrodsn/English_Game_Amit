export default function ProgressBar({ value, label }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-xs font-bold text-slate-600">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-4 w-full overflow-hidden rounded-full bg-white/60 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-pastel via-purple-pastel to-peach-pastel transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
