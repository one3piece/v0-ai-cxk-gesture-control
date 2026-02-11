"use client"

import React from "react"

import { useEffect, useRef, useCallback } from "react"

interface ExplosionParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string
  life: number
  maxLife: number
  decay: number
}

const EXPLOSION_COLORS = [
  "#00d4ff",
  "#a855f7",
  "#ec4899",
  "#6366f1",
  "#fbbf24",
  "#34d399",
]

export function useExplosion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ExplosionParticle[]>([])
  const animRef = useRef<number>(0)
  const activeRef = useRef(false)

  const startAnimation = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function animate() {
      if (!canvas || !ctx) return
      const particles = particlesRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05 // gravity
        p.vx *= p.decay
        p.vy *= p.decay
        p.alpha = 1 - p.life / p.maxLife

        // Main particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.alpha * 3, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * 0.2
        ctx.fill()
      }

      ctx.globalAlpha = 1

      if (particles.length > 0) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        activeRef.current = false
      }
    }

    animate()
  }, [])

  const explode = useCallback(
    (x: number, y: number, count = 60) => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5)
        const speed = Math.random() * 8 + 3
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 4 + 2,
          alpha: 1,
          color:
            EXPLOSION_COLORS[
              Math.floor(Math.random() * EXPLOSION_COLORS.length)
            ],
          life: 0,
          maxLife: 50 + Math.random() * 30,
          decay: 0.97,
        })
      }

      // Add sparkle ring
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20
        const speed = Math.random() * 3 + 6
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          alpha: 1,
          color: "#ffffff",
          life: 0,
          maxLife: 30,
          decay: 0.95,
        })
      }

      startAnimation()
    },
    [startAnimation],
  )

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return { canvasRef, explode }
}

export default function ExplosionCanvas({
  canvasRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}) {
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
      width={typeof window !== "undefined" ? window.innerWidth : 1920}
      height={typeof window !== "undefined" ? window.innerHeight : 1080}
      aria-hidden="true"
    />
  )
}
