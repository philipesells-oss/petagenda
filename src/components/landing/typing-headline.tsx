'use client'

import { useEffect, useState } from 'react'

const PHRASES = [
  'sair do caderninho.',
  'ser mais lucrativo.',
  'impressionar clientes.',
]

const TYPE_SPEED = 60
const DELETE_SPEED = 35
const PAUSE_AFTER_TYPE = 2000
const PAUSE_AFTER_DELETE = 400

export function TypingHeadline() {
  const [displayed, setDisplayed] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(id)
  }, [])

  // Typing logic
  useEffect(() => {
    const current = PHRASES[phraseIndex]

    if (!isDeleting && displayed === current) {
      const id = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE)
      return () => clearTimeout(id)
    }

    if (isDeleting && displayed === '') {
      const id = setTimeout(() => {
        setIsDeleting(false)
        setPhraseIndex((i) => (i + 1) % PHRASES.length)
      }, PAUSE_AFTER_DELETE)
      return () => clearTimeout(id)
    }

    const speed = isDeleting ? DELETE_SPEED : TYPE_SPEED
    const id = setTimeout(() => {
      setDisplayed(
        isDeleting ? current.slice(0, displayed.length - 1) : current.slice(0, displayed.length + 1),
      )
    }, speed)
    return () => clearTimeout(id)
  }, [displayed, isDeleting, phraseIndex])

  return (
    <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
      {displayed}
      <span
        className={`inline-block w-[3px] h-[0.85em] ml-[2px] align-middle rounded-sm bg-emerald-500 dark:bg-emerald-400 transition-opacity duration-100 ${
          showCursor ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </span>
  )
}
