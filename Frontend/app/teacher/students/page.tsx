"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Student {
  id: string
  name: string
  age: string
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // Get students from localStorage
    /* curl --location --request GET 'http://localhost:3100/api/alumnos' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmEzM2Y3YTZlOWMxOWYyZGY2MmVjNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NjEyMjc5NDgsImV4cCI6MTc2MTI1Njc0OH0.EFCNOa9ZRA0JuNQM4Aue7erlQzLSEhpF15YzFcTG1Vs' */
    const fetchStudents = async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:3100/api/alumnos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      } else {
        console.error("Error fetching students")
      }
    }
    
    fetchStudents()
  }, [])

  const handleViewResults = (studentId: string, studentName: string) => {
    router.push(`/teacher/students/${studentId}/results`)
  }

  const handleLogout = () => {
    localStorage.removeItem("userType")
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Panel de Docente</h1>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Cerrar Sesión
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Alumnos Registrados</h2>

          {students.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No hay alumnos registrados aún</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{student.username}</h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Edad:</span> {student.age}
                  </p>
                  <Button
                    onClick={() => handleViewResults(student._id, student.username)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Ver Resultados
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
