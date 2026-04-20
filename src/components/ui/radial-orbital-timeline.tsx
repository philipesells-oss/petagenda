'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface OrbitalNode {
  id: string
  emoji: string
  label: string
  sublabel?: string
  details: {
    title: string
    description: string
    bullets: string[]
    badge?: string
  }
}

interface RadialOrbitalTimelineProps {
  nodes: OrbitalNode[]
  className?: string
  autoRotate?: boolean
}

const ORBIT_RADIUS = 160
const NODE_RADIUS = 34
const CENTER = 220

function getPosition(index: number, total: number, radius: number, offsetAngle = -90) {
  const angle = (index / total) * 360 + offsetAngle
  const rad = (angle * Math.PI) / 180
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius }
}

// ── Mobile grid view ─────────────────────────────────────────────────────────

function MobileGrid({ nodes }: { nodes: OrbitalNode[] }) {
  const [active, setActive] = useState<string | null>(null)
  const activeNode = nodes.find((n) => n.id === active)

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {nodes.map((node) => {
          const isActive = node.id === active
          return (
            <button
              key={node.id}
              onClick={() => setActive((prev) => (prev === node.id ? null : node.id))}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-200',
                isActive
                  ? 'border-emerald-500 bg-emerald-500 shadow-md'
                  : 'border-emerald-100 bg-white hover:border-emerald-300',
              )}
            >
              <span className="text-3xl">{node.emoji}</span>
              <span
                className={cn(
                  'text-xs font-semibold leading-tight',
                  isActive ? 'text-white' : 'text-gray-700',
                )}
              >
                {node.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Detail card */}
      {activeNode && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-5 shadow-md">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl">{activeNode.emoji}</span>
            <div>
              <h3 className="font-bold text-gray-900">{activeNode.details.title}</h3>
              {activeNode.details.badge && (
                <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {activeNode.details.badge}
                </span>
              )}
            </div>
          </div>
          <p className="mb-3 text-sm text-gray-600 leading-relaxed">{activeNode.details.description}</p>
          <ul className="space-y-2">
            {activeNode.details.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0 size-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="size-2.5 text-emerald-600" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!active && (
        <p className="text-center text-sm text-gray-400 animate-pulse">
          Toque em um módulo para ver detalhes
        </p>
      )}
    </div>
  )
}

// ── Desktop orbital view ──────────────────────────────────────────────────────

function DesktopOrbital({ nodes, autoRotate }: { nodes: OrbitalNode[]; autoRotate: boolean }) {
  const [active, setActive] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    if (!autoRotate) return
    const tick = (ts: number) => {
      if (!pausedRef.current) {
        const delta = ts - (lastRef.current || ts)
        setRotation((r) => (r + delta * 0.012) % 360)
      }
      lastRef.current = ts
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [autoRotate])

  const activeNode = nodes.find((n) => n.id === active)

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Orbital diagram */}
      <div
        className="relative select-none"
        style={{ width: CENTER * 2, height: CENTER * 2 }}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
      >
        {/* SVG: ring + spokes */}
        <svg
          width={CENTER * 2}
          height={CENTER * 2}
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={ORBIT_RADIUS}
            fill="none"
            stroke="#d1fae5"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          {nodes.map((node, i) => {
            const pos = getPosition(i, nodes.length, ORBIT_RADIUS)
            const isActive = node.id === active
            return (
              <line
                key={`spoke-${node.id}`}
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + pos.x}
                y2={CENTER + pos.y}
                stroke={isActive ? '#059669' : '#d1fae5'}
                strokeWidth={isActive ? 1.5 : 1}
                strokeDasharray={isActive ? undefined : '4 4'}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
            )
          })}
        </svg>

        {/* Central hub */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-full bg-white shadow-lg border-2 border-emerald-200"
          style={{ width: 80, height: 80, left: CENTER - 40, top: CENTER - 40, zIndex: 10 }}
        >
          <span className="text-2xl">🐾</span>
          <span className="text-[10px] font-bold text-emerald-700 tracking-tight mt-0.5">PetFlow</span>
        </div>

        {/* Rotating nodes */}
        <div
          className="absolute inset-0"
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${CENTER}px ${CENTER}px` }}
        >
          {nodes.map((node, i) => {
            const pos = getPosition(i, nodes.length, ORBIT_RADIUS)
            const isActive = node.id === active
            return (
              <button
                key={node.id}
                onClick={() => setActive((prev) => (prev === node.id ? null : node.id))}
                className={cn(
                  'absolute flex flex-col items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none',
                  isActive
                    ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-200'
                    : 'border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 shadow-md',
                )}
                style={{
                  width: NODE_RADIUS * 2,
                  height: NODE_RADIUS * 2,
                  left: CENTER + pos.x - NODE_RADIUS,
                  top: CENTER + pos.y - NODE_RADIUS,
                  transform: `rotate(${-rotation}deg)`,
                  transformOrigin: `${NODE_RADIUS}px ${NODE_RADIUS}px`,
                  zIndex: isActive ? 20 : 15,
                }}
                aria-label={node.label}
              >
                <span className="text-xl leading-none">{node.emoji}</span>
                <span
                  className={cn(
                    'mt-0.5 text-[9px] font-semibold leading-tight text-center px-0.5',
                    isActive ? 'text-white' : 'text-gray-600',
                  )}
                >
                  {node.sublabel ?? node.label.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Fixed outer labels */}
        {nodes.map((node, i) => {
          const pos = getPosition(i, nodes.length, ORBIT_RADIUS + NODE_RADIUS + 18)
          const isActive = node.id === active
          return (
            <div
              key={`label-${node.id}`}
              className={cn(
                'absolute text-center pointer-events-none transition-opacity duration-300',
                isActive ? 'opacity-100' : 'opacity-60',
              )}
              style={{ left: CENTER + pos.x - 52, top: CENTER + pos.y - 16, width: 104 }}
            >
              <p className={cn('text-[11px] font-semibold leading-tight', isActive ? 'text-emerald-700' : 'text-gray-600')}>
                {node.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Detail card */}
      <div
        className={cn(
          'w-full max-w-lg rounded-2xl border-2 bg-white shadow-lg transition-all duration-300',
          activeNode
            ? 'border-emerald-200 opacity-100 p-6'
            : 'border-transparent opacity-0 pointer-events-none overflow-hidden max-h-0',
        )}
      >
        {activeNode && (
          <>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{activeNode.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{activeNode.details.title}</h3>
                {activeNode.details.badge && (
                  <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {activeNode.details.badge}
                  </span>
                )}
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-600 leading-relaxed">{activeNode.details.description}</p>
            <ul className="space-y-2">
              {activeNode.details.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 size-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="size-2.5 text-emerald-600" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {!active && (
        <p className="text-sm text-gray-400 animate-pulse">Clique em um módulo para ver detalhes</p>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function RadialOrbitalTimeline({ nodes, className, autoRotate = true }: RadialOrbitalTimelineProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: 2-col grid */}
      <div className="md:hidden">
        <MobileGrid nodes={nodes} />
      </div>
      {/* Desktop: orbital */}
      <div className="hidden md:flex justify-center">
        <DesktopOrbital nodes={nodes} autoRotate={autoRotate} />
      </div>
    </div>
  )
}
