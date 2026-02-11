"use client"

import { useMemo } from "react"
import type { TarotCard } from "@/lib/tarot-data"
import TarotCardComponent from "./tarot-card"

interface CardDeckProps {
  cards: TarotCard[]
  selectedIndex: number
  isShuffling: boolean
  revealedCardId: string | null
  phase: "idle" | "shuffling" | "selecting" | "revealing" | "result"
}

export default function CardDeck({
  cards,
  selectedIndex,
  isShuffling,
  revealedCardId,
  phase,
}: CardDeckProps) {
  const cardPositions = useMemo(() => {
    if (phase === "idle" || phase === "shuffling") {
      // Stacked deck with slight offsets
      return cards.map((_, i) => {
        const angle = isShuffling
          ? Math.sin(Date.now() * 0.005 + i * 0.8) * 30
          : i * 2 - (cards.length * 2) / 2
        const yOffset = isShuffling
          ? Math.cos(Date.now() * 0.003 + i * 1.2) * 50
          : 0
        const xOffset = isShuffling
          ? Math.sin(Date.now() * 0.004 + i * 0.6) * 80
          : i * 1.5

        return {
          x: xOffset,
          y: yOffset,
          z: i * 2,
          rotation: angle,
          scale: 1,
        }
      })
    }

    if (phase === "selecting") {
      // Fan out cards in an arc
      const totalAngle = 60
      const startAngle = -totalAngle / 2
      const angleStep = cards.length > 1 ? totalAngle / (cards.length - 1) : 0

      return cards.map((_, i) => {
        const isActive = i === selectedIndex
        const angle = startAngle + i * angleStep
        const rad = (angle * Math.PI) / 180
        const radius = 280
        const xOffset = Math.sin(rad) * radius
        const yOffset = -Math.cos(rad) * radius + radius - 50

        return {
          x: xOffset,
          y: isActive ? yOffset - 30 : yOffset,
          z: isActive ? 100 : i,
          rotation: angle * 0.5,
          scale: isActive ? 1.1 : 0.9,
        }
      })
    }

    if (phase === "revealing" || phase === "result") {
      // Center the revealed card
      return cards.map((card, i) => {
        const isRevealed = card.id === revealedCardId
        if (isRevealed) {
          return {
            x: 0,
            y: 0,
            z: 100,
            rotation: 0,
            scale: 1.2,
          }
        }
        // Other cards scatter away
        const angle = (i / cards.length) * 360
        const rad = (angle * Math.PI) / 180
        return {
          x: Math.cos(rad) * 500,
          y: Math.sin(rad) * 400,
          z: 0,
          rotation: angle,
          scale: 0.5,
        }
      })
    }

    return cards.map((_, i) => ({
      x: 0,
      y: 0,
      z: i,
      rotation: 0,
      scale: 1,
    }))
  }, [cards, selectedIndex, isShuffling, revealedCardId, phase])

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className="relative"
        style={{
          perspective: "1200px",
          width: "600px",
          height: "400px",
        }}
      >
        {cards.map((card, i) => {
          const pos = cardPositions[i]
          const isRevealed = card.id === revealedCardId
          const isSelected = i === selectedIndex && phase === "selecting"
          const isActive =
            Math.abs(i - selectedIndex) <= 1 && phase === "selecting"

          return (
            <div
              key={card.id}
              className="absolute left-1/2 top-1/2 transition-all"
              style={{
                transform: `
                  translate(-50%, -50%)
                  translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)
                  rotate(${pos.rotation}deg)
                  scale(${pos.scale})
                `,
                zIndex: pos.z + (isSelected ? 50 : 0),
                transitionDuration: isShuffling ? "0.15s" : "0.6s",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                opacity:
                  phase === "revealing" || phase === "result"
                    ? isRevealed
                      ? 1
                      : 0
                    : 1,
              }}
            >
              <TarotCardComponent
                card={card}
                isFlipped={isRevealed && (phase === "revealing" || phase === "result")}
                isSelected={isSelected}
                isActive={isActive}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
