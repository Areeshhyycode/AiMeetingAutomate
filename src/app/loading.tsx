export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="card p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-blue-coal/50" />
          ))}
        </div>
      </div>
      <div className="card p-6 space-y-5">
        <div className="h-10 rounded-xl bg-blue-coal/50" />
        <div className="h-40 rounded-xl bg-blue-coal/40" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-16 rounded-xl bg-blue-coal/40" />
          <div className="h-16 rounded-xl bg-blue-coal/40" />
        </div>
      </div>
    </div>
  );
}
