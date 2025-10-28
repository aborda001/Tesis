"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trophy } from "lucide-react"
import { useEffect } from "react"

export default function CompletionPage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  useEffect(() => {
    const studentId = localStorage.getItem("currentStudentId")
    if (studentId) {
      const gameResults = localStorage.getItem("gameResults")
      const results = gameResults ? JSON.parse(gameResults) : {}

      if (!results[studentId]) {
        results[studentId] = []
      }

      // Data is already saved by the speaking game page, no need to save again
      localStorage.setItem("gameResults", JSON.stringify(results))
    }
  }, [gradeId])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Celebration Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          {/* Trophy Icon */}
          <div className="flex justify-center mb-6">
            <Trophy size={80} className="text-yellow-500 animate-bounce" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-purple-900 mb-4">¡Felicidades!</h1>

          <p className="text-xl text-gray-700 mb-2">Completaste todas las tareas del Grado {gradeId}</p>

          {/* Achievements */}
          <div className="my-8 space-y-3">
            <div className="flex items-center justify-center gap-3 text-lg text-green-600 font-semibold">
              <CheckCircle size={24} />
              Juego de Escritura completado
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-green-600 font-semibold">
              <CheckCircle size={24} />
              Juego de Lectura completado
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-8">
            <p className="text-gray-800 text-lg font-semibold">
              ¡Excelente trabajo! Aprendiste mucho hoy. Sigue practicando para mejorar cada día.
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-lg"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}
