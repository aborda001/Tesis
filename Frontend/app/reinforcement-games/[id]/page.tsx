"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mic, Square } from "lucide-react"
import { CameraInline } from "@/components/camera-inline"
import { Timer } from "@/components/timer"

// Declaraciones de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// 🔍 Función de comparación palabra por palabra con alineación flexible
function compareReading(expectedText: string, spokenText: string) {
  const clean = (t: string) =>
    t.replace(/[^\wáéíóúüñ\s]/gi, "").toLowerCase().split(/\s+/).filter(Boolean)

  const expected = clean(expectedText)
  const spoken = clean(spokenText)

  // Índice de seguimiento para palabras habladas
  let spokenIndex = 0
  
  const comparison = expected.map((word) => {
    // Buscar la palabra esperada en las siguientes palabras habladas (ventana de búsqueda)
    let found = false
    let searchLimit = Math.min(spokenIndex + 3, spoken.length) // Buscar en las próximas 3 palabras
    
    for (let i = spokenIndex; i < searchLimit; i++) {
      if (spoken[i] === word) {
        found = true
        spokenIndex = i + 1 // Avanzar el índice después de la palabra encontrada
        break
      }
    }
    
    // Si no se encontró en la ventana, marcar como incorrecto y avanzar solo 1 posición
    if (!found && spokenIndex < spoken.length) {
      spokenIndex++
    }
    
    return {
      word,
      correct: found,
    }
  })

  const correctCount = comparison.filter((w) => w.correct).length
  const score = Math.max(1, Math.round((correctCount / expected.length) * 10))

  return { comparison, score }
}

export default function ExtendedReadingPage() {
  const router = useRouter()
  const params = useParams()
  const cycleId = params.id

  const [currentText, setCurrentText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [userId, setUserId] = useState("")
  const [showCompletion, setShowCompletion] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<{ word: string; correct: boolean }[]>([])
  const [score, setScore] = useState<number | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef(Date.now())

  // Textos para cada ciclo
  const textsByGrade: Record<number, string[]> = useMemo(
    () => ({
      1: [
        "🌳 Un día en la plaza\nHoy Lucía fue a la plaza con su mamá.\nEl sol brillaba y los pájaros cantaban.\nLucía corrió por el pasto y saludó a sus amigos.\nJuntos jugaron a la pelota y compartieron una merienda.\nCuando se hizo tarde, todos ayudaron a juntar la basura.\nLucía se sintió feliz porque cuidaron el lugar donde juegan.",
      ],
      2: [
        "🌞 La mañana en el campo\nEra una mañana clara y fresca. Los rayos del sol iluminaban los árboles y el canto de los gallos anunciaba un nuevo día.\nCamila ayudó a su abuelo a recoger las frutas del huerto. Mientras trabajaban, él le contaba historias de cuando era niño.\nEl aroma de las naranjas llenaba el aire, y Camila comprendió que cada fruta era el resultado del esfuerzo y la paciencia.",
      ],
    }),
    []
  )

  useEffect(() => {
    const storedUserId = localStorage.getItem("currentStudentId")
    if (storedUserId) setUserId(storedUserId)

    // Convertir cycleId a número para usar como índice
    const cycleKey = Array.isArray(cycleId) ? parseInt(cycleId[0]) : parseInt(cycleId as string)
    const textsArray = textsByGrade[cycleKey] || textsByGrade[1]
    const randomText = textsArray[Math.floor(Math.random() * textsArray.length)]
    setCurrentText(randomText)
  }, [cycleId, textsByGrade])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = "es-ES"
      recognition.continuous = true
      recognition.interimResults = true

      let accumulatedText = ""

      recognition.onresult = (event: any) => {
        let interimText = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcriptSegment = result[0].transcript

          if (result.isFinal) {
            accumulatedText += transcriptSegment + " "
          } else {
            interimText += transcriptSegment
          }
        }

        const fullText = (accumulatedText + " " + interimText).trim()
        setTranscript(fullText)

        // 🔹 Comparar lectura y calcular puntuación
        if (currentText) {
          const { comparison, score } = compareReading(currentText, fullText)
          setComparisonResult(comparison)
          setScore(score)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Error en reconocimiento:", event.error)
      }

      recognition.start()

      // 🔹 Grabación de audio para referencia
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        recognition.stop()
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      startTimeRef.current = Date.now()
    } catch (error) {
      console.error("Error al grabar:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleComplete = () => {
    const result = {
      studentId: userId,
      cycleId,
      text: currentText,
      transcript,
      score,
      timeSeconds: elapsedTime,
      completedAt: new Date().toISOString(),
    }

    const existingResults = JSON.parse(localStorage.getItem("reinforcementResults") || "[]")
    existingResults.push(result)
    localStorage.setItem("reinforcementResults", JSON.stringify(existingResults))
    setShowCompletion(true)
  }

  if (showCompletion) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-green-700 mb-4">¡Excelente!</h1>
          <p className="text-gray-700 mb-4">Completaste la lectura de refuerzo</p>
          <p className="text-lg font-semibold text-blue-600 mb-2">
            Tiempo: {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
          </p>
          {score !== null && (
            <p className="text-xl font-bold text-green-700 mb-6">Puntuación: {score}/10</p>
          )}
          <button
            onClick={() => router.push("/reinforcement-games")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Volver a Juegos
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/reinforcement-games")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ArrowLeft size={24} />
            Volver
          </button>
          <Timer onTimeUpdate={setElapsedTime} startTime={startTimeRef.current} />
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <CameraInline />
          </div>

          {/* Texto a leer */}
          <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center whitespace-pre-line">
              {currentText}
            </h2>
          </div>

          {/* Botones de grabación */}
          <div className="flex flex-col gap-4 mb-8">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                <Mic size={24} />
                Comenzar a Grabar
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors animate-pulse"
              >
                <Square size={24} />
                Detener Grabación
              </button>
            )}
          </div>

          {/* Transcripción y comparación */}
          {transcript && (
            <div className="mb-8 bg-green-50 p-6 rounded-lg border-2 border-green-300 max-h-60 overflow-y-auto">
              <p className="text-sm font-semibold text-green-700 mb-3">Tu lectura reconocida:</p>
              <div className="leading-relaxed flex flex-wrap gap-2">
                {comparisonResult.length > 0
                  ? comparisonResult.map(({ word, correct }, i) => (
                      <span
                        key={i}
                        className={`${
                          correct
                            ? "text-green-700 font-semibold"
                            : "text-red-600 font-semibold underline"
                        }`}
                      >
                        {word}
                      </span>
                    ))
                  : transcript}
              </div>

              {score !== null && (
                <div className="text-center text-lg font-bold text-blue-700 mt-4">
                  Puntuación: {score}/10
                </div>
              )}
            </div>
          )}

          {/* Botón de completar */}
          {transcript && (
            <button
              onClick={handleComplete}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
