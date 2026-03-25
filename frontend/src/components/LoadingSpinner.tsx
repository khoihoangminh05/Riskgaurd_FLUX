'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative h-12 w-12">
        <div className="absolute top-0 left-0 h-full w-full border-4 border-emerald-500/20 rounded-full" />
        <div className="absolute top-0 left-0 h-full w-full border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
