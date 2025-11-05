"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react"
import { Timer } from "@/components/timer"

interface AccentWord {
  word: string
  syllables: string[]
  stressedIndex: number
  meaning?: string
}

const accentWords: AccentWord[] = [
  {
    word: "matemáticas",
    syllables: ["ma", "te", "má", "ti", "cas"],
    stressedIndex: 2,
    meaning: "Ciencia que estudia los números"
  },
  {
    word: "música",
    syllables: ["mú", "si", "ca"],
    stressedIndex: 0,
    meaning: "Arte de combinar sonidos"
  },
//   {
//     word: "rápido",
//     syllables: ["rá", "pi", "do"],
//     stressedIndex: 0,
//     meaning: "Que se mueve con velocidad"
//   },
  {
    word: "teléfono",
    syllables: ["te", "lé", "fo", "no"],
    stressedIndex: 1,
    meaning: "Aparato para comunicarse a distancia"
  },
//   {
//     word: "pájaro",
//     syllables: ["pá", "ja", "ro"],
//     stressedIndex: 0,
//     meaning: "Animal con plumas que vuela"
//   },
  {
    word: "árbol",
    syllables: ["ár", "bol"],
    stressedIndex: 0,
    meaning: "Planta grande con tronco y ramas"
  },
  {
    word: "canción",
    syllables: ["can", "ción"],
    stressedIndex: 1,
    meaning: "Composición musical para cantar"
  },
//   {
//     word: "lápiz",
//     syllables: ["lá", "piz"],
//     stressedIndex: 0,
//     meaning: "Instrumento para escribir"
//   },
//   {
//     word: "médico",
//     syllables: ["mé", "di", "co"],
//     stressedIndex: 0,
//     meaning: "Persona que cura enfermedades"
//   },
//   {
//     word: "cámara",
//     syllables: ["cá", "ma", "ra"],
//     stressedIndex: 0,
//     meaning: "Aparato para tomar fotografías"
//   }
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

export default function AccentPronunciationPage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentWord, setCurrentWord] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [showFeedback, setShowFeedback] = useState(false)
  const [completedWords, setCompletedWords] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const word = accentWords[currentWord]

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
        // Aquí se podría enviar el audio a un servicio de análisis
        setHasRecorded(true)
        setShowFeedback(true)
        // Simulamos que fue correcto (en producción, esto vendría de un análisis de audio real)
        setScore(score + 1)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error al acceder al micrófono:", error)
      alert("No se pudo acceder al micrófono. Por favor, verifica los permisos.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word)
      utterance.lang = 'es-ES'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleNext = () => {
    setCompletedWords([...completedWords, currentWord])
    if (currentWord < accentWords.length - 1) {
      setCurrentWord(currentWord + 1)
      setHasRecorded(false)
      setShowFeedback(false)
    } else {
      setIsComplete(true)
    }
  }

  const handleFinish = () => {
    const finalScore = Math.round((score / accentWords.length) * 100)
    
    sendActividadResults(
      `Juego de pronunciación con acento completado con ${score}/${accentWords.length} palabras`,
      finalScore,
      "Dilo con Acento",
      elapsed,
      new Date().toISOString()
    )
    
    router.push(`/dashboard`)
  }

  const handleRetry = () => {
    setCurrentWord(0)
    setIsRecording(false)
    setHasRecorded(false)
    setScore(0)
    setIsComplete(false)
    setShowFeedback(false)
    setCompletedWords([])
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-900">Dilo con Acento</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
            <div className="text-right">
              <p className="text-lg font-semibold text-orange-900">Puntuación</p>
              <p className="text-2xl font-bold text-orange-600">
                {score}/{accentWords.length}
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
                  Palabra {currentWord + 1} de {accentWords.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentWord + 1) / accentWords.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-center text-gray-700 font-medium">
                👂 Escucha la palabra y pronúnciala resaltando la sílaba tónica (la que tiene acento)
              </p>
            </div>

            {/* Word Display */}
            <div className="space-y-6">
              {/* Word with syllables */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-lg">
                <div className="text-center mb-4">
                  <p className="text-5xl font-bold text-orange-900 mb-2">{word.word}</p>
                  {word.meaning && (
                    <p className="text-gray-600 italic">{word.meaning}</p>
                  )}
                </div>
                
                {/* Syllables breakdown */}
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {word.syllables.map((syllable, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 rounded-lg text-2xl font-bold transition-all ${
                        index === word.stressedIndex
                          ? "bg-orange-500 text-white scale-110 shadow-lg"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {syllable}
                    </div>
                  ))}
                </div>
              </div>

              {/* Listen button */}
              <button
                onClick={speakWord}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-colors"
              >
                <Volume2 size={24} />
                Escuchar Palabra
              </button>

              {/* Recording Controls */}
              <div className="space-y-4">
                {!hasRecorded ? (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
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
                        Grabar mi Pronunciación
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    {showFeedback && (
                      <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4">
                        <p className="text-green-800 font-semibold text-center">
                          ¡Muy bien! Se ha grabado tu resultado.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handleNext}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors"
                    >
                      {currentWord < accentWords.length - 1 ? "Siguiente Palabra" : "Ver Resultados"}
                    </button>
                  </div>
                )}
              </div>

              {/* Hint */}
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <p className="text-sm text-yellow-800 text-center">
                  💡 <strong>Pista:</strong> La sílaba tónica es <strong className="text-yellow-900">{word.syllables[word.stressedIndex]}</strong>
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
                <h2 className="text-3xl font-bold text-orange-900 mb-2">
                  ¡Juego Completado!
                </h2>
                <p className="text-xl text-gray-700">
                  Pronunciaste {score} de {accentWords.length} palabras correctamente
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-4">
                  {Math.round((score / accentWords.length) * 100)}%
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Palabras practicadas:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {accentWords.map((w, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border-2 border-orange-200"
                    >
                      <p className="font-bold text-orange-900">{w.word}</p>
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
                  onClick={handleFinish}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
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
