"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { log } from "util"

interface GameResult {
  grade: string
  typingAccuracy: number
  typingTime: number
  readingAccuracy?: number
  readingCompleted: boolean
  completedAt: string
}

interface StudentData {
  name: string
  results: GameResult[]
}

export default function StudentResultsPage() {
  const [studentData, setStudentData] = useState<any>({
    name: "",
    results: [],
  })
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  useEffect(() => {
    // Get student results from localStorage
    const fetchStudentResults = async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`http://localhost:3100/api/actividades?alumnoId=${studentId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log(data)
        setStudentData({
          name: localStorage.getItem("selectedStudentName") || "Alumno",
          results: data,
        })
      }
      else {
        console.error("Error fetching student results")
      }
    }
    
    fetchStudentResults()
  }, [studentId])

  const handleBack = () => {
    router.push("/teacher/students")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={handleBack}
          className="mb-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
        >
          Volver
        </Button>

        {studentData ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Resultados de {studentData.name}</h1>
            <p className="text-gray-600 mb-6">ID: {studentId}</p>

            {studentData.results.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Este alumno aún no ha completado ningún juego</p>
            ) : (
              <div className="space-y-4">
                {studentData.results.map((result:any, index :number) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{result.actividad}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Puntaje</p>
                        <p className="text-2xl font-bold text-blue-600">10</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Descripción</p>
                        <p className="text-sm text-gray-700">{result.descripcion}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Completada</p>
                        <p className="text-lg font-bold text-green-600">✓ Sí</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Fecha</p>
                        <p className="text-sm text-gray-700">{new Date(result.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">Cargando resultados...</p>
        )}
      </div>
    </main>
  )
}
