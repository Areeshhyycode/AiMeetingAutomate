export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-blue-coal/40" />
        <div className="h-7 w-1/2 rounded bg-blue-coal/50" />
        <div className="h-3 w-1/3 rounded bg-blue-coal/40" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="h-4 w-32 rounded bg-blue-coal/50" />
          <div className="h-3 w-full rounded bg-blue-coal/40" />
          <div className="h-3 w-5/6 rounded bg-blue-coal/40" />
        </div>
      ))}
    </div>
  );
}
