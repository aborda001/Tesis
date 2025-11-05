"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X } from "lucide-react"
import { Timer } from "@/components/timer"

interface VerbExercise {
  sentence: string
  verb: string
  tense: string
  correctAnswer: string
}

const verbExercises: VerbExercise[] = [
  {
    sentence: "Pedro ___ por todo el parque",
    verb: "Correr",
    tense: "Pasado",
    correctAnswer: "corrió"
  },
  {
    sentence: "María ___ un delicioso pastel",
    verb: "Hacer",
    tense: "Presente",
    correctAnswer: "hace"
  },
  {
    sentence: "Los niños ___ al cine mañana",
    verb: "Ir",
    tense: "Futuro",
    correctAnswer: "irán"
  },
  {
    sentence: "Yo ___ un libro interesante ayer",
    verb: "Leer",
    tense: "Pasado",
    correctAnswer: "leí"
  },
  {
    sentence: "Nosotros ___ la tarea ahora",
    verb: "Escribir",
    tense: "Presente",
    correctAnswer: "escribimos"
  },
  {
    sentence: "Ella ___ a la fiesta el próximo sábado",
    verb: "Venir",
    tense: "Futuro",
    correctAnswer: "vendrá"
  },
  {
    sentence: "Tú ___ muy bien en el examen la semana pasada",
    verb: "Salir",
    tense: "Pasado",
    correctAnswer: "saliste"
  },
  {
    sentence: "El profesor ___ la clase en este momento",
    verb: "Explicar",
    tense: "Presente",
    correctAnswer: "explica"
  }
]

const sendActividadResults = async (descripcion: any, puntaje: any, actividad: any, tiempo: any, fecha: any) => {
  const studentId = localStorage.getItem("userId")
  console.log("Student ID:", studentId)
  console.log("Datos a enviar", {
    actividad,
    descripcion,
    puntaje,
    alumnoId: studentId,
    tiempo,
    fecha
  })

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
        tiempo,
        fecha
      }),
    }).then(async (res) => {
      if (!res.ok) {
        console.error("Error al enviar los resultados de la actividad")
      }
      console.log("Resultados de la actividad enviados correctamente:", await res.json())
    })
  }
}

export default function CompleteVerbsPage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentExercise, setCurrentExercise] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [answers, setAnswers] = useState<boolean[]>([])

  const exercise = verbExercises[currentExercise]

  const normalizeAnswer = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(exercise.correctAnswer)
    setFeedback(isCorrect ? "correct" : "incorrect")
    setAnswers([...answers, isCorrect])

    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentExercise < verbExercises.length - 1) {
        setCurrentExercise(currentExercise + 1)
        setUserAnswer("")
        setFeedback(null)
      } else {
        setIsComplete(true)
      }
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !feedback) {
      handleSubmit()
    }
  }

  const handleNext = () => {
    const finalScore = Math.round((score / verbExercises.length) * 100)
    
    sendActividadResults(
      `Juego de completar verbos completado con ${score}/${verbExercises.length} respuestas correctas`,
      finalScore,
      "Completar Verbos",
      elapsed,
      new Date().toISOString()
    )
    
    router.push(`/game/${gradeId}/accent-pronunciation`)
  }

  const handleRetry = () => {
    setCurrentExercise(0)
    setUserAnswer("")
    setFeedback(null)
    setScore(0)
    setIsComplete(false)
    setAnswers([])
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-purple-900">Completar con Verbos</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
            <div className="text-right">
              <p className="text-lg font-semibold text-purple-900">Puntuación</p>
              <p className="text-2xl font-bold text-purple-600">
                {score}/{verbExercises.length}
              </p>
            </div>
          </div>
        </div>

        {/* Game Container */}
        {!isComplete ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progreso</span>
                <span className="text-sm font-semibold text-gray-700">
                  Ejercicio {currentExercise + 1} de {verbExercises.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentExercise + 1) / verbExercises.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Exercise */}
            <div className="space-y-6">
              {/* Sentence */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="text-2xl text-center font-medium text-gray-800">
                  {exercise.sentence}
                </p>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Verbo:</p>
                  <p className="text-xl font-bold text-blue-600">{exercise.verb}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-1">Tiempo:</p>
                  <p className="text-xl font-bold text-green-600">{exercise.tense}</p>
                </div>
              </div>

              {/* Answer Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Escribe la palabra faltante:
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-lg"
                  disabled={feedback !== null}
                />
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    feedback === "correct"
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-red-100 border-2 border-red-500"
                  }`}
                >
                  {feedback === "correct" ? (
                    <>
                      <Check size={24} className="text-green-600" />
                      <div>
                        <p className="text-green-800 font-semibold">¡Correcto!</p>
                        <p className="text-green-700 text-sm">La respuesta es: {exercise.correctAnswer}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X size={24} className="text-red-600" />
                      <div>
                        <p className="text-red-800 font-semibold">Incorrecto</p>
                        <p className="text-red-700 text-sm">
                          La respuesta correcta es: {exercise.correctAnswer}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {!feedback && (
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Verificar Respuesta
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-purple-900 mb-2">
                  ¡Juego Completado!
                </h2>
                <p className="text-xl text-gray-700">
                  Obtuviste {score} de {verbExercises.length} respuestas correctas
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-4">
                  {Math.round((score / verbExercises.length) * 100)}%
                </p>
              </div>

              {/* Summary of answers */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Resumen de respuestas:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {answers.map((isCorrect, index) => (
                    <div
                      key={index}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Reintentar
                </button>
                <button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Siguiente Juego
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
