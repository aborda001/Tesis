"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

const typingTexts: { [key: string]: string } = {
  "2": "La casa es grande y tiene un jardín bonito.",
  "3": "Hoy aprendí a escribir una carta.",
  "4": "Los estudiantes juegan fútbol en el recreo.",
  "6": "Los estudiantes juegan fútbol en el recreo.",
}

const sendActividadResults = async (descripcion: any, puntaje: any, actividad: any) => {
  /* curl --location --request GET 'http://localhost:3100/api/actividades?alumnoId=68fa34f6a072759b4a541ae3' \
--header 'Content-Type: application/json' \
--data '{
    "actividad": "Juego leer",
    "descripcion": "Este es un juego en el que alumno debe leer",
    "puntaje": 10,
    "alumnoId": "68fa34f6a072759b4a541ae3"
}' */
  const studentId = localStorage.getItem("userId")
  console.log("Student ID:", studentId);
  console.log("Datos a enviar", {
    actividad,
    descripcion,
    puntaje,
    alumnoId: studentId,
  });


  if (studentId) {
    await fetch(`http://localhost:3100/api/actividades?alumnoId=${studentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actividad,
        descripcion,
        puntaje,
        alumnoId: studentId,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        console.error("Error al enviar los resultados de la actividad")
      }

      console.log("Resultados de la actividad enviados correctamente:", await res.json())


    })
  }
}

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [userInput, setUserInput] = useState("")
  const [typingText, setTypingText] = useState("")
  const [accuracy, setAccuracy] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Obtener el texto según el grado
    if (gradeId === "1") {
      router.push(`/game/${gradeId}/listen-repeat`)
    } else {
      const text = typingTexts[gradeId] || typingTexts["2"]
      setTypingText(text)
    }
  }, [gradeId, router])

  useEffect(() => {
    // Calcular precisión
    if (typingText.length > 0) {
      let correctChars = 0
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === typingText[i]) {
          correctChars++
        }
      }
      const acc = Math.round((correctChars / typingText.length) * 100)
      setAccuracy(acc)

      // Verificar si completó el texto
      if (userInput === typingText) {
        setIsComplete(true)
      }
    }
  }, [userInput, typingText])

  const getCharColor = (index: number) => {
    if (index < userInput.length) {
      if (userInput[index] === typingText[index]) {
        return "text-black" // Correcto
      } else {
        return "text-red-500" // Incorrecto
      }
    }
    return "text-gray-400" // No escrito aún
  }

  const handleNextClick = () => {
    const studentId = localStorage.getItem("currentStudentId")
    if (studentId) {
      
      if (accuracy > 70) {
              sendActividadResults(
        `Juego de Escritura completado con precisión`,
        accuracy,
        "Juego de Escritura"
      )     } else {
        sendActividadResults(
          `Juego de Escritura completado con precisión baja`,
          accuracy,
          "Juego de Escritura"
        )
      }
    }
    router.push(`/game/${gradeId}/speaking`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900">Juego de Escritura</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-900">Precisión</p>
            <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
          </div>
        </div>

        {/* Game Container */}
        {gradeId !== "1" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Text to Type */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-xl leading-relaxed font-mono text-center">
                {typingText.split("").map((char, index) => (
                  <span key={index} className={getCharColor(index)}>
                    {char}
                  </span>
                ))}
              </p>
            </div>

            {/* Input Area */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Escribe el texto aquí:</label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Comienza a escribir..."
                className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none font-mono text-base"
                disabled={isComplete}
              />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progreso</span>
                <span className="text-sm font-semibold text-gray-700">
                  {userInput.length} / {typingText.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(userInput.length / typingText.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Completion Message */}
            {isComplete && (
              <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold text-center text-lg">
                  ¡Felicidades! Completaste el juego con {accuracy}% de precisión
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {gradeId !== "1" && (
            <button
              onClick={() => {
                setUserInput("")
                setAccuracy(0)
                setIsComplete(false)
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
            >
              Reintentar
            </button>
          )}
          {gradeId !== "1" && (
            <button
              onClick={handleNextClick}
              disabled={accuracy < 50}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
