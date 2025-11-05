"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, HelpCircle } from "lucide-react"
import { Timer } from "@/components/timer"

interface PunctuationExercise {
  textWithoutPunctuation: string
  correctText: string
  hint: string
}

const punctuationExercises: PunctuationExercise[] = [
  {
    textWithoutPunctuation: "María fue al mercado compró frutas verduras y pan luego regresó a casa",
    correctText: "María fue al mercado, compró frutas, verduras y pan. Luego regresó a casa.",
    hint: "Recuerda usar comas para separar elementos en una lista y punto al final de cada oración."
  },
  {
    textWithoutPunctuation: "Qué hermoso día hace hoy vamos al parque",
    correctText: "¡Qué hermoso día hace hoy! ¿Vamos al parque?",
    hint: "Las exclamaciones llevan signos de admiración y las preguntas signos de interrogación."
  },
  {
    textWithoutPunctuation: "El maestro dijo estudien para el examen el lunes tendremos prueba",
    correctText: "El maestro dijo: \"Estudien para el examen\". El lunes tendremos prueba.",
    hint: "Usa dos puntos antes de una cita y comillas para encerrar las palabras exactas."
  },
  {
    textWithoutPunctuation: "Pedro mi mejor amigo vive en la ciudad",
    correctText: "Pedro, mi mejor amigo, vive en la ciudad.",
    hint: "Las aclaraciones van entre comas."
  },
  {
    textWithoutPunctuation: "Me gustan los deportes fútbol básquetbol y natación",
    correctText: "Me gustan los deportes: fútbol, básquetbol y natación.",
    hint: "Usa dos puntos antes de una enumeración."
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

export default function PunctuationPage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentExercise, setCurrentExercise] = useState(0)
  const [userText, setUserText] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [answers, setAnswers] = useState<boolean[]>([])

  const exercise = punctuationExercises[currentExercise]

  useEffect(() => {
    // Initialize with the text without punctuation
    setUserText(exercise.textWithoutPunctuation)
  }, [currentExercise])

  const normalizePunctuation = (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/([¿¡])\s+/g, "$1")
  }

  const calculateSimilarity = (text1: string, text2: string): number => {
    const normalized1 = normalizePunctuation(text1.toLowerCase())
    const normalized2 = normalizePunctuation(text2.toLowerCase())
    
    if (normalized1 === normalized2) return 100
    
    // Simple similarity based on matching characters
    let matches = 0
    const maxLength = Math.max(normalized1.length, normalized2.length)
    const minLength = Math.min(normalized1.length, normalized2.length)
    
    for (let i = 0; i < minLength; i++) {
      if (normalized1[i] === normalized2[i]) {
        matches++
      }
    }
    
    return Math.round((matches / maxLength) * 100)
  }

  const handleSubmit = () => {
    if (!userText.trim()) return

    const similarity = calculateSimilarity(userText, exercise.correctText)
    const isCorrect = similarity >= 85
    
    setFeedback(isCorrect ? "correct" : "incorrect")
    setAnswers([...answers, isCorrect])

    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentExercise < punctuationExercises.length - 1) {
        setCurrentExercise(currentExercise + 1)
        setUserText(punctuationExercises[currentExercise + 1].textWithoutPunctuation)
        setFeedback(null)
        setShowHint(false)
      } else {
        setIsComplete(true)
      }
    }, 3000)
  }

  const handleNext = () => {
    const finalScore = Math.round((score / punctuationExercises.length) * 100)
    
    sendActividadResults(
      `Juego de puntuación completado con ${score}/${punctuationExercises.length} textos correctos`,
      finalScore,
      "Signos de Puntuación",
      elapsed,
      new Date().toISOString()
    )
    
    router.push(`/game/${gradeId}/narrator`)
  }

  const handleRetry = () => {
    setCurrentExercise(0)
    setUserText(punctuationExercises[0].textWithoutPunctuation)
    setFeedback(null)
    setShowHint(false)
    setScore(0)
    setIsComplete(false)
    setAnswers([])
  }

  // Insert punctuation helper buttons
  const insertPunctuation = (mark: string) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = userText
    const newText = text.substring(0, start) + mark + text.substring(end)
    
    setUserText(newText)
    
    // Set cursor position after inserted character
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + mark.length
      textarea.focus()
    }, 0)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-teal-900">Signos de Puntuación</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
            <div className="text-right">
              <p className="text-lg font-semibold text-teal-900">Puntuación</p>
              <p className="text-2xl font-bold text-teal-600">
                {score}/{punctuationExercises.length}
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
                  Ejercicio {currentExercise + 1} de {punctuationExercises.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentExercise + 1) / punctuationExercises.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-center text-gray-700 font-medium">
                📝 Edita el texto y coloca los signos de puntuación correctamente
              </p>
            </div>

            {/* Exercise */}
            <div className="space-y-6">
              {/* Punctuation Buttons */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-3">Signos disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {['.', ',', ';', ':', '¿', '?', '¡', '!', '"', '-', '(', ')'].map((mark) => (
                    <button
                      key={mark}
                      onClick={() => insertPunctuation(mark)}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-colors"
                      disabled={feedback !== null}
                    >
                      {mark}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Texto para editar:
                </label>
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Edita el texto aquí..."
                  className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none text-lg leading-relaxed"
                  disabled={feedback !== null}
                />
              </div>

              {/* Hint Button */}
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold"
                disabled={feedback !== null}
              >
                <HelpCircle size={20} />
                {showHint ? "Ocultar pista" : "Ver pista"}
              </button>

              {/* Hint */}
              {showHint && (
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                  <p className="text-yellow-800">
                    💡 <strong>Pista:</strong> {exercise.hint}
                  </p>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    feedback === "correct"
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-red-100 border-2 border-red-500"
                  }`}
                >
                  {feedback === "correct" ? (
                    <>
                      <Check size={24} className="text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-green-800 font-semibold">¡Excelente!</p>
                        <p className="text-green-700 text-sm mt-1">
                          <strong>Texto correcto:</strong> {exercise.correctText}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X size={24} className="text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-red-800 font-semibold">Revisa tu puntuación</p>
                        <p className="text-red-700 text-sm mt-1">
                          <strong>Texto correcto:</strong> {exercise.correctText}
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
                  disabled={!userText.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Verificar Puntuación
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
                <h2 className="text-3xl font-bold text-teal-900 mb-2">
                  ¡Juego Completado!
                </h2>
                <p className="text-xl text-gray-700">
                  Obtuviste {score} de {punctuationExercises.length} textos correctos
                </p>
                <p className="text-3xl font-bold text-teal-600 mt-4">
                  {Math.round((score / punctuationExercises.length) * 100)}%
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
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
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
