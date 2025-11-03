"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookMarked, Brain, Volume2, Pen, Lightbulb, Flame } from "lucide-react"

export default function ReinforcementGamesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      router.push("/")
    } else {
      setUserId(storedUserId)
    }
  }, [router])

  const reinforcementGames = [
    {
      id: 1,
      title: "Vocabulario",
      description: "Aprende nuevas palabras y expande tu vocabulario",
      color: "bg-blue-500",
      icon: BookMarked,
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: 2,
      title: "Comprensión de Lectura",
      description: "Lee textos y responde preguntas sobre lo que leíste",
      color: "bg-green-500",
      icon: Brain,
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      id: 3,
      title: "Pronunciación Avanzada",
      description: "Mejora tu pronunciación con ejercicios especializados",
      color: "bg-purple-500",
      icon: Volume2,
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
    {
      id: 4,
      title: "Ortografía",
      description: "Practica la escritura correcta de palabras",
      color: "bg-yellow-500",
      icon: Pen,
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      id: 5,
      title: "Gramática",
      description: "Domina las reglas gramaticales del idioma",
      color: "bg-pink-500",
      icon: Lightbulb,
      buttonColor: "bg-pink-600 hover:bg-pink-700",
    },
    {
      id: 6,
      title: "Desafío Diario",
      description: "Completa un desafío diferente cada día",
      color: "bg-red-500",
      icon: Flame,
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
  ]

  return (
    <main className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ArrowLeft size={24} />
            Volver
          </button>
          <div>
            <h1 className="text-4xl font-bold text-blue-900">Juegos de Refuerzo</h1>
            <p className="text-gray-600">Practica y mejora tus habilidades</p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reinforcementGames.map((game) => {
            const IconComponent = game.icon
            return (
              <div
                key={game.id}
                className={`${game.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex justify-center mb-6">
                  <IconComponent size={64} className="drop-shadow-lg" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">{game.title}</h2>
                <p className="text-center text-white text-opacity-90 mb-6 text-sm">{game.description}</p>
                <button
                  onClick={() => router.push(`/reinforcement-games/${game.id}`)}
                  className={`${game.buttonColor} w-full text-white font-semibold py-3 rounded-lg transition-colors`}
                >
                  Comenzar
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
