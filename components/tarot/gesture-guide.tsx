"use client"

interface GestureGuideProps {
  phase: "loading" | "ready" | "shuffling" | "selecting" | "revealing" | "result"
  currentGesture: string
}

const phaseInstructions: Record<
  string,
  { label: string; gestures: { icon: string; text: string }[] }
> = {
  loading: {
    label: "INITIALIZING",
    gestures: [{ icon: "...", text: "Loading hand tracking..." }],
  },
  ready: {
    label: "READY",
    gestures: [{ icon: "hand", text: "Open palm to begin" }],
  },
  shuffling: {
    label: "SHUFFLING",
    gestures: [{ icon: "wait", text: "Cards are shuffling..." }],
  },
  selecting: {
    label: "SELECT A CARD",
    gestures: [
      { icon: "swipe", text: "Swipe to browse" },
      { icon: "fist", text: "Fist to select" },
    ],
  },
  revealing: {
    label: "REVEALING",
    gestures: [{ icon: "ok", text: "OK gesture to flip" }],
  },
  result: {
    label: "YOUR FORTUNE",
    gestures: [{ icon: "hands", text: "Raise both hands to restart" }],
  },
}

const gestureIcons: Record<string, string> = {
  hand: "\u270B",
  fist: "\u270A",
  ok: "\uD83D\uDC4C",
  swipe: "\uD83D\uDC48\uD83D\uDC49",
  hands: "\uD83D\uDE4C",
  wait: "\u23F3",
  "...": "\u2699\uFE0F",
}

export default function GestureGuide({
  phase,
  currentGesture,
}: GestureGuideProps) {
  const instruction = phaseInstructions[phase] || phaseInstructions.loading

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">
      {/* Phase label */}
      <div className="glass rounded-full px-5 py-2 neon-border">
        <span className="font-mono text-xs tracking-[0.3em] text-neon-cyan uppercase">
          {instruction.label}
        </span>
      </div>

      {/* Gesture instructions */}
      <div className="flex items-center gap-4">
        {instruction.gestures.map((g, i) => (
          <div
            key={i}
            className="glass rounded-lg px-4 py-2 flex items-center gap-2 text-sm"
          >
            <span className="text-lg" role="img" aria-hidden="true">
              {gestureIcons[g.icon] || g.icon}
            </span>
            <span className="font-mono text-xs text-foreground/80">
              {g.text}
            </span>
          </div>
        ))}
      </div>

      {/* Current gesture indicator */}
      {currentGesture !== "none" && phase !== "loading" && (
        <div
          className="glass rounded-full px-4 py-1.5 animate-neon-pulse"
          style={{
            boxShadow:
              "0 0 10px hsl(330 100% 65% / 0.4), 0 0 20px hsl(330 100% 65% / 0.2)",
          }}
        >
          <span className="font-mono text-xs text-neon-pink">
            {"Detected: "}
            {currentGesture.replace("_", " ").toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
