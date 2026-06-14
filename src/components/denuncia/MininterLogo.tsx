interface MininterLogoProps {
  className?: string;
  height?: "h-8" | "h-10" | "h-11" | "h-12" | "h-14" | string;
}

export function MininterLogo({ className = "", height = "h-8" }: MininterLogoProps) {
  // Use small text and layout if height is h-8 or h-10 to match the compact size
  const isSmall = height === "h-8" || height === "h-10";

  return (
    <div className={`flex items-stretch select-none bg-white rounded border border-slate-200 shadow-xs overflow-hidden ${height} ${className}`}>
      {/* Escudo Box */}
      <div className={`bg-white flex flex-col items-center justify-center relative shrink-0 ${
        isSmall ? "w-11 px-1.5" : "w-16 sm:w-20 px-2.5"
      }`}>
        {/* Curved Text "REPÚBLICA DEL PERÚ" */}
        <svg viewBox="0 0 100 35" className={`w-full absolute left-0 right-0 ${
          isSmall ? "top-0.5 h-3" : "top-1 h-4"
        }`}>
          <path id="text-curve" d="M 10,30 A 50,50 0 0,1 90,30" fill="none" />
          <text className={`fill-slate-800 font-bold uppercase tracking-widest ${
            isSmall ? "text-[6.5px]" : "text-[8.5px]"
          }`}>
            <textPath href="#text-curve" startOffset="50%" textAnchor="middle">
              REPÚBLICA DEL PERÚ
            </textPath>
          </text>
        </svg>
        {/* Escudo Image */}
        <img 
          src="/escudo_peru.png" 
          alt="Escudo de Armas del Perú" 
          className={`w-auto object-contain ${
            isSmall ? "h-5 mt-2.5" : "h-7 mt-2.5"
          }`}
        />
      </div>

      {/* PERÚ Box */}
      <div className={`bg-[#C8102E] text-white flex items-center justify-center font-black tracking-wider uppercase border-r border-white/40 shrink-0 select-none ${
        isSmall ? "text-[8px] px-1.5" : "text-xs sm:text-sm px-3"
      }`}>
        PERÚ
      </div>

      {/* Ministerio del Interior Box */}
      <div className={`bg-[#4A4A4A] text-white flex items-center font-bold leading-none select-none shrink-0 whitespace-nowrap ${
        isSmall ? "text-[7px] px-2" : "text-[9px] sm:text-[11px] px-4"
      }`}>
        Ministerio del Interior
      </div>
    </div>
  );
}
