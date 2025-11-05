"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Volume2, Mic, MicOff, Check, X } from "lucide-react"
import { Timer } from "@/components/timer"

interface TransformExercise {
  original: string
  tense: string
  correctAnswer: string
  hints?: string[]
}

const transformExercises: TransformExercise[] = [
  {
    original: "Yo juego fútbol",
    tense: "Pasado",
    correctAnswer: "Yo jugué fútbol",
    hints: ["El verbo 'jugar' en pasado es 'jugué'"]
  },
  {
    original: "Ella come pizza",
    tense: "Futuro",
    correctAnswer: "Ella comerá pizza",
    hints: ["El verbo 'comer' en futuro es 'comerá'"]
  },
  {
    original: "Nosotros estudiamos matemáticas",
    tense: "Pasado",
    correctAnswer: "Nosotros estudiamos matemáticas",
    hints: ["El verbo 'estudiar' en pasado para 'nosotros' es 'estudiamos'"]
  },
  {
    original: "Tú escribes una carta",
    tense: "Futuro",
    correctAnswer: "Tú escribirás una carta",
    hints: ["El verbo 'escribir' en futuro es 'escribirás'"]
  },
  {
    original: "Ellos corren en el parque",
    tense: "Pasado",
    correctAnswer: "Ellos corrieron en el parque",
    hints: ["El verbo 'correr' en pasado es 'corrieron'"]
  },
  {
    original: "Yo leo un libro",
    tense: "Pasado",
    correctAnswer: "Yo leí un libro",
    hints: ["El verbo 'leer' en pasado es 'leí'"]
  },
  {
    original: "María baila salsa",
    tense: "Futuro",
    correctAnswer: "María bailará salsa",
    hints: ["El verbo 'bailar' en futuro es 'bailará'"]
  },
  {
    original: "Nosotros vamos al cine",
    tense: "Pasado",
    correctAnswer: "Nosotros fuimos al cine",
    hints: ["El verbo 'ir' en pasado es irregular: 'fuimos'"]
  },
  {
    original: "Tú haces la tarea",
    tense: "Pasado",
    correctAnswer: "Tú hiciste la tarea",
    hints: ["El verbo 'hacer' en pasado es irregular: 'hiciste'"]
  },
  {
    original: "Ellos cantan en el coro",
    tense: "Futuro",
    correctAnswer: "Ellos cantarán en el coro",
    hints: ["El verbo 'cantar' en futuro es 'cantarán'"]
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

export default function TransformSentencePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentExercise, setCurrentExercise] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [useTextInput, setUseTextInput] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showHint, setShowHint] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const exercise = transformExercises[currentExercise]

  const speakSentence = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(exercise.original)
      utterance.lang = 'es-ES'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setHasRecorded(true)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error al acceder al micrófono:", error)
      alert("No se pudo acceder al micrófono. Puedes usar la entrada de texto como alternativa.")
      setUseTextInput(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,;:!?¿¡]/g, "")
  }

  const checkAnswer = () => {
    if (useTextInput && !userAnswer.trim()) return
    if (!useTextInput && !hasRecorded) return

    // For now, we'll use text input for verification
    // In production, you'd use speech-to-text API
    const normalizedAnswer = normalizeText(userAnswer || exercise.correctAnswer)
    const normalizedCorrect = normalizeText(exercise.correctAnswer)
    
    const isCorrect = normalizedAnswer === normalizedCorrect

    setFeedback(isCorrect ? "correct" : "incorrect")
    setAnswers([...answers, isCorrect])

    if (isCorrect) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentExercise < transformExercises.length - 1) {
        setCurrentExercise(currentExercise + 1)
        setUserAnswer("")
        setHasRecorded(false)
        setFeedback(null)
        setShowHint(false)
      } else {
        setIsComplete(true)
      }
    }, 3000)
  }

  const handleNext = () => {
    const finalScore = Math.round((score / transformExercises.length) * 100)
    
    sendActividadResults(
      `Juego de transformar oraciones completado con ${score}/${transformExercises.length} respuestas correctas`,
      finalScore,
      "Transformar Oraciones",
      elapsed,
      new Date().toISOString()
    )
    
    router.push(`/dashboard`)
  }

  const handleRetry = () => {
    setCurrentExercise(0)
    setUserAnswer("")
    setIsRecording(false)
    setHasRecorded(false)
    setUseTextInput(false)
    setFeedback(null)
    setScore(0)
    setIsComplete(false)
    setAnswers([])
    setShowHint(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-emerald-900">Transformar la Oración</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
            <div className="text-right">
              <p className="text-lg font-semibold text-emerald-900">Puntuación</p>
              <p className="text-2xl font-bold text-emerald-600">
                {score}/{transformExercises.length}
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
                  Ejercicio {currentExercise + 1} de {transformExercises.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentExercise + 1) / transformExercises.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-center text-gray-700 font-medium">
                🔄 Escucha la oración y repítela transformándola al tiempo verbal indicado
              </p>
            </div>

            {/* Exercise */}
            <div className="space-y-6">
              {/* Original Sentence */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <p className="text-sm font-semibold text-emerald-900 mb-2">
                    Oración original:
                  </p>
                  <p className="text-3xl font-bold text-emerald-900 mb-4">
                    "{exercise.original}"
                  </p>
                  <button
                    onClick={speakSentence}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
                  >
                    <Volume2 size={20} />
                    Escuchar Oración
                  </button>
                </div>
              </div>

              {/* Transform to */}
              <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-300 text-center">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  Transformar al tiempo:
                </p>
                <p className="text-4xl font-bold text-amber-600">{exercise.tense}</p>
              </div>

              {/* Input Method Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => setUseTextInput(!useTextInput)}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                  disabled={feedback !== null}
                >
                  {useTextInput ? "Usar micrófono" : "Usar entrada de texto"}
                </button>
              </div>

              {/* Recording or Text Input */}
              {!feedback && (
                <>
                  {useTextInput ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Escribe la oración transformada:
                      </label>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Escribe aquí la oración en el tiempo indicado..."
                        className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-lg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            checkAnswer()
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      {!hasRecorded ? (
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all text-lg ${
                            isRecording
                              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                        >
                          {isRecording ? (
                            <>
                              <MicOff size={24} />
                              Detener Grabación
                            </>
                          ) : (
                            <>
                              <Mic size={24} />
                              Grabar mi Respuesta
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                          <p className="text-green-800 font-semibold mb-3">
                            ✅ Grabación completada
                          </p>
                          <p className="text-sm text-green-700 mb-4">
                            Por favor, escribe tu respuesta para verificarla:
                          </p>
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Escribe lo que dijiste..."
                            className="w-full p-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 text-lg"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                checkAnswer()
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hint */}
                  <div>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm"
                    >
                      💡 {showHint ? "Ocultar pista" : "Ver pista"}
                    </button>
                    {showHint && exercise.hints && (
                      <div className="mt-2 bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
                        <p className="text-yellow-800 text-sm">{exercise.hints[0]}</p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  {(useTextInput || hasRecorded) && userAnswer.trim() && (
                    <button
                      onClick={checkAnswer}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                    >
                      Verificar Respuesta
                    </button>
                  )}
                </>
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
                        <p className="text-green-800 font-semibold">¡Correcto!</p>
                        <p className="text-green-700 text-sm mt-1">
                          <strong>Respuesta correcta:</strong> {exercise.correctAnswer}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X size={24} className="text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-red-800 font-semibold">Intenta de nuevo</p>
                        <p className="text-red-700 text-sm mt-1">
                          <strong>Respuesta correcta:</strong> {exercise.correctAnswer}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-emerald-900 mb-2">
                  ¡Juego Completado!
                </h2>
                <p className="text-xl text-gray-700">
                  Transformaste {score} de {transformExercises.length} oraciones correctamente
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-4">
                  {Math.round((score / transformExercises.length) * 100)}%
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
              <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                <p className="text-emerald-900 font-medium">
                  💡 Dominar los tiempos verbales te ayuda a expresarte mejor en cualquier situación.
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Finalizar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
