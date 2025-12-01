"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Award, Clock, Target } from "lucide-react"

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
  const [chartData, setChartData] = useState<any[]>([])
  const [statsData, setStatsData] = useState({
    averageScore: 0,
    totalActivities: 0,
    bestScore: 0,
    averageTime: 0,
  })
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']

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

        // Preparar datos para gráficos
        if (data.length > 0) {
          // Datos para gráfico de barras - últimas 10 actividades
          const lastActivities = data.slice(-10).map((result: any, index: number) => ({
            name: result.actividad.substring(0, 15) + (result.actividad.length > 15 ? '...' : ''),
            fullName: result.actividad,
            puntaje: result.puntaje,
            tiempo: result.tiempo || 0,
          }))
          setChartData(lastActivities)

          // Calcular estadísticas
          const totalScore = data.reduce((sum: number, r: any) => sum + (r.puntaje || 0), 0)
          const totalTime = data.reduce((sum: number, r: any) => sum + (r.tiempo || 0), 0)
          const avgScore = data.length > 0 ? Math.round(totalScore / data.length) : 0
          const avgTime = data.length > 0 ? Math.round(totalTime / data.length) : 0
          const maxScore = Math.max(...data.map((r: any) => r.puntaje || 0))

          setStatsData({
            averageScore: avgScore,
            totalActivities: data.length,
            bestScore: maxScore,
            averageTime: avgTime,
          })
        }
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
      <div className="max-w-7xl mx-auto">
        <Button
          onClick={handleBack}
          className="mb-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
        >
          Volver
        </Button>

        {studentData ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Resultados de {studentData.name}</h1>
              <p className="text-gray-600">ID: {studentId}</p>
            </div>

            {studentData.results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <p className="text-gray-600 text-center py-8">Este alumno aún no ha completado ningún juego</p>
              </div>
            ) : (
              <>
                {/* Estadísticas Generales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Promedio</p>
                        <p className="text-3xl font-bold text-blue-600">{statsData.averageScore}%</p>
                      </div>
                      <TrendingUp className="text-blue-500" size={32} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Mejor Puntaje</p>
                        <p className="text-3xl font-bold text-green-600">{statsData.bestScore}%</p>
                      </div>
                      <Award className="text-green-500" size={32} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Total Actividades</p>
                        <p className="text-3xl font-bold text-purple-600">{statsData.totalActivities}</p>
                      </div>
                      <Target className="text-purple-500" size={32} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Tiempo Promedio</p>
                        <p className="text-3xl font-bold text-orange-600">{statsData.averageTime}s</p>
                      </div>
                      <Clock className="text-orange-500" size={32} />
                    </div>
                  </div>
                </div>

                {/* Gráfico de Barras - Puntajes */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Puntajes por Actividad</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Puntaje (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-semibold text-gray-800">{payload[0].payload.fullName}</p>
                                <p className="text-blue-600">Puntaje: {payload[0].value}%</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Bar dataKey="puntaje" fill="#3b82f6" name="Puntaje (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Barras - Tiempos */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Tiempo por Actividad</h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis 
                        label={{ value: 'Tiempo (segundos)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-semibold text-gray-800">{payload[0].payload.fullName}</p>
                                <p className="text-purple-600">Tiempo: {payload[0].value}s</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Bar dataKey="tiempo" fill="#8b5cf6" name="Tiempo (segundos)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Lista Detallada de Resultados */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial Detallado</h2>
                  <div className="space-y-4">
                    {studentData.results.map((result: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-800">{result.actividad}</h3>
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {result.puntaje}%
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-600 text-sm">Descripción</p>
                            <p className="text-sm text-gray-700">{result.descripcion}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Tiempo</p>
                            <p className="text-lg font-bold text-gray-800">{result.tiempo || 0} segundos</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Fecha</p>
                            <p className="text-sm text-gray-700">
                              {new Date(result.updatedAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-center text-gray-600">Cargando resultados...</p>
          </div>
        )}
      </div>
    </main>
  )
}
