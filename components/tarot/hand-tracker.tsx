"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  detectGesture,
  GestureDebouncer,
  type GestureType,
  type HandLandmark,
} from "@/lib/gesture-utils"

interface HandTrackerProps {
  onGesture: (gesture: GestureType) => void
  enabled: boolean
}

export default function HandTracker({ onGesture, enabled }: HandTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const gestureRef = useRef<GestureType>("none")
  const debouncerRef = useRef(new GestureDebouncer(4))
  const lastActionTimeRef = useRef<Record<string, number>>({})
  const handLandmarkerRef = useRef<unknown>(null)
  const animFrameRef = useRef<number>(0)

  // Throttle gesture actions to prevent rapid-fire
  const throttleGesture = useCallback(
    (gesture: GestureType) => {
      const now = Date.now()
      const cooldown: Record<string, number> = {
        open_palm: 1000,
        fist: 1200,
        ok: 1200,
        swipe_left: 400,
        swipe_right: 400,
        two_hands: 1500,
      }

      const cd = cooldown[gesture] || 500
      const lastTime = lastActionTimeRef.current[gesture] || 0

      if (now - lastTime >= cd) {
        lastActionTimeRef.current[gesture] = now
        onGesture(gesture)
      }
    },
    [onGesture],
  )

  useEffect(() => {
    if (!enabled) return

    let stream: MediaStream | null = null
    let destroyed = false

    async function init() {
      try {
        // Request camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        })

        if (destroyed) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }

        // Load MediaPipe via CDN
        const { FilesetResolver, HandLandmarker } = await import(
          /* webpackIgnore: true */
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs"
        )

        if (destroyed) return

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm",
        )

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
            delegate: "GPU",
          },
          numHands: 2,
          runningMode: "VIDEO",
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        if (destroyed) return

        handLandmarkerRef.current = handLandmarker
        setLoading(false)

        // Start detection loop
        let lastTime = -1

        function detect() {
          if (destroyed) return
          const video = videoRef.current
          if (!video || video.readyState < 2) {
            animFrameRef.current = requestAnimationFrame(detect)
            return
          }

          const now = performance.now()
          if (now === lastTime) {
            animFrameRef.current = requestAnimationFrame(detect)
            return
          }
          lastTime = now

          try {
            const results = (handLandmarker as {
              detectForVideo: (
                video: HTMLVideoElement,
                timestamp: number,
              ) => {
                landmarks: HandLandmark[][]
              }
            }).detectForVideo(video, now)

            // Draw hand landmarks on canvas
            drawLandmarks(results.landmarks)

            // Detect gesture
            if (results.landmarks && results.landmarks.length > 0) {
              const raw = detectGesture(results.landmarks)
              const debounced = debouncerRef.current.update(raw)

              if (debounced !== "none" && debounced !== gestureRef.current) {
                gestureRef.current = debounced
                throttleGesture(debounced)
              } else if (debounced === "none") {
                gestureRef.current = "none"
              }
            } else {
              gestureRef.current = "none"
              debouncerRef.current.reset()
            }
          } catch {
            // Silently handle detection errors
          }

          animFrameRef.current = requestAnimationFrame(detect)
        }

        detect()
      } catch (err) {
        if (!destroyed) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to initialize camera or hand tracking",
          )
          setLoading(false)
        }
      }
    }

    function drawLandmarks(allLandmarks: HandLandmark[][]) {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!allLandmarks) return

      for (const landmarks of allLandmarks) {
        // Draw connections
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [5, 9], [9, 10], [10, 11], [11, 12],
          [9, 13], [13, 14], [14, 15], [15, 16],
          [13, 17], [17, 18], [18, 19], [19, 20],
          [0, 17],
        ]

        ctx.strokeStyle = "rgba(0, 212, 255, 0.6)"
        ctx.lineWidth = 2

        for (const [start, end] of connections) {
          const a = landmarks[start]
          const b = landmarks[end]
          ctx.beginPath()
          ctx.moveTo(a.x * canvas.width, a.y * canvas.height)
          ctx.lineTo(b.x * canvas.width, b.y * canvas.height)
          ctx.stroke()
        }

        // Draw landmarks
        for (const lm of landmarks) {
          ctx.beginPath()
          ctx.arc(
            lm.x * canvas.width,
            lm.y * canvas.height,
            4,
            0,
            Math.PI * 2,
          )
          ctx.fillStyle = "rgba(168, 85, 247, 0.9)"
          ctx.fill()
          ctx.strokeStyle = "rgba(0, 212, 255, 0.8)"
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }
    }

    init()

    return () => {
      destroyed = true
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [enabled, throttleGesture])

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div
        className="relative rounded-xl overflow-hidden neon-border-cyan"
        style={{ width: "200px", height: "150px" }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
          aria-label="Camera feed for hand gesture tracking"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: "scaleX(-1)" }}
          aria-hidden="true"
        />

        {/* Status overlay */}
        {loading && (
          <div className="absolute inset-0 glass flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-neon-cyan font-mono">
              {cameraReady ? "Loading AI..." : "Starting camera..."}
            </span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 glass flex items-center justify-center p-2">
            <span className="text-xs text-destructive font-mono text-center">
              {error}
            </span>
          </div>
        )}

        {/* Camera indicator */}
        {!loading && !error && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono text-green-400/80">
              TRACKING
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
