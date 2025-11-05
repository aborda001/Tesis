"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mic, MicOff, Play, RotateCcw } from "lucide-react"
import { Timer } from "@/components/timer"

interface NarratorPrompt {
  imageUrl: string
  title: string
  description: string
}

const narratorPrompts: NarratorPrompt[] = [
  {
    imageUrl: "https://i.ibb.co/3DBzMTf/Playa.jpg",
    title: "Familia en la playa",
    description: "Una familia disfrutando un día en la playa"
  },
  {
    imageUrl: "https://i.ibb.co/4RXbbW2h/Animales.jpg",
    title: "Animales en el bosque",
    description: "Animales en su hábitat natural"
  },
  {
    imageUrl: "https://i.ibb.co/Vp0VhBtL/Espacio.jpg",
    title: "Aventura espacial",
    description: "Una aventura en el espacio"
  },
  {
    imageUrl: "https://i.ibb.co/G4GzKP0S/Escuela.jpg",
    title: "Día de escuela",
    description: "Un día típico en la escuela"
  }
]

const RECORDING_TIME = 20 // segundos

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

export default function NarratorPage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  // Seleccionar un prompt aleatorio al inicio
  const [selectedPrompt] = useState(() => {
    const randomIndex = Math.floor(Math.random() * narratorPrompts.length)
    return narratorPrompts[randomIndex]
  })
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [recordingTime, setRecordingTime] = useState(RECORDING_TIME)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const prompt = selectedPrompt

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

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
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setHasRecorded(true)
        
        stream.getTracks().forEach(track => track.stop())
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(RECORDING_TIME)

      // Start countdown timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error al acceder al micrófono:", error)
      alert("No se pudo acceder al micrófono. Por favor, verifica los permisos.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const handleRetryRecording = () => {
    setHasRecorded(false)
    setAudioUrl(null)
    setRecordingTime(RECORDING_TIME)
  }

  const handleSubmit = () => {
    // Marcar como completado
    setIsComplete(true)
  }

  const handleFinish = () => {
    // Enviar resultado con puntaje de 100 por completar la narración
    sendActividadResults(
      `Juego del narrador perfecto completado - Tema: ${prompt.title}`,
      100,
      "Narrador Perfecto",
      elapsed,
      new Date().toISOString()
    )
    
    router.push(`/dashboard`)
  }

  const handleRetryAll = () => {
    setIsRecording(false)
    setHasRecorded(false)
    setRecordingTime(RECORDING_TIME)
    setAudioUrl(null)
    setIsComplete(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-indigo-900">Narrador Perfecto</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
          </div>
        </div>

        {/* Game Container */}
        {!isComplete ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-center text-gray-700 font-medium">
                🎭 Observa la imagen y narra una pequeña historia en <strong>20 segundos</strong>
              </p>
            </div>

            {/* Image Display */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-4">
                <h3 className="text-xl font-bold text-indigo-900 text-center mb-2">
                  {prompt.title}
                </h3>
                <p className="text-gray-600 text-center text-sm">{prompt.description}</p>
              </div>
              
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={prompt.imageUrl}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/800x600/6366f1/ffffff?text=${encodeURIComponent(prompt.title)}`
                  }}
                />
              </div>
            </div>

            {/* Recording Controls */}
            <div className="space-y-4">
              {/* Timer Display */}
              {isRecording && (
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-300 text-center">
                  <p className="text-sm font-semibold text-red-800 mb-2">Tiempo restante</p>
                  <p className="text-5xl font-bold text-red-600">{recordingTime}s</p>
                </div>
              )}

              {/* Recording Button */}
              {!hasRecorded ? (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all text-lg ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff size={28} />
                      Detener Narración (Quedan {recordingTime}s)
                    </>
                  ) : (
                    <>
                      <Mic size={28} />
                      Comenzar a Narrar
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Playback Controls */}
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
                    <p className="text-green-800 font-semibold text-center mb-4">
                      ✅ Narración grabada exitosamente
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={playRecording}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Play size={20} />
                        Escuchar Narración
                      </button>
                      <button
                        onClick={handleRetryRecording}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <RotateCcw size={20} />
                        Grabar de Nuevo
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors"
                  >
                    Enviar Narración
                  </button>
                </div>
              )}

              {/* Tips */}
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Consejos:</strong> Describe qué ves en la imagen, qué están haciendo los personajes, 
                  cómo se sienten, y qué podría pasar después. ¡Sé creativo!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-indigo-900 mb-2">
                  ¡Narración Completada!
                </h2>
                <p className="text-xl text-gray-700 mb-2">
                  Has narrado exitosamente la historia
                </p>
                <p className="text-lg text-gray-600">
                  Tema: <strong>{prompt.title}</strong>
                </p>
                <p className="text-3xl font-bold text-indigo-600 mt-4">
                  100%
                </p>
              </div>

              {/* Achievement Message */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-indigo-900 mb-2 text-lg">
                  ¡Felicitaciones por tu creatividad!
                </h3>
                <p className="text-gray-700">
                  Has demostrado excelentes habilidades narrativas. Sigue practicando para mejorar 
                  tu expresión oral y creatividad.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetryAll}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={handleFinish}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
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
