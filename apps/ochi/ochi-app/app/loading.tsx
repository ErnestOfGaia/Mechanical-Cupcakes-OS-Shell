export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full h-48 bg-gray-900 mb-8" />

      {/* 2x2 grid of card skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="h-56 bg-gray-200" />
        <div className="h-56 bg-gray-200" />
        <div className="h-56 bg-gray-200" />
        <div className="h-56 bg-gray-200" />
      </div>
    </div>
  );
}
