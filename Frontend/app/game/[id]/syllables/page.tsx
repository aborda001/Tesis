"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Volume2 } from "lucide-react"
import { Timer } from "@/components/timer"

const syllableExercises: { [key: string]: Array<{ word: string; syllables: string[] }> } = {
  "1": [
    { word: "sol", syllables: ["sol"] },
    { word: "mesa", syllables: ["me", "sa"] },
    { word: "gato", syllables: ["ga", "to"] },
    { word: "casa", syllables: ["ca", "sa"] },
    { word: "perro", syllables: ["pe", "rro"] },
  ],
}

const sendActividadResults = async (descripcion: any, puntaje: any, actividad: any, tiempo: any, fecha: any) => {
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
    tiempo: tiempo,
    fecha: fecha,
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
        tiempo,
        fecha,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        console.error("Error al enviar los resultados de la actividad")
      }

      console.log("Resultados de la actividad enviados correctamente:", await res.json())


    })
  }
}


export default function SyllablesGame() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([])
  const [feedback, setFeedback] = useState("")
  const [accuracy, setAccuracy] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())

  const exerciseList = syllableExercises[gradeId] || syllableExercises["1"]
  const currentExercise = exerciseList[currentExerciseIndex]
  const [shuffledSyllables, setShuffledSyllables] = useState(() =>
    [...currentExercise.syllables].sort(() => Math.random() - 0.5)
  )

  useEffect(() => {
    setShuffledSyllables([...currentExercise.syllables].sort(() => Math.random() - 0.5))
  }, [currentExerciseIndex])


  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentExercise.word)
    utterance.lang = "es-ES"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  const toggleSyllable = (syllable: string) => {
    if (selectedSyllables.includes(syllable)) {
      setSelectedSyllables(selectedSyllables.filter((s) => s !== syllable))
    } else {
      setSelectedSyllables([...selectedSyllables, syllable])
    }
  }

  const checkAnswer = () => {
    const isCorrect = selectedSyllables.join("") === currentExercise.word.toLowerCase()

    if (isCorrect) {
      setFeedback("¡Excelente! Formaste la palabra correctamente: " + currentExercise.word)
      setCorrectAnswers(correctAnswers + 1)
      const newAccuracy = Math.round(((correctAnswers + 1) / exerciseList.length) * 100)
      setAccuracy(newAccuracy)

      setTimeout(() => {
        if (currentExerciseIndex < exerciseList.length - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1)
          setSelectedSyllables([])
          setFeedback("")
        } else {
          saveResults()
        }
      }, 2000)
    } else {
      setFeedback("Intenta de nuevo. Ordena las sílabas correctamente.")
      sendActividadResults(
        `Juego Sílabas Saltarinas completado con precisión, ha formado la palabra ${currentExercise.word} incorrectamente, puso ${selectedSyllables.join("")}`,
        0,
        "Sílabas Saltarinas",
        elapsed,
        new Date().toISOString()
      )
    }
  }

  const saveResults = () => {
    const studentId = localStorage.getItem("currentStudentId")
    if (studentId) {
      const gameResults = localStorage.getItem("gameResults")
      const results = gameResults ? JSON.parse(gameResults) : {}

      if (!results[studentId]) {
        results[studentId] = []
      }

      results[studentId].push({
        grade: gradeId,
        gameType: "syllables",
        accuracy: accuracy,
        completedAt: new Date().toISOString(),
      })

      localStorage.setItem("gameResults", JSON.stringify(results))
    }


    sendActividadResults(
      `Juego Sílabas Saltarinas completado con precisión, ha completado ${correctAnswers} de ${exerciseList.length} palabras correctamente`,
      10 * (accuracy / 100),
      "Sílabas Saltarinas",
      elapsed,
      new Date().toISOString()
    )

    router.push(`/game/${gradeId}/completion`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-yellow-600 hover:text-yellow-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-yellow-900">Sílabas Saltarinas</h1>
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
            <div className="text-right">
              <p className="text-lg font-semibold text-yellow-900">Precisión</p>
              <p className="text-2xl font-bold text-yellow-600">{accuracy}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 mb-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              Palabra {currentExerciseIndex + 1} de {exerciseList.length}
            </p>
            <p className="text-lg text-gray-700 mb-6">Escucha y ordena las sílabas:</p>
            <button
              onClick={speakWord}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors mx-auto mb-8"
            >
              <Volume2 size={24} />
              Escuchar Palabra
            </button>
          </div>

          <div className="mb-8">
            <p className="text-center text-gray-700 font-semibold mb-4">Sílabas disponibles:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {shuffledSyllables.map((syllable, index) => (
                <button
                  key={index}
                  onClick={() => toggleSyllable(syllable)}
                  className={`px-6 py-3 rounded-lg font-semibold text-lg transition-colors cursor-pointer ${
                    selectedSyllables.includes(syllable)
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {syllable}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-center text-gray-700 font-semibold mb-4">Tu respuesta:</p>
            <div className="bg-blue-50 p-6 rounded-lg text-center min-h-16 flex items-center justify-center">
              <p className="text-3xl font-bold text-blue-600">
                {selectedSyllables.length > 0 ? selectedSyllables.join("") : "..."}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => {
                setSelectedSyllables([])
                setFeedback("")
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={checkAnswer}
              disabled={selectedSyllables.length === 0}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Verificar
            </button>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-lg text-center font-semibold ${
                feedback.includes("Excelente")
                  ? "bg-green-100 text-green-800 border-2 border-green-500"
                  : "bg-yellow-100 text-yellow-800 border-2 border-yellow-500"
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
