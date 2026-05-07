export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[4/5] rounded-2xl w-full"></div>
      <div className="space-y-3 px-2 mt-4">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}
