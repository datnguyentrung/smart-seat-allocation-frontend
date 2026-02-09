import React from "react";

export const Legend: React.FC = () => {
  const items = [
    { label: "Available", color: "border border-white/30" },
    { label: "Booked", color: "bg-gray-800" },
    { label: "Selected", color: "bg-[#E50914]" },
    { label: "VIP", color: "border-2 border-[#FFD700]" },
    { label: "Couple", color: "border border-[#FF69B4]/40" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8 px-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-sm ${item.color}`} />
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
