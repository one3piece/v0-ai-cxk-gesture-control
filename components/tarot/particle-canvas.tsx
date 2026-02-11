"use client"

import React from "react"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string
  life: number
  maxLife: number
}

const COLORS = [
  "rgba(0, 212, 255,",  // cyan
  "rgba(168, 85, 247,", // purple
  "rgba(236, 72, 153,", // pink
  "rgba(99, 102, 241,", // indigo
]

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -1, y: -1 })
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Initialize background star particles
    const particles = particlesRef.current
    for (let i = 0; i < 120; i++) {
      particles.push(createStarParticle(canvas.width, canvas.height))
    }

    function createStarParticle(w: number, h: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: -1, // -1 means infinite
      }
    }

    function animate() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        if (p.maxLife > 0) {
          p.life++
          if (p.life >= p.maxLife) {
            particles.splice(i, 1)
            continue
          }
          p.alpha = 1 - p.life / p.maxLife
        } else {
          // Twinkle for star particles
          p.alpha = 0.3 + Math.sin(Date.now() * 0.002 + p.x) * 0.3
        }

        p.x += p.vx
        p.y += p.vy

        // Wrap around for star particles
        if (p.maxLife === -1) {
          if (p.x < 0) p.x = canvas.width
          if (p.x > canvas.width) p.x = 0
          if (p.y < 0) p.y = canvas.height
          if (p.y > canvas.height) p.y = 0
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color} ${p.alpha})`
        ctx.fill()

        // Draw glow
        if (p.size > 1.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `${p.color} ${p.alpha * 0.15})`
          ctx.fill()
        }
      }

      // Draw connections between nearby particles
      const starParticles = particles.filter((p) => p.maxLife === -1)
      for (let i = 0; i < starParticles.length; i++) {
        for (let j = i + 1; j < starParticles.length; j++) {
          const dx = starParticles[i].x - starParticles[j].x
          const dy = starParticles[i].y - starParticles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(starParticles[i].x, starParticles[i].y)
            ctx.lineTo(starParticles[j].x, starParticles[j].y)
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.1 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}

// Exported function to create burst particles at a position
export function createBurstParticles(
  particlesRef: React.MutableRefObject<Particle[]>,
  x: number,
  y: number,
  count = 30,
) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const speed = Math.random() * 4 + 2
    particlesRef.current.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 3 + 1,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: 40 + Math.random() * 20,
    })
  }
}
