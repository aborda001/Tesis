"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Volume2, Star } from "lucide-react"

const soundPairs: { [key: string]: Array<{ pair1: string; pair2: string }> } = {
  "1": [
    { pair1: "pa", pair2: "ba" },
    { pair1: "sa", pair2: "za" },
    { pair1: "ta", pair2: "da" },
    { pair1: "ca", pair2: "ga" },
  ],
}

export default function SimilarSoundsGame() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [accuracy, setAccuracy] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [stars, setStars] = useState<boolean[]>([])

  const soundPairList = soundPairs[gradeId] || soundPairs["1"]
  const currentPair = soundPairList[currentPairIndex]

  const speakSound = (sound: string) => {
    const utterance = new SpeechSynthesisUtterance(sound)
    utterance.lang = "es-ES"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  const checkAnswer = (selectedSound: string) => {
    setIsListening(true)
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.lang = "es-ES"

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim()
      const isCorrect = transcript === selectedSound.toLowerCase()

      if (isCorrect) {
        setFeedback("¡Correcto! Diferenciaste bien los sonidos.")
        setCorrectAnswers(correctAnswers + 1)
        const newAccuracy = Math.round(((correctAnswers + 1) / soundPairList.length) * 100)
        setAccuracy(newAccuracy)
        setStars([...stars, true])

        setTimeout(() => {
          if (currentPairIndex < soundPairList.length - 1) {
            setCurrentPairIndex(currentPairIndex + 1)
            setFeedback("")
          } else {
            saveResults()
          }
        }, 2000)
      } else {
        setFeedback("Intenta de nuevo. Escucha bien la diferencia.")
        setStars([...stars, false])
      }
    }

    recognition.onerror = () => {
      setFeedback("No pude escucharte. Intenta de nuevo.")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const sendActividadResults = async (
    descripcion: string,
    puntaje: number,
    actividad: string,
    tiempo: number,
    fecha: string
  ) => {
    try {
      const studentId = localStorage.getItem("userId")
      if (!studentId) {
        console.error("No se encontró el ID del estudiante")
        return
      }

      const response = await fetch(`http://localhost:3100/api/actividades?alumnoId=${studentId}`, {
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
          fecha,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar resultados")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const saveResults = async () => {
    await sendActividadResults(
      "Sonidos similares",
      accuracy,
      "Sonidos similares",
      0,
      new Date().toISOString()
    )
    router.push(`/game/${gradeId}/syllables`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-green-900">Sonidos Parecidos</h1>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-900">Precisión</p>
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 mb-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              Par {currentPairIndex + 1} de {soundPairList.length}
            </p>
            <p className="text-lg text-gray-700 mb-6">Diferencia entre estos sonidos:</p>
            <div className="flex justify-center gap-8 mb-8">
              <div className="bg-green-100 p-6 rounded-lg">
                <p className="text-4xl font-bold text-green-600 mb-4">{currentPair.pair1}</p>
                <button
                  onClick={() => speakSound(currentPair.pair1)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Volume2 size={20} />
                  Escuchar
                </button>
              </div>
              <div className="bg-blue-100 p-6 rounded-lg">
                <p className="text-4xl font-bold text-blue-600 mb-4">{currentPair.pair2}</p>
                <button
                  onClick={() => speakSound(currentPair.pair2)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Volume2 size={20} />
                  Escuchar
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => checkAnswer(currentPair.pair1)}
              disabled={isListening}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Elegir: {currentPair.pair1}
            </button>
            <button
              onClick={() => checkAnswer(currentPair.pair2)}
              disabled={isListening}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Elegir: {currentPair.pair2}
            </button>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-lg text-center font-semibold mb-6 ${
                feedback.includes("Correcto")
                  ? "bg-green-100 text-green-800 border-2 border-green-500"
                  : "bg-yellow-100 text-yellow-800 border-2 border-yellow-500"
              }`}
            >
              {feedback}
            </div>
          )}

          <div className="flex justify-center gap-2">
            {stars.map((correct, index) => (
              <Star key={index} size={32} className={correct ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
