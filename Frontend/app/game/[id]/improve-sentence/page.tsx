"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, Lightbulb, RefreshCw } from "lucide-react"
import { Timer } from "@/components/timer"

interface SentenceExercise {
  original: string
  repeated: string
  suggestions: string[]
  correctAnswer: string
  explanation: string
}

const sentenceExercises: SentenceExercise[] = [
  {
    original: "El perro del vecino es un perro muy ruidoso",
    repeated: "perro",
    suggestions: ["animal", "canino", "mascota"],
    correctAnswer: "El perro del vecino es un animal muy ruidoso",
    explanation: "Reemplazamos la segunda mención de 'perro' con 'animal' para evitar la repetición."
  },
  {
    original: "Me gusta leer libros y leer revistas",
    repeated: "leer",
    suggestions: ["hojear", "consultar", "revisar"],
    correctAnswer: "Me gusta leer libros y revisar revistas",
    explanation: "Usamos otra palabra en lugar de repetir 'leer'."
  },
  {
    original: "La casa de María es una casa muy bonita",
    repeated: "casa",
    suggestions: ["vivienda", "hogar", "residencia"],
    correctAnswer: "La casa de María es una vivienda muy bonita",
    explanation: "Sustituimos 'casa' para mejorar el estilo."
  },
  {
    original: "Juan come mucho y come rápido",
    repeated: "come",
    suggestions: ["devora", "ingiere", "lo hace"],
    correctAnswer: "Juan come mucho y lo hace rápido",
    explanation: "Usamos otra palabra para evitar la repetición del verbo 'come'."
  },
  {
    original: "El maestro explicó la lección y el maestro puso tarea",
    repeated: "el maestro",
    suggestions: ["él", "luego", "después"],
    correctAnswer: "El maestro explicó la lección y luego puso tarea",
    explanation: "Eliminamos la repetición de 'el maestro' usando otra palabra."
  },
  {
    original: "Mi hermana tiene un gato y mi hermana lo cuida mucho",
    repeated: "mi hermana",
    suggestions: ["ella", "la niña", "mi hermanita"],
    correctAnswer: "Mi hermana tiene un gato y ella lo cuida mucho",
    explanation: "Reemplazamos 'mi hermana' con otra palabra."
  },
  {
    original: "Los niños juegan en el parque y los niños se divierten",
    repeated: "los niños",
    suggestions: ["ellos", "todos", "los pequeños"],
    correctAnswer: "Los niños juegan en el parque y ellos se divierten",
    explanation: "Usamos otra palabra para evitar repetir 'los niños'."
  },
  {
    original: "El libro es interesante y el libro tiene muchas ilustraciones",
    repeated: "el libro",
    suggestions: ["este", "éste", "además"],
    correctAnswer: "El libro es interesante y además tiene muchas ilustraciones",
    explanation: "Usamos otra palabra para conectar las ideas sin repetir 'el libro'."
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

export default function ImproveSentencePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentExercise, setCurrentExercise] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [answers, setAnswers] = useState<boolean[]>([])

  const exercise = sentenceExercises[currentExercise]

  useEffect(() => {
    setUserAnswer(exercise.original)
  }, [currentExercise])

  const highlightRepeatedWord = (text: string, repeated: string) => {
    const parts = text.split(new RegExp(`(${repeated})`, 'gi'))
    let count = 0
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === repeated.toLowerCase()) {
        count++
        return (
          <span
            key={index}
            className={count === 2 ? "bg-red-200 font-bold px-1 rounded" : "font-semibold"}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  const checkAnswer = () => {
    if (!userAnswer.trim()) return

    const normalizedAnswer = normalizeText(userAnswer)
    const normalizedCorrect = normalizeText(exercise.correctAnswer)
    
    // Check if the repeated word is no longer duplicated or if answer is similar to correct
    const isCorrect = normalizedAnswer === normalizedCorrect || 
                      !normalizedAnswer.includes(normalizeText(exercise.repeated + " " + exercise.repeated))

    setFeedback(isCorrect ? "correct" : "incorrect")
    setAnswers([...answers, isCorrect])

    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentExercise < sentenceExercises.length - 1) {
        setCurrentExercise(currentExercise + 1)
        setUserAnswer(sentenceExercises[currentExercise + 1].original)
        setFeedback(null)
        setShowSuggestions(false)
      } else {
        setIsComplete(true)
      }
    }, 3000)
  }

  const insertSuggestion = (suggestion: string) => {
    // This is a simplified version - in production, you'd want more sophisticated text replacement
    const newText = userAnswer.replace(
      new RegExp(`\\b${exercise.repeated}\\b`, 'i'),
      (match, offset) => {
        // Replace only the second occurrence
        const beforeMatch = userAnswer.substring(0, offset)
        const occurrences = (beforeMatch.match(new RegExp(`\\b${exercise.repeated}\\b`, 'gi')) || []).length
        return occurrences >= 1 ? suggestion : match
      }
    )
    setUserAnswer(newText)
  }

  const handleNext = () => {
    const finalScore = Math.round((score / sentenceExercises.length) * 100)
    
    sendActividadResults(
      `Juego de mejorar oraciones completado con ${score}/${sentenceExercises.length} respuestas correctas`,
      finalScore,
      "Mejorar Oraciones",
      elapsed,
      new Date().toISOString()
    )
    
    router.push(`/game/${gradeId}/transform-sentence`)
  }

  const handleRetry = () => {
    setCurrentExercise(0)
    setUserAnswer(sentenceExercises[0].original)
    setFeedback(null)
    setShowSuggestions(false)
    setScore(0)
    setIsComplete(false)
    setAnswers([])
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-pink-900">Mejorar Oraciones</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
            <div className="text-right">
              <p className="text-lg font-semibold text-pink-900">Puntuación</p>
              <p className="text-2xl font-bold text-pink-600">
                {score}/{sentenceExercises.length}
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
                  Ejercicio {currentExercise + 1} de {sentenceExercises.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentExercise + 1) / sentenceExercises.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-center text-gray-700 font-medium">
                ✏️ Esta oración tiene palabras repetidas. ¡Mejórala reemplazando las repeticiones!
              </p>
            </div>

            {/* Exercise */}
            <div className="space-y-6">
              {/* Original Sentence with Highlighting */}
              <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Oración con repetición:
                </p>
                <p className="text-xl leading-relaxed text-gray-800">
                  {highlightRepeatedWord(exercise.original, exercise.repeated)}
                </p>
                <p className="text-sm text-yellow-700 mt-3">
                  ⚠️ La palabra <strong className="text-yellow-900">"{exercise.repeated}"</strong> se repite
                </p>
              </div>

              {/* Text Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tu oración mejorada:
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Edita la oración aquí..."
                  className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 resize-none text-lg leading-relaxed"
                  disabled={feedback !== null}
                />
              </div>

              {/* Suggestions */}
              <div>
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-3"
                  disabled={feedback !== null}
                >
                  <Lightbulb size={20} />
                  {showSuggestions ? "Ocultar sugerencias" : "Ver sugerencias"}
                </button>

                {showSuggestions && (
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                    <p className="text-sm font-semibold text-purple-900 mb-3">
                      Palabras que puedes usar en lugar de "{exercise.repeated}":
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => insertSuggestion(suggestion)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          disabled={feedback !== null}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                          <strong>Ejemplo de respuesta:</strong> {exercise.correctAnswer}
                        </p>
                        <p className="text-green-700 text-sm mt-1">{exercise.explanation}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X size={24} className="text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-red-800 font-semibold">Intenta mejorar la oración</p>
                        <p className="text-red-700 text-sm mt-1">
                          <strong>Respuesta sugerida:</strong> {exercise.correctAnswer}
                        </p>
                        <p className="text-red-700 text-sm mt-1">{exercise.explanation}</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {!feedback && (
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim() || userAnswer === exercise.original}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Verificar Oración
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
                <h2 className="text-3xl font-bold text-pink-900 mb-2">
                  ¡Juego Completado!
                </h2>
                <p className="text-xl text-gray-700">
                  Mejoraste {score} de {sentenceExercises.length} oraciones correctamente
                </p>
                <p className="text-3xl font-bold text-pink-600 mt-4">
                  {Math.round((score / sentenceExercises.length) * 100)}%
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

              {/* Learning Message */}
              <div className="bg-pink-50 p-4 rounded-lg mb-6">
                <p className="text-pink-900 font-medium">
                  💡 Evitar repeticiones hace que tus textos sean más claros y profesionales.
                </p>
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
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
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
