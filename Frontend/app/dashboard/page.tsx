"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, Puzzle, Lightbulb, Zap, Microscope, Monitor, Sparkles } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userFullName, setUserFullName] = useState<string | null>(null)

  useEffect(() => {
    // Obtener el ID del usuario del localStorage
    const storedUserId = localStorage.getItem("username")
    const storedFullName = localStorage.getItem("fullname")
    if (!storedUserId) {
      // Si no hay usuario, redirigir al login
      router.push("/")
    } else {
      setUserId(storedUserId)
      setUserFullName(storedFullName)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("username")
    router.push("/")
  }

  const games = [
    {
      id: 1,
      grade: "1° Grado",
      color: "bg-blue-400",
      icon: Zap,
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: 2,
      grade: "2° Grado",
      color: "bg-green-500",
      icon: BookOpen,
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      id: 3,
      grade: "3° Grado",
      color: "bg-yellow-400",
      icon: Lightbulb,
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    {
      id: 4,
      grade: "4° Grado",
      color: "bg-red-500",
      icon: Puzzle,
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    {
      id: 5,
      grade: "5° Grado",
      color: "bg-pink-500",
      icon: Microscope,
      buttonColor: "bg-pink-600 hover:bg-pink-700",
    },
    {
      id: 6,
      grade: "6° Grado",
      color: "bg-purple-600",
      icon: Monitor,
      buttonColor: "bg-purple-700 hover:bg-purple-800",
    },
  ]

  return (
    <main className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Juegos Educativos</h1>
            <p className="text-gray-600">Bienvenido, {userFullName}</p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const IconComponent = game.icon
            return (
              <div
                key={game.id}
                className={`${game.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex justify-center mb-6">
                  <IconComponent size={64} className="drop-shadow-lg" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">{game.grade}</h2>
                <button
                  onClick={() => router.push(`/game/${game.id}`)}
                  className={`${game.buttonColor} w-full text-white font-semibold py-3 rounded-lg transition-colors`}
                >
                  Ingresar al juego
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">Juegos de Refuerzo</h2>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-12 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Sparkles size={64} className="drop-shadow-lg" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Refuerzo de lectura</h3>
                  <p className="text-indigo-100">Refuerza tus habilidades con juegos especializados</p>
                </div>
              </div>
              <button
                onClick={() => router.push("/reinforcement-games")}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-8 rounded-lg transition-colors whitespace-nowrap"
              >
                Explorar Juegos
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
