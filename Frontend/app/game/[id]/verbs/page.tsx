"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Timer } from "@/components/timer"

interface VerbQuestion {
  id: string
  sentence: string
  correctVerb: string
  options: string[]
}

const verbGames: { [key: string]: VerbQuestion[] } = {
  "2": [
    {
      id: "1",
      sentence: "El niño corre en el parque",
      correctVerb: "corre",
      options: ["corre", "niño", "parque", "en"],
    },
    {
      id: "2",
      sentence: "La gata duerme sobre la cama",
      correctVerb: "duerme",
      options: ["duerme", "gata", "cama", "sobre"],
    },
    {
      id: "3",
      sentence: "Nosotros jugamos fútbol después de la escuela",
      correctVerb: "jugamos",
      options: ["jugamos", "nosotros", "fútbol", "escuela"],
    },
    {
      id: "4",
      sentence: "Ella come manzana por la mañana",
      correctVerb: "come",
      options: ["come", "ella", "manzana", "mañana"],
    },
    {
      id: "5",
      sentence: "Yo escribo una carta a mi amigo",
      correctVerb: "escribo",
      options: ["escribo", "yo", "carta", "amigo"],
    },
  ],
}

export default function VerbsGamePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [games, setGames] = useState<VerbQuestion[]>([])
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [correctCount, setCorrectCount] = useState(0)
  const [totalGames, setTotalGames] = useState(0)
  const [message, setMessage] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const gameList = verbGames[gradeId] || verbGames["2"]
    setGames(gameList)
    setTotalGames(gameList.length)
  }, [gradeId])

  const currentGame = games[currentGameIndex]

  // ✅ Memorizar el orden de opciones para que no cambien en cada render
  const shuffledOptions = useMemo(() => {
    if (!currentGame) return []
    return [...currentGame.options].sort(() => Math.random() - 0.5)
  }, [currentGame?.id])

  if (!currentGame) {
    return <div>Cargando...</div>
  }

  const handleSelectOption = (option: string) => {
    if (selectedOption === "") {
      setSelectedOption(option)

      if (option === currentGame.correctVerb) {
        setCorrectCount(correctCount + 1)
        setMessage("¡Correcto! 🎉")
        setTimeout(() => {
          if (currentGameIndex < games.length - 1) {
            setCurrentGameIndex(currentGameIndex + 1)
            setSelectedOption("")
            setMessage("")
          } else {
            handleComplete()
          }
        }, 1500)
      } else {
        setMessage("Intenta de nuevo")
        setTimeout(() => {
          setSelectedOption("")
          setMessage("")
        }, 1500)
      }
    }
  }

  const handleComplete = () => {
    const studentId = localStorage.getItem("currentStudentId")
    if (studentId) {
      const gameResults = localStorage.getItem("gameResults")
      const results = gameResults ? JSON.parse(gameResults) : {}

      if (!results[studentId]) {
        results[studentId] = []
      }

      const lastResult = results[studentId][results[studentId].length - 1]
      if (lastResult && lastResult.grade === gradeId) {
        lastResult.verbsAccuracy = Math.round((correctCount / totalGames) * 100)
        lastResult.verbsTime = elapsed
      }

      localStorage.setItem("gameResults", JSON.stringify(results))
    }
    router.push(`/game/${gradeId}/phonological`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-900">Reconocimiento de Verbos</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <Timer onTimeUpdate={setElapsed} startTime={startTime} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-8">
            <p className="text-xl font-bold text-green-900 mb-4">
              Pregunta {currentGameIndex + 1} de {totalGames}
            </p>
            <div className="mb-6 p-6 bg-green-50 rounded-lg border-2 border-green-300">
              <p className="text-2xl font-semibold text-gray-800 text-center">{currentGame.sentence}</p>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-4">¿Cuál es el verbo?</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {shuffledOptions.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(option)}
                  disabled={selectedOption !== ""}
                  className={`p-4 rounded-lg font-semibold text-lg transition-colors cursor-pointer ${
                    selectedOption === option
                      ? option === currentGame.correctVerb
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-green-200 hover:bg-green-300 text-gray-800"
                  } ${selectedOption !== "" && "opacity-60 cursor-not-allowed"}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg text-center font-bold text-lg ${
                  message.includes("Correcto") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {message}
              </div>
            )}

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Respuestas correctas:{" "}
                <span className="font-bold text-green-600">
                  {correctCount}/{totalGames}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}