"use client"

import React from "react"
import type { TarotCard } from "@/lib/tarot-data"

interface TarotCardProps {
  card: TarotCard
  isFlipped: boolean
  isSelected: boolean
  isActive: boolean
  style?: React.CSSProperties
}

// Symbol designs for card centers using SVG paths
function CardSymbol({ color }: { color: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="1.5" opacity={0.6} />
      {/* Inner star pattern */}
      <path
        d="M24 4L28.5 18H43L31 27L35.5 41L24 32L12.5 41L17 27L5 18H19.5L24 4Z"
        stroke={color}
        strokeWidth="1"
        fill={`${color}22`}
        opacity={0.8}
      />
      {/* Center dot */}
      <circle cx="24" cy="24" r="3" fill={color} opacity={0.9} />
    </svg>
  )
}

export default function TarotCardComponent({
  card,
  isFlipped,
  isSelected,
  isActive,
  style,
}: TarotCardProps) {
  return (
    <div
      className="perspective-1000"
      style={{
        width: "200px",
        height: "300px",
        ...style,
      }}
    >
      <div
        className="preserve-3d relative w-full h-full transition-transform duration-700"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card Back */}
        <div
          className={`
            backface-hidden absolute inset-0 rounded-xl overflow-hidden
            border-2 transition-all duration-300
            ${isSelected ? "border-neon-cyan" : isActive ? "border-neon-purple" : "border-border"}
          `}
          style={{
            backfaceVisibility: "hidden",
            boxShadow: isSelected
              ? "0 0 20px hsl(195 100% 50% / 0.6), 0 0 40px hsl(195 100% 50% / 0.3), 0 0 60px hsl(195 100% 50% / 0.15)"
              : isActive
                ? "0 0 15px hsl(270 100% 65% / 0.4), 0 0 30px hsl(270 100% 65% / 0.2)"
                : "0 0 10px rgba(0,0,0,0.5)",
            transform: isSelected ? "scale(1.05)" : "scale(1)",
          }}
        >
          {/* Back design */}
          <div className="w-full h-full bg-gradient-to-br from-[#0f0a2e] via-[#1a1045] to-[#0f0a2e] flex items-center justify-center relative">
            {/* Ornamental border pattern */}
            <div className="absolute inset-3 border border-neon-purple/30 rounded-lg" />
            <div className="absolute inset-5 border border-neon-blue/20 rounded-lg" />

            {/* Diagonal scan lines for cyberpunk feel */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 2px, hsl(195 100% 50%) 2px, hsl(195 100% 50%) 3px)",
              }}
            />

            {/* Center design */}
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-neon-purple/60 flex items-center justify-center animate-spin-slow">
                <div className="w-12 h-12 rounded-full border border-neon-cyan/40 flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="hsl(195 100% 50%)"
                      strokeWidth="1.5"
                      opacity={0.7}
                    />
                    <path
                      d="M12 2L14 10H22L16 15L18 23L12 18L6 23L8 15L2 10H10L12 2Z"
                      fill="hsl(270 100% 65%)"
                      opacity={0.5}
                    />
                  </svg>
                </div>
              </div>
              <span className="font-mono text-[10px] text-neon-purple/60 tracking-[0.3em] uppercase">
                Cyber Tarot
              </span>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-neon-cyan/40" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-neon-cyan/40" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-neon-cyan/40" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-neon-cyan/40" />
          </div>
        </div>

        {/* Card Front */}
        <div
          className="backface-hidden absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            border: `2px solid ${card.color}`,
            boxShadow: `0 0 25px ${card.color}66, 0 0 50px ${card.color}22`,
          }}
        >
          <div
            className="w-full h-full flex flex-col items-center justify-between p-4 relative"
            style={{
              background: `linear-gradient(135deg, ${card.gradientFrom}18, ${card.gradientTo}18, #0a0a1a)`,
            }}
          >
            {/* Scan lines overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 3px)",
              }}
            />

            {/* Top arcana label */}
            <div
              className="text-xs font-mono tracking-wider uppercase text-center relative z-10"
              style={{ color: `${card.color}cc` }}
            >
              {card.arcana}
            </div>

            {/* Center symbol */}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${card.gradientFrom}33, transparent)`,
                  boxShadow: `0 0 40px ${card.color}33`,
                }}
              >
                <CardSymbol color={card.color} />
              </div>
              <h3
                className="font-mono text-base font-bold tracking-wide text-center"
                style={{
                  color: card.color,
                  textShadow: `0 0 10px ${card.color}66`,
                }}
              >
                {card.title}
              </h3>
            </div>

            {/* Bottom keyword */}
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div
                className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase"
                style={{
                  background: `${card.color}15`,
                  color: card.color,
                  border: `1px solid ${card.color}44`,
                }}
              >
                {card.keyword}
              </div>
            </div>

            {/* Corner arcana number */}
            <div
              className="absolute top-2 left-3 text-[10px] font-mono opacity-50"
              style={{ color: card.color }}
            >
              {card.arcana.split(" - ")[0]}
            </div>
            <div
              className="absolute bottom-2 right-3 text-[10px] font-mono opacity-50 rotate-180"
              style={{ color: card.color }}
            >
              {card.arcana.split(" - ")[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
