export default function Loading() {
  return (
    <div className="card divide-y divide-blue-coal/60 animate-pulse">
      <div className="px-5 py-4">
        <div className="h-5 w-40 rounded bg-blue-coal/50" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-blue-coal/50" />
            <div className="h-3 w-1/2 rounded bg-blue-coal/40" />
          </div>
          <div className="h-5 w-16 rounded-full bg-blue-coal/50" />
        </div>
      ))}
    </div>
  );
}
