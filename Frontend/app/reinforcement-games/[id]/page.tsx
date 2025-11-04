"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mic, Square } from "lucide-react"
import { CameraInline } from "@/components/camera-inline"
import { Timer } from "@/components/timer"

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

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const startTimeRef = useRef(Date.now())

  // Textos para cada ciclo
  const textsByGrade = {
    1: [
      "🌳 Un día en la plaza\nHoy Lucía fue a la plaza con su mamá.\nEl sol brillaba y los pájaros cantaban.\nLucía corrió por el pasto y saludó a sus amigos.\nJuntos jugaron a la pelota y compartieron una merienda.\nCuando se hizo tarde, todos ayudaron a juntar la basura.\nLucía se sintió feliz porque cuidaron el lugar donde juegan.",
    ],
    2: [
      "🌞 La mañana en el campo\nEra una mañana clara y fresca. Los rayos del sol iluminaban los árboles y el canto de los gallos anunciaba un nuevo día.\nCamila ayudó a su abuelo a recoger las frutas del huerto. Mientras trabajaban, él le contaba historias de cuando era niño.\nEl aroma de las naranjas llenaba el aire, y Camila comprendió que cada fruta era el resultado del esfuerzo y la paciencia.",
    ],
  }

  useEffect(() => {
    const storedUserId = localStorage.getItem("currentStudentId")
    if (storedUserId) {
      setUserId(storedUserId)
    }

    // Seleccionar texto aleatorio del ciclo
    const textsArray = textsByGrade[cycleId] || textsByGrade[1]
    const randomText = textsArray[Math.floor(Math.random() * textsArray.length)]
    setCurrentText(randomText)
  }, [cycleId])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = "es-ES"
      recognition.continuous = true
      recognition.interimResults = true

      let fullTranscript = ""
let accumulatedText = "" // acumulador fuera del callback

recognition.onresult = (event) => {
  let interimText = ""

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i]
    const transcriptSegment = result[0].transcript

    if (result.isFinal) {
      // 🔹 solo agregamos texto confirmado
      accumulatedText += transcriptSegment + " "
    } else {
      // 🔹 texto temporal (mientras se habla)
      interimText += transcriptSegment
    }
  }

  // 🔹 Mostramos acumulado + temporal en pantalla
  setTranscript((accumulatedText + " " + interimText).trim())
}



      recognition.onerror = (event: any) => {
        console.error("[v0] Error en reconocimiento:", event.error)
      }

      recognition.start()

      // Grabar audio para referencia
      const mediaRecorder = new (window.MediaRecorder || MediaRecorder)(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
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
      console.error("[v0] Error al grabar:", error)
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
      timeSeconds: elapsedTime,
      completedAt: new Date().toISOString(),
    }

    // Guardar en localStorage
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
          <p className="text-lg font-semibold text-blue-600 mb-8">
            Tiempo: {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
          </p>
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
          {/* Camera */}
          <div className="mb-8">
            <CameraInline />
          </div>

          {/* Text to read */}
          <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center whitespace-pre-line">{currentText}</h2>
          </div>

          {/* Recording Controls */}
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

          {/* Transcription */}
          {transcript && (
            <div className="mb-8 bg-green-50 p-6 rounded-lg border-2 border-green-300 max-h-40 overflow-y-auto">
              <p className="text-sm font-semibold text-green-700 mb-3">Tu lectura fue grabada:</p>
              {/* Mejorado manejo de texto largo */}
              <p className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-wrap">{transcript}</p>
            </div>
          )}

          {/* Complete Button */}
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
