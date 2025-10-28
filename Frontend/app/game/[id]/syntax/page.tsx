"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface SyntaxGame {
  id: string
  words: string[]
  correctOrder: string[]
  hint: string
}

const syntaxGames: { [key: string]: SyntaxGame[] } = {
  "1": [
    {
      id: "1",
      words: ["juega", "niño", "el"],
      correctOrder: ["el", "niño", "juega"],
      hint: "El niño hace una acción",
    },
    {
      id: "2",
      words: ["corre", "perro", "el"],
      correctOrder: ["el", "perro", "corre"],
      hint: "El animal se mueve",
    },
    {
      id: "3",
      words: ["come", "gato", "el"],
      correctOrder: ["el", "gato", "come"],
      hint: "El felino realiza una acción",
    },
  ],
  "2": [
    {
      id: "1",
      words: ["grande", "casa", "la"],
      correctOrder: ["la", "casa", "grande"],
      hint: "Describe una vivienda",
    },
    {
      id: "2",
      words: ["rojo", "libro", "el"],
      correctOrder: ["el", "libro", "rojo"],
      hint: "Describe un objeto",
    },
    {
      id: "3",
      words: ["bonito", "jardín", "el"],
      correctOrder: ["el", "jardín", "bonito"],
      hint: "Describe un lugar",
    },
  ],
  "3": [
    {
      id: "1",
      words: ["plaza", "por", "corre", "perro", "la", "el"],
      correctOrder: ["el", "perro", "corre", "por", "la", "plaza"],
      hint: "Oración completa con lugar",
    },
    {
      id: "2",
      words: ["escuela", "el", "a", "va", "niño", "la"],
      correctOrder: ["el", "niño", "va", "a", "la", "escuela"],
      hint: "Oración con destino",
    },
    {
      id: "3",
      words: ["juego", "en", "el", "juegan", "niños", "los"],
      correctOrder: ["los", "niños", "juegan", "en", "el", "juego"],
      hint: "Oración con lugar",
    },
  ],
  "4": [
    {
      id: "1",
      words: ["matemáticas", "estudia", "estudiante", "el"],
      correctOrder: ["el", "estudiante", "estudia", "matemáticas"],
      hint: "Sujeto, verbo, objeto",
    },
    {
      id: "2",
      words: ["biblioteca", "en", "lee", "profesor", "la", "el"],
      correctOrder: ["el", "profesor", "lee", "en", "la", "biblioteca"],
      hint: "Oración con lugar",
    },
    {
      id: "3",
      words: ["la", "computadora", "usa", "alumno", "el"],
      correctOrder: ["el", "alumno", "usa", "la", "computadora"],
      hint: "Sujeto, verbo, objeto",
    },
  ],
  "5": [
    {
      id: "1",
      words: ["tecnología", "aprenden", "estudiantes", "los"],
      correctOrder: ["los", "estudiantes", "aprenden", "tecnología"],
      hint: "Oración simple",
    },
    {
      id: "2",
      words: ["internet", "en", "investigan", "los", "alumnos"],
      correctOrder: ["los", "alumnos", "investigan", "en", "internet"],
      hint: "Oración compleja",
    },
    {
      id: "3",
      words: ["un", "proyecto", "realizan", "grupo", "un"],
      correctOrder: ["un", "grupo", "realiza", "un", "proyecto"],
      hint: "Trabajo colaborativo",
    },
  ],
  "6": [
    {
      id: "1",
      words: ["el", "científico", "método", "utilizan", "investigadores", "los"],
      correctOrder: ["los", "investigadores", "utilizan", "el", "método", "científico"],
      hint: "Oración académica",
    },
    {
      id: "2",
      words: ["los", "y", "conclusiones", "analizan", "datos", "los", "científicos"],
      correctOrder: ["los", "científicos", "analizan", "los", "datos", "y", "conclusiones"],
      hint: "Análisis científico",
    },
    {
      id: "3",
      words: ["el", "experimento", "un", "realizan", "laboratorio", "en", "estudiantes", "los"],
      correctOrder: ["los", "estudiantes", "realizan", "un", "experimento", "en", "el", "laboratorio"],
      hint: "Actividad práctica",
    },
  ],
}

export default function SyntaxGamePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [games, setGames] = useState<SyntaxGame[]>([])
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [totalGames, setTotalGames] = useState(0)

  useEffect(() => {
    const gameList = syntaxGames[gradeId] || syntaxGames["1"]
    setGames(gameList)
    setTotalGames(gameList.length)
  }, [gradeId])

  const currentGame = games[currentGameIndex]

  const handleWordClick = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word])
    }
  }

  const handleRemoveWord = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index))
  }

  const handleCheck = () => {
    const isCorrect = selectedWords.join(" ") === currentGame.correctOrder.join(" ")

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
    }

    if (currentGameIndex < games.length - 1) {
      setCurrentGameIndex(currentGameIndex + 1)
      setSelectedWords([])
    } else {
      // Save results and go to completion
      const studentId = localStorage.getItem("currentStudentId")
      if (studentId) {
        const gameResults = localStorage.getItem("gameResults")
        const results = gameResults ? JSON.parse(gameResults) : {}

        if (!results[studentId]) {
          results[studentId] = []
        }

        const lastResult = results[studentId][results[studentId].length - 1]
        if (lastResult && lastResult.grade === gradeId) {
          lastResult.syntaxAccuracy = Math.round((correctCount / totalGames) * 100)
        }

        localStorage.setItem("gameResults", JSON.stringify(results))
      }
      router.push(`/game/${gradeId}/completion`)
    }
  }

  if (!currentGame) {
    return <div>Cargando...</div>
  }

  const shuffledWords = [...currentGame.words].sort(() => Math.random() - 0.5)

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
            <h1 className="text-3xl font-bold text-orange-900">Estructura Sintáctica</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-orange-900">Progreso</p>
            <p className="text-2xl font-bold text-orange-600">
              {currentGameIndex + 1}/{totalGames}
            </p>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Hint */}
          <div className="mb-8 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
            <p className="text-gray-700 font-semibold">💡 Pista: {currentGame.hint}</p>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-gray-700 font-semibold">Ordena las palabras para formar una oración correcta.</p>
          </div>

          {/* Words to Select */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">Palabras disponibles:</p>
            <div className="flex flex-wrap gap-3">
              {shuffledWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleWordClick(word)}
                  disabled={selectedWords.includes(word)}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Words */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
            <p className="text-sm font-semibold text-gray-700 mb-3">Tu oración:</p>
            <div className="flex flex-wrap gap-2 min-h-12 items-center">
              {selectedWords.length === 0 ? (
                <p className="text-gray-400">Selecciona las palabras...</p>
              ) : (
                selectedWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleRemoveWord(index)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer transition-colors"
                  >
                    {word} ✕
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setSelectedWords([])}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Verificar
          </button>
        </div>
      </div>
    </main>
  )
}
