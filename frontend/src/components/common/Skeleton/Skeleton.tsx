interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`bg-[#252540] rounded animate-skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="w-full bg-gradient-to-br from-[#252540] to-[#1f1f3a] rounded-2xl p-4 border border-[#3a3a5a]">
      <div className="flex justify-center mb-4">
        <Skeleton width={160} height={160} className="rounded-xl" />
      </div>
      <Skeleton height={12} className="w-1/2 mb-2" />
      <Skeleton height={16} className="w-3/4 mb-3" />
      <Skeleton height={8} className="w-full mb-4 rounded-full" />
      <div className="flex items-center justify-between mt-4">
        <Skeleton height={24} width={80} />
        <Skeleton height={36} width={80} className="rounded-lg" />
      </div>
    </div>
  );
}
