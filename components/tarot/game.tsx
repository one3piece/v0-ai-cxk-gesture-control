"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { tarotCards, getRandomCards, type TarotCard } from "@/lib/tarot-data"
import type { GestureType } from "@/lib/gesture-utils"
import { audioManager } from "@/lib/audio-manager"
import ParticleCanvas from "./particle-canvas"
import ExplosionCanvas, { useExplosion } from "./explosion-canvas"
import CardDeck from "./card-deck"
import HandTracker from "./hand-tracker"
import GestureGuide from "./gesture-guide"
import ResultOverlay from "./result-overlay"

type GamePhase = "loading" | "ready" | "shuffling" | "selecting" | "revealing" | "result"

export default function TarotGame() {
  const [phase, setPhase] = useState<GamePhase>("loading")
  const [cards, setCards] = useState<TarotCard[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [revealedCard, setRevealedCard] = useState<TarotCard | null>(null)
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [currentGesture, setCurrentGesture] = useState<string>("none")
  const [handTrackerReady, setHandTrackerReady] = useState(false)
  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const { canvasRef: explosionCanvasRef, explode } = useExplosion()

  // Set initial cards
  useEffect(() => {
    setCards(getRandomCards(7))
  }, [])

  // Transition to ready once hand tracker starts sending gestures
  useEffect(() => {
    if (handTrackerReady && phase === "loading") {
      setPhase("ready")
    }
  }, [handTrackerReady, phase])

  const startShuffle = useCallback(() => {
    setPhase("shuffling")
    setIsShuffling(true)
    setRevealedCard(null)
    setRevealedCardId(null)
    setSelectedIndex(0)

    // Play shuffle sounds
    const shuffleInterval = setInterval(() => {
      audioManager.shuffleSound()
    }, 200)

    // Reshuffle cards
    const newCards = getRandomCards(7)
    setCards(newCards)

    shuffleTimerRef.current = setTimeout(() => {
      clearInterval(shuffleInterval)
      setIsShuffling(false)
      setPhase("selecting")
      audioManager.selectSound()
    }, 2500)
  }, [])

  const selectCard = useCallback(() => {
    if (phase !== "selecting" || !cards[selectedIndex]) return

    const card = cards[selectedIndex]
    setRevealedCardId(card.id)
    setPhase("revealing")
    audioManager.flipSound()

    // After flip animation, show result
    setTimeout(() => {
      setRevealedCard(card)
      setPhase("result")
      audioManager.revealSound()

      // Trigger explosion at center
      explode(window.innerWidth / 2, window.innerHeight / 2, 80)
    }, 800)
  }, [phase, cards, selectedIndex, explode])

  const resetGame = useCallback(() => {
    setPhase("shuffling")
    setRevealedCard(null)
    setRevealedCardId(null)
    setSelectedIndex(0)
    startShuffle()
  }, [startShuffle])

  const handleGesture = useCallback(
    (gesture: GestureType) => {
      setCurrentGesture(gesture)
      setHandTrackerReady(true)

      // Clear gesture display after a moment
      setTimeout(() => setCurrentGesture("none"), 800)

      switch (gesture) {
        case "open_palm":
          if (phase === "ready") {
            audioManager.gestureDetectedSound()
            startShuffle()
          }
          break

        case "fist":
          if (phase === "selecting") {
            audioManager.selectSound()
            selectCard()
          }
          break

        case "swipe_left":
          if (phase === "selecting") {
            audioManager.swipeSound()
            setSelectedIndex((prev) => Math.max(0, prev - 1))
          }
          break

        case "swipe_right":
          if (phase === "selecting") {
            audioManager.swipeSound()
            setSelectedIndex((prev) => Math.min(cards.length - 1, prev + 1))
          }
          break

        case "two_hands":
          if (phase === "result" || phase === "selecting") {
            audioManager.gestureDetectedSound()
            resetGame()
          }
          break
      }
    },
    [phase, cards.length, startShuffle, selectCard, resetGame],
  )

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Particle background */}
      <ParticleCanvas />

      {/* Explosion effects layer */}
      <ExplosionCanvas canvasRef={explosionCanvasRef} />

      {/* Main game area */}
      <main className="relative z-10 w-full h-full flex flex-col">
        {/* Gesture guide at top */}
        <GestureGuide phase={phase} currentGesture={currentGesture} />

        {/* Title */}
        <header className="flex flex-col items-center pt-20 md:pt-24 pb-4">
          <h1 className="font-mono text-2xl md:text-4xl font-bold tracking-wider neon-text-blue text-neon-cyan">
            CYBER TAROT
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-[0.4em] uppercase mt-1">
            {"Gesture Controlled Fortune"}
          </p>
        </header>

        {/* Card area */}
        <div className="flex-1 flex items-center justify-center relative px-4">
          {phase === "ready" ? (
            <div className="flex flex-col items-center gap-6 animate-float">
              <div className="w-24 h-24 rounded-full border-2 border-neon-cyan/50 flex items-center justify-center animate-neon-pulse">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"
                    fill="hsl(195 100% 50%)"
                    opacity={0.3}
                  />
                  <path
                    d="M18 16v4l-2 2v8l2 2h2l2-4h4l2 4h2l2-2v-8l-2-2v-4h-4v2h-4v-2h-4z"
                    fill="hsl(195 100% 50%)"
                    opacity={0.8}
                  />
                </svg>
              </div>
              <p className="font-mono text-sm text-neon-cyan/80 text-center max-w-xs">
                {"Raise your open palm to start the reading"}
              </p>
            </div>
          ) : (
            <CardDeck
              cards={cards}
              selectedIndex={selectedIndex}
              isShuffling={isShuffling}
              revealedCardId={revealedCardId}
              phase={
                phase === "loading" || phase === "ready"
                  ? "idle"
                  : phase === "shuffling"
                    ? "shuffling"
                    : phase === "selecting"
                      ? "selecting"
                      : phase === "revealing"
                        ? "revealing"
                        : "result"
              }
            />
          )}
        </div>

        {/* Card index indicator when selecting */}
        {phase === "selecting" && (
          <div className="flex justify-center gap-2 pb-6">
            {cards.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? "bg-neon-cyan w-6"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </main>

      {/* Result overlay */}
      <ResultOverlay card={revealedCard} visible={phase === "result"} />

      {/* Hand tracker (camera feed in corner) */}
      <HandTracker onGesture={handleGesture} enabled={true} />

      {/* Bottom info bar */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              phase === "loading"
                ? "bg-muted-foreground"
                : "bg-neon-cyan animate-pulse"
            }`}
          />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {phase === "loading"
              ? "Waiting for camera..."
              : `Phase: ${phase}`}
          </span>
        </div>
      </div>
    </div>
  )
}
