"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookMarked, Brain } from "lucide-react"

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
      title: "Primer Ciclo",
      description: "Lecturas y actividades para el primer ciclo",
      color: "bg-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: 2,
      title: "Segundo Ciclo",
      description: "Lecturas y actividades para el segundo ciclo",
      color: "bg-green-500",
      buttonColor: "bg-green-600 hover:bg-green-700",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reinforcementGames.map((game) => {
            return (
              <div
                key={game.id}
                className={`${game.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex justify-center mb-6">
                  {game.id === 1 ? (
                    <BookMarked size={64} className="drop-shadow-lg" />
                  ) : (
                    <Brain size={64} className="drop-shadow-lg" />
                  )}
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
