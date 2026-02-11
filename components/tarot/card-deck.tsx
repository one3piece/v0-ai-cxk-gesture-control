"use client"

import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import type { TarotCard } from "@/lib/tarot-data"
import TarotCardComponent from "./tarot-card"

interface CardDeckProps {
  cards: TarotCard[]
  selectedIndex: number
  isShuffling: boolean
  revealedCardId: string | null
  phase: "idle" | "shuffling" | "selecting" | "revealing" | "result"
}

interface CardPosition {
  x: number
  y: number
  z: number
  rotation: number
  rotateY: number
  scale: number
}

export default function CardDeck({
  cards,
  selectedIndex,
  isShuffling,
  revealedCardId,
  phase,
}: CardDeckProps) {
  const [shufflePositions, setShufflePositions] = useState<CardPosition[]>([])
  const animRef = useRef<number>(0)
  const startTimeRef = useRef(0)

  // Animate shuffle positions with requestAnimationFrame
  useEffect(() => {
    if (!isShuffling) {
      cancelAnimationFrame(animRef.current)
      return
    }

    startTimeRef.current = performance.now()

    function tick() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const positions: CardPosition[] = cards.map((_, i) => {
        const angle = Math.sin(elapsed * 5 + i * 0.8) * 35
        const yOffset = Math.cos(elapsed * 3 + i * 1.2) * 60
        const xOffset = Math.sin(elapsed * 4 + i * 0.6) * 100
        const rotY = Math.sin(elapsed * 6 + i * 0.9) * 180

        return {
          x: xOffset,
          y: yOffset,
          z: i * 2 + Math.sin(elapsed * 2 + i) * 20,
          rotation: angle,
          rotateY: rotY,
          scale: 0.85 + Math.sin(elapsed * 3 + i) * 0.15,
        }
      })
      setShufflePositions(positions)
      animRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => cancelAnimationFrame(animRef.current)
  }, [isShuffling, cards])

  const cardPositions = useMemo((): CardPosition[] => {
    if (phase === "shuffling" && shufflePositions.length > 0) {
      return shufflePositions
    }

    if (phase === "idle") {
      return cards.map((_, i) => ({
        x: i * 1.5,
        y: 0,
        z: i * 2,
        rotation: i * 2 - (cards.length * 2) / 2,
        rotateY: 0,
        scale: 1,
      }))
    }

    if (phase === "selecting") {
      const totalAngle = Math.min(cards.length * 12, 70)
      const startAngle = -totalAngle / 2
      const angleStep = cards.length > 1 ? totalAngle / (cards.length - 1) : 0

      return cards.map((_, i) => {
        const isActive = i === selectedIndex
        const angle = startAngle + i * angleStep
        const rad = (angle * Math.PI) / 180
        const radius = 300
        const xOffset = Math.sin(rad) * radius
        const yOffset = -Math.cos(rad) * radius + radius - 40

        return {
          x: xOffset,
          y: isActive ? yOffset - 35 : yOffset,
          z: isActive ? 100 : i,
          rotation: angle * 0.5,
          rotateY: 0,
          scale: isActive ? 1.15 : 0.88,
        }
      })
    }

    if (phase === "revealing" || phase === "result") {
      return cards.map((card, i) => {
        const isRevealed = card.id === revealedCardId
        if (isRevealed) {
          return {
            x: 0,
            y: -10,
            z: 100,
            rotation: 0,
            rotateY: 0,
            scale: 1.25,
          }
        }
        const angle = (i / cards.length) * 360
        const rad = (angle * Math.PI) / 180
        return {
          x: Math.cos(rad) * 600,
          y: Math.sin(rad) * 500,
          z: 0,
          rotation: angle,
          rotateY: 0,
          scale: 0.4,
        }
      })
    }

    return cards.map((_, i) => ({
      x: 0,
      y: 0,
      z: i,
      rotation: 0,
      rotateY: 0,
      scale: 1,
    }))
  }, [cards, selectedIndex, revealedCardId, phase, shufflePositions])

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className="relative"
        style={{
          perspective: "1200px",
          width: "700px",
          height: "450px",
        }}
      >
        {cards.map((card, i) => {
          const pos = cardPositions[i] || {
            x: 0,
            y: 0,
            z: i,
            rotation: 0,
            rotateY: 0,
            scale: 1,
          }
          const isRevealed = card.id === revealedCardId
          const isSelected = i === selectedIndex && phase === "selecting"
          const isActive =
            Math.abs(i - selectedIndex) <= 1 && phase === "selecting"

          return (
            <div
              key={card.id}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `
                  translate(-50%, -50%)
                  translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)
                  rotate(${pos.rotation}deg)
                  rotateY(${pos.rotateY}deg)
                  scale(${pos.scale})
                `,
                zIndex: Math.round(pos.z) + (isSelected ? 50 : 0),
                transition: isShuffling
                  ? "none"
                  : "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                opacity:
                  phase === "revealing" || phase === "result"
                    ? isRevealed
                      ? 1
                      : 0
                    : 1,
                willChange: isShuffling ? "transform" : "auto",
              }}
            >
              <TarotCardComponent
                card={card}
                isFlipped={
                  isRevealed && (phase === "revealing" || phase === "result")
                }
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
