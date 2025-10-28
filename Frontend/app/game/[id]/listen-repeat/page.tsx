"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Volume2 } from "lucide-react"

const words: { [key: string]: string[] } = {
  "1": ["sol", "mesa"],
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

export default function ListenRepeatGame() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [accuracy, setAccuracy] = useState(0)
  const [completedWords, setCompletedWords] = useState(0)

  const wordList = words[gradeId] || words["1"]
  const currentWord = wordList[currentWordIndex]

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord)
    utterance.lang = "es-ES"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    setIsListening(true)
    setFeedback("")

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "es-ES"

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim()
      const isCorrect = transcript === currentWord.toLowerCase()

      if (isCorrect) {
        setFeedback("¡Muy bien! Dijiste correctamente: " + currentWord)
        setCompletedWords(completedWords + 1)

        sendActividadResults(
          `Juego Escucha y Repite completado con precisión`,
          accuracy,
          "Escucha y Repite"
        )

        const newAccuracy = Math.round(((completedWords + 1) / wordList.length) * 100)
        setAccuracy(newAccuracy)

        setTimeout(() => {
          if (currentWordIndex < wordList.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1)
            setFeedback("")
          } else {
            saveResults()
          }
        }, 2000)
      } else {
        setFeedback(`Intenta de nuevo. Dijiste: "${transcript}", pero la palabra es: "${currentWord}"`)
        sendActividadResults(
          `Juego Escucha y Repite: palabra "${currentWord}", dijo "${transcript}"`,
          0,
          "Escucha y Repite"
        )
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

  const saveResults = () => {
    const studentId = localStorage.getItem("currentStudentId")
    if (studentId) {
      sendActividadResults(
        `Juego Escucha y Repite completado con precisión`,
        accuracy,
        "Escucha y Repite"
      )
    }
    router.push(`/game/${gradeId}/syllables`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(`/dashboard`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-blue-900">Escucha y Repite</h1>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-900">Progreso</p>
            <p className="text-2xl font-bold text-blue-600">
              {completedWords}/{wordList.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 mb-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              Palabra {currentWordIndex + 1} de {wordList.length}
            </p>
            <div className="text-6xl font-bold text-blue-600 mb-8">{currentWord}</div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={speakWord}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Volume2 size={24} />
              Escuchar
            </button>
            <button
              onClick={startListening}
              disabled={isListening}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isListening ? "Escuchando..." : "Repetir"}
            </button>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-lg text-center font-semibold ${feedback.includes("Muy bien")
                  ? "bg-green-100 text-green-800 border-2 border-green-500"
                  : "bg-yellow-100 text-yellow-800 border-2 border-yellow-500"
                }`}
            >
              {feedback}
            </div>
          )}

          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedWords / wordList.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
