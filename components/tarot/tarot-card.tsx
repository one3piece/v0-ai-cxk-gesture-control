"use client"

import React from "react"
import Image from "next/image"
import type { TarotCard } from "@/lib/tarot-data"

interface TarotCardProps {
  card: TarotCard
  isFlipped: boolean
  isSelected: boolean
  isActive: boolean
  style?: React.CSSProperties
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
          {/* Back design - CXK chicken image with overlay */}
          <div className="w-full h-full relative">
            <Image
              src="/images/cxk-card-back.jpg"
              alt="Card back"
              fill
              className="object-cover"
              sizes="200px"
            />
            {/* Dark overlay with cyberpunk tint */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a2e]/70 via-[#1a1045]/50 to-[#0f0a2e]/70" />

            {/* Diagonal scan lines for cyberpunk feel */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 2px, hsl(195 100% 50%) 2px, hsl(195 100% 50%) 3px)",
              }}
            />

            {/* Ornamental border pattern */}
            <div className="absolute inset-3 border border-neon-purple/40 rounded-lg" />
            <div className="absolute inset-5 border border-neon-blue/25 rounded-lg" />

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
              <span className="font-mono text-[10px] text-neon-cyan/80 tracking-[0.3em] uppercase drop-shadow-lg">
                Cyber Tarot
              </span>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-neon-cyan/50" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-neon-cyan/50" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-neon-cyan/50" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-neon-cyan/50" />
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
          <div className="w-full h-full flex flex-col relative bg-[#0a0a1a]">
            {/* Card art image */}
            <div className="relative w-full flex-1 min-h-0">
              <Image
                src={card.image || "/placeholder.svg"}
                alt={card.title}
                fill
                className="object-cover"
                sizes="200px"
              />
              {/* Gradient fade to bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, transparent 40%, ${card.gradientFrom}33 70%, #0a0a1a 100%)`,
                }}
              />

              {/* Scan lines overlay */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 3px)",
                }}
              />

              {/* Top arcana label */}
              <div
                className="absolute top-3 left-0 right-0 text-xs font-mono tracking-wider uppercase text-center z-10 drop-shadow-lg"
                style={{ color: `${card.color}dd` }}
              >
                {card.arcana}
              </div>
            </div>

            {/* Bottom info panel */}
            <div className="relative z-10 px-4 pb-3 pt-1 flex flex-col items-center gap-1.5">
              <h3
                className="font-mono text-sm font-bold tracking-wide text-center"
                style={{
                  color: card.color,
                  textShadow: `0 0 10px ${card.color}66`,
                }}
              >
                {card.title}
              </h3>
              <div
                className="px-3 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.2em] uppercase"
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
              className="absolute top-2 left-3 text-[10px] font-mono opacity-50 z-10"
              style={{ color: card.color }}
            >
              {card.arcana.split(" - ")[0]}
            </div>
            <div
              className="absolute bottom-2 right-3 text-[10px] font-mono opacity-50 rotate-180 z-10"
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
