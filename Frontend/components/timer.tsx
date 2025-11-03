"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function Timer({ onTimeUpdate, startTime = Date.now() }: { onTimeUpdate: (elapsed: number) => void, startTime?: number }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setSeconds(elapsed)
      onTimeUpdate(elapsed)
    }, 1000)

    return () => clearInterval(interval)        
  }, [startTime, onTimeUpdate])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
      <Clock size={20} className="text-blue-600" />
      <span className="text-xl font-bold text-blue-900">{formatTime(seconds)}</span>
    </div>
  )
}
