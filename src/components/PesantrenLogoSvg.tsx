import React from 'react';

interface PesantrenLogoSvgProps {
  className?: string;
  size?: number | string;
}

export const PesantrenLogoSvg: React.FC<PesantrenLogoSvgProps> = ({ 
  className = "w-full h-full", 
  size 
}) => {
  return (
    <svg 
      viewBox="0 0 1000 1000" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Soft, vibrant vertical emerald green gradient from top-center to edges */}
        <linearGradient id="pesantrenHexGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#25A55F" />
          <stop offset="12%" stopColor="#41BA74" />
          <stop offset="45%" stopColor="#8BE2AC" />
          <stop offset="55%" stopColor="#B3F0CB" />
          <stop offset="70%" stopColor="#7CDD9E" />
          <stop offset="88%" stopColor="#32B068" />
          <stop offset="100%" stopColor="#1E9351" />
        </linearGradient>

        {/* Text curve path for semi-circular PONDOK PESANTREN INAYATUL MUHAJIRIN */}
        <path
          id="pesantrenUpperCurve"
          d="M 125,700 A 405,405 0 1,1 875,700"
          fill="none"
        />

        {/* Crisp golden yellow five-pointed star matching exact logo */}
        <g id="pesantrenStar">
          <polygon 
            points="0,-36 10.6,-11.1 34.2,-11.1 15.1,2.8 22.4,26.4 0,11.5 -22.4,26.4 -15.1,2.8 -34.2,-11.1 -10.6,-11.1" 
            fill="#FFC700" 
            stroke="#E0A800" 
            strokeWidth="1.2"
          />
        </g>

        {/* Symmetrical green oval leaf element */}
        <g id="pesantrenLeaf">
          <path 
            d="M 0,-34 C 18,-20 18,20 0,34 C -18,20 -18,-20 0,-34 Z" 
            fill="#058C42" 
          />
        </g>
      </defs>

      {/* 1. OUTER HEXAGON with BOLD SOLID BLACK BORDER (Exact angle & proportion) */}
      <polygon 
        points="500,18 970,250 970,750 500,982 30,750 30,250" 
        fill="url(#pesantrenHexGrad)" 
        stroke="#1E1E1E" 
        strokeWidth="34" 
        strokeLinejoin="round"
      />

      {/* 2. CURVED TEXT: PONDOK PESANTREN INAYATUL MUHAJIRIN (Solid Black, bold, arching over the top) */}
      <text 
        fill="#111827" 
        fontSize="54" 
        fontWeight="900" 
        fontFamily="'Plus Jakarta Sans', Arial, Helvetica, sans-serif"
        letterSpacing="2.5"
      >
        <textPath 
          href="#pesantrenUpperCurve" 
          startOffset="50%" 
          textAnchor="middle"
        >
          PONDOK PESANTREN INAYATUL MUHAJIRIN
        </textPath>
      </text>

      {/* 3. NINE (9) GOLDEN STARS */}
      {/* Top central apex star */}
      <use href="#pesantrenStar" x="500" y="240" transform="scale(1)" />

      {/* Left side 4 stars */}
      <use href="#pesantrenStar" x="338" y="342" />
      <use href="#pesantrenStar" x="290" y="475" />
      <use href="#pesantrenStar" x="304" y="618" />
      <use href="#pesantrenStar" x="340" y="750" />

      {/* Right side 4 stars */}
      <use href="#pesantrenStar" x="662" y="342" />
      <use href="#pesantrenStar" x="710" y="475" />
      <use href="#pesantrenStar" x="696" y="618" />
      <use href="#pesantrenStar" x="660" y="750" />

      {/* 4. CENTER MOTIF: PEN NIB & GREEN LEAVES */}
      <g transform="translate(500, 420)">
        {/* Top vertical leaf */}
        <use href="#pesantrenLeaf" x="0" y="-108" transform="scale(0.85)" />

        {/* 4 Left radiating leaves */}
        <g transform="translate(-48, -65) rotate(-55)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>
        <g transform="translate(-62, -5) rotate(-85)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>
        <g transform="translate(-52, 55) rotate(-115)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>
        <g transform="translate(-25, 96) rotate(-145)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>

        {/* 4 Right radiating leaves */}
        <g transform="translate(48, -65) rotate(55)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>
        <g transform="translate(62, -5) rotate(85)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>
        <g transform="translate(52, 55) rotate(115)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>
        <g transform="translate(25, 96) rotate(145)"><use href="#pesantrenLeaf" transform="scale(0.82)" /></g>

        {/* Center Vertical Pen Nib / Pena Emas dengan Ujung Tinta */}
        {/* Golden upper body of the nib */}
        <path 
          d="M 500,345 C 508,380 507,435 505,465 L 495,465 C 493,435 492,380 500,345 Z" 
          transform="translate(-500,-420)" 
          fill="#FACC15" 
          stroke="#CA8A04" 
          strokeWidth="2.5"
        />
        {/* Black lower nib tip */}
        <path 
          d="M 495,465 L 500,520 L 505,465 Z" 
          transform="translate(-500,-420)" 
          fill="#111827" 
        />
        {/* Slit center line */}
        <line 
          x1="0" 
          y1="50" 
          x2="0" 
          y2="92" 
          stroke="#111827" 
          strokeWidth="3" 
        />
      </g>

      {/* 5. OPEN BOOK (AL-QUR'AN) - White with bold black outlines and curved lines */}
      <g transform="translate(500, 680)">
        {/* Left Page (White background) */}
        <path 
          d="M -5,-130 C -70,-135 -140,-100 -185,-60 C -195,10 -185,85 -165,135 C -135,100 -65,70 -5,80 Z" 
          fill="#FFFFFF" 
          stroke="#111827" 
          strokeWidth="11" 
          strokeLinejoin="round"
        />
        {/* Right Page (White background) */}
        <path 
          d="M 5,-130 C 70,-135 140,-100 185,-60 C 195,10 185,85 165,135 C 135,100 65,70 5,80 Z" 
          fill="#FFFFFF" 
          stroke="#111827" 
          strokeWidth="11" 
          strokeLinejoin="round"
        />

        {/* Center Spine */}
        <path 
          d="M 0,-132 L 0,82" 
          stroke="#111827" 
          strokeWidth="13" 
          strokeLinecap="round"
        />

        {/* Horizontal Curved Text Stripes - Left Page */}
        <path d="M -30,-85 C -75,-92 -125,-75 -155,-45" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M -30,-40 C -75,-47 -125,-30 -158,-5" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M -30,5 C -75,-2 -125,15 -155,40" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M -30,50 C -75,43 -120,58 -145,80" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />

        {/* Horizontal Curved Text Stripes - Right Page */}
        <path d="M 30,-85 C 75,-92 125,-75 155,-45" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M 30,-40 C 75,-47 125,-30 158,-5" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M 30,5 C 75,-2 125,15 155,40" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M 30,50 C 75,43 120,58 145,80" stroke="#111827" strokeWidth="10" strokeLinecap="round" fill="none" />
      </g>

      {/* 6. BOTTOM TWO LINES OF TEXT: CIPATAT / BANDUNG BARAT */}
      <text 
        x="500" 
        y="870" 
        fill="#111827" 
        fontSize="54" 
        fontWeight="900" 
        fontFamily="'Plus Jakarta Sans', Arial, Helvetica, sans-serif"
        textAnchor="middle"
        letterSpacing="2.5"
      >
        CIPATAT
      </text>

      <text 
        x="500" 
        y="936" 
        fill="#111827" 
        fontSize="54" 
        fontWeight="900" 
        fontFamily="'Plus Jakarta Sans', Arial, Helvetica, sans-serif"
        textAnchor="middle"
        letterSpacing="2.5"
      >
        BANDUNG BARAT
      </text>
    </svg>
  );
};
