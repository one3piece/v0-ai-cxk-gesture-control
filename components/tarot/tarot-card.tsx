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
            ${isSelected ? "border-neon-cyan scale-105" : isActive ? "border-neon-purple" : "border-border"}
          `}
          style={{
            backfaceVisibility: "hidden",
            boxShadow: isSelected
              ? "0 0 20px hsl(195 100% 50% / 0.6), 0 0 40px hsl(195 100% 50% / 0.3)"
              : isActive
                ? "0 0 15px hsl(270 100% 65% / 0.4), 0 0 30px hsl(270 100% 65% / 0.2)"
                : "0 0 10px rgba(0,0,0,0.5)",
          }}
        >
          {/* Back design */}
          <div className="w-full h-full bg-gradient-to-br from-[#0f0a2e] via-[#1a1045] to-[#0f0a2e] flex items-center justify-center relative">
            {/* Ornamental border pattern */}
            <div className="absolute inset-3 border border-neon-purple/30 rounded-lg" />
            <div className="absolute inset-5 border border-neon-blue/20 rounded-lg" />

            {/* Center design */}
            <div className="relative flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-2 border-neon-purple/60 flex items-center justify-center animate-spin-slow">
                <div className="w-12 h-12 rounded-full border border-neon-cyan/40 flex items-center justify-center">
                  <span className="text-2xl" role="img" aria-label="basketball">
                    {"🏀"}
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs text-neon-purple/60 tracking-widest uppercase">
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
          className="backface-hidden absolute inset-0 rounded-xl overflow-hidden border-2 border-neon-cyan"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow:
              "0 0 25px hsl(195 100% 50% / 0.5), 0 0 50px hsl(195 100% 50% / 0.2)",
          }}
        >
          <div
            className="w-full h-full flex flex-col items-center justify-between p-4 relative"
            style={{
              background: `linear-gradient(135deg, ${card.gradientFrom}22, ${card.gradientTo}22, #0a0a1a)`,
            }}
          >
            {/* Top arcana label */}
            <div className="text-xs font-mono text-neon-cyan/80 tracking-wider uppercase text-center">
              {card.arcana}
            </div>

            {/* Center emoji */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{
                  background: `linear-gradient(135deg, ${card.gradientFrom}33, ${card.gradientTo}33)`,
                  boxShadow: `0 0 30px ${card.color}44`,
                }}
              >
                <span role="img" aria-label={card.title}>
                  {card.emoji}
                </span>
              </div>
              <h3
                className="font-mono text-lg font-bold tracking-wide"
                style={{ color: card.color }}
              >
                {card.title}
              </h3>
            </div>

            {/* Bottom keyword */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase"
                style={{
                  background: `${card.color}22`,
                  color: card.color,
                  border: `1px solid ${card.color}44`,
                }}
              >
                {card.keyword}
              </div>
            </div>

            {/* Corner glyphs */}
            <div
              className="absolute top-2 left-3 text-xs font-mono opacity-60"
              style={{ color: card.color }}
            >
              {card.emoji}
            </div>
            <div
              className="absolute bottom-2 right-3 text-xs font-mono opacity-60 rotate-180"
              style={{ color: card.color }}
            >
              {card.emoji}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
