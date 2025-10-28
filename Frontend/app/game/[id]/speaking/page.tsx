"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic } from "lucide-react"
import { CameraInline } from "@/components/camera-inline"

const speakingTexts: { [key: string]: string } = {
  "1": "El perro corre rápido por el parque.",
  "2": "La casa es grande y tiene un jardín bonito.",
  "3": "Hoy aprendí a escribir una carta.",
  "4": "Los estudiantes juegan fútbol en el recreo.",
  "5": "La tecnología nos ayuda a aprender mejor.",
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

export default function SpeakingGamePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [speakingText, setSpeakingText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [recognizedText, setRecognizedText] = useState("")

  useEffect(() => {
    const text = speakingTexts[gradeId] || speakingTexts["1"]
    setSpeakingText(text)
  }, [gradeId])

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz. Por favor, usa Chrome, Edge o Firefox.")
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "es-ES"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setRecognizedText(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error("Error en reconocimiento de voz:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleNextClick = () => {
    const studentId = localStorage.getItem("currentStudentId")
    if (studentId && recognizedText) {
      const gameResults = localStorage.getItem("gameResults")
      const results = gameResults ? JSON.parse(gameResults) : {}

      if (!results[studentId]) {
        results[studentId] = []
      }

      let correctChars = 0
      const minLength = Math.min(recognizedText.length, speakingText.length)
      for (let i = 0; i < minLength; i++) {
        if (recognizedText[i].toLowerCase() === speakingText[i].toLowerCase()) {
          correctChars++
        }
      }
      const readingAccuracy = Math.round((correctChars / speakingText.length) * 100)

      // Find and update the last result for this student and grade
      if (results[studentId].length > 0) {
        const lastResult = results[studentId][results[studentId].length - 1]
        if (lastResult.grade === gradeId) {
          lastResult.readingCompleted = true
          lastResult.readingAccuracy = readingAccuracy
        }
      }

      sendActividadResults(
        `Juego de Lectura completado con precisión ${readingAccuracy}%`,
        readingAccuracy,
        "Juego de Lectura"
      )  
    }
    router.push(`/game/${gradeId}/phonological`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-900">Juego de Lectura</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="w-20" />
        </div>

        {/* Game Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Camera Inline */}
          <CameraInline />

          {/* Text to Read */}
          <div className="mb-8 p-6 bg-green-50 rounded-lg">
            <p className="text-2xl leading-relaxed font-semibold text-center text-gray-800">{speakingText}</p>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-gray-700 font-semibold">
              Lee el texto en voz alta. Presiona el botón del micrófono para comenzar.
            </p>
          </div>

          {/* Microphone Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleMicClick}
              disabled={isListening}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white text-lg transition-all ${
                isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              <Mic size={24} />
              {isListening ? "Escuchando..." : "Presiona para Leer"}
            </button>
          </div>

          {/* Recognized Text Display */}
          {recognizedText && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-600 mb-2">Texto reconocido:</p>
              <p className="text-gray-800 text-lg">{recognizedText}</p>
            </div>
          )}

          {/* Success Message */}
          {recognizedText && (
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold text-center text-lg">
                ¡Excelente! Completaste el juego de lectura
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => {
              setRecognizedText("")
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Reintentar
          </Button>
          <Button
            onClick={handleNextClick}
            disabled={!recognizedText}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </main>
  )
}
