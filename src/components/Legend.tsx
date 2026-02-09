export function Legend() {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-4 px-4">
      <LegendItem
        color="bg-gray-800 border border-gray-700"
        label="Available"
      />
      <LegendItem
        color="bg-purple-900/30 border border-purple-700/50"
        label="VIP"
      />
      <LegendItem color="bg-[#E50914]" label="Selected" />
      <LegendItem color="bg-gray-700" label="Booked" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-sm ${color}`} />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
