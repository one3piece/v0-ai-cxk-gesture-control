"use client"

import Image from "next/image"
import type { TarotCard } from "@/lib/tarot-data"

interface ResultOverlayProps {
  card: TarotCard | null
  visible: boolean
}

export default function ResultOverlay({ card, visible }: ResultOverlayProps) {
  if (!card || !visible) return null

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 max-w-md mx-auto px-6"
        style={{
          animation: visible ? "resultFadeIn 0.8s ease-out" : "none",
        }}
      >
        {/* Card art image */}
        <div
          className="w-32 h-32 rounded-2xl overflow-hidden animate-float relative"
          style={{
            boxShadow: `0 0 60px ${card.color}44, 0 0 120px ${card.color}22`,
            border: `2px solid ${card.color}66`,
          }}
        >
          <Image
            src={card.image || "/placeholder.svg"}
            alt={card.title}
            fill
            className="object-cover"
            sizes="128px"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle, transparent 50%, ${card.color}22 100%)`,
            }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="font-mono text-xs text-neon-cyan/70 tracking-widest uppercase mb-2">
            {card.arcana}
          </p>
          <h2
            className="font-mono text-3xl font-bold mb-1"
            style={{
              color: card.color,
              textShadow: `0 0 20px ${card.color}88, 0 0 40px ${card.color}44`,
            }}
          >
            {card.title}
          </h2>
        </div>

        {/* Fortune card */}
        <div
          className="glass rounded-xl p-6 w-full text-center"
          style={{
            borderColor: `${card.color}44`,
            boxShadow: `0 0 20px ${card.color}22`,
          }}
        >
          <p className="text-sm text-foreground/90 leading-relaxed mb-4">
            {card.description}
          </p>
          <div
            className="h-px w-full mb-4"
            style={{
              background: `linear-gradient(90deg, transparent, ${card.color}66, transparent)`,
            }}
          />
          <p className="text-foreground font-medium leading-relaxed">
            {card.fortune}
          </p>
        </div>

        {/* Keyword badge */}
        <div
          className="px-6 py-2 rounded-full font-mono text-sm font-bold tracking-widest uppercase animate-neon-pulse"
          style={{
            background: `${card.color}22`,
            color: card.color,
            border: `2px solid ${card.color}66`,
            boxShadow: `0 0 15px ${card.color}33`,
          }}
        >
          {card.keyword}
        </div>

        {/* Restart hint */}
        <p className="text-xs text-muted-foreground font-mono animate-neon-pulse mt-4">
          {"Raise both hands to draw again"}
        </p>
      </div>

      <style jsx>{`
        @keyframes resultFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
