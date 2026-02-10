import React from "react";

export const Screen: React.FC = () => {
  return (
    <div className="relative w-full flex flex-col items-center mt-4 mb-12">
      <div
        className="w-[80%] h-4 bg-linear-to-b from-white/20 to-transparent"
        style={{
          clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)",
          boxShadow: "0 10px 30px rgba(255, 255, 255, 0.1)",
        }}
      />
      <div className="mt-2 text-[10px] font-bold tracking-[0.4em] text-gray-500 uppercase">
        Screen
      </div>
      <div
        className="absolute top-0 w-full h-24 bg-linear-to-b from-white/5 to-transparent pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />
    </div>
  );
};
