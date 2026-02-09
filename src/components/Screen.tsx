export function Screen() {
  return (
    <div className="relative w-full max-w-md mx-auto mb-8 mt-6">
      <div className="relative h-1 bg-linear-to-r from-transparent via-white/40 to-transparent rounded-full" />
      <div className="absolute inset-0 blur-md bg-linear-to-r from-transparent via-white/20 to-transparent" />
      <p className="text-center text-[10px] text-gray-600 mt-2 uppercase tracking-wider">
        Screen
      </p>
    </div>
  );
}
