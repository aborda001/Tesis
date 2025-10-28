"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface SyllablePair {
  id: string
  image: string
  word: string
  syllables: string[]
}

const phonologicalGames: { [key: string]: SyllablePair[] } = {
  "1": [
    { id: "1", image: "🧼", word: "jabón", syllables: ["bón", "ja"] },
    { id: "2", image: "🏠", word: "casa", syllables: ["sa", "ca"] },
    { id: "3", image: "🥣", word: "sopa", syllables: ["pa", "so"] },
  ],
  "2": [
    { id: "1", image: "📚", word: "libro", syllables: ["bro", "li"] },
    { id: "2", image: "🌳", word: "árbol", syllables: ["bol", "ár"] },
    { id: "3", image: "🍎", word: "manzana", syllables: ["na", "man", "za"] },
  ],
  "3": [
    { id: "1", image: "🚗", word: "coche", syllables: ["che", "co"] },
    { id: "2", image: "🐕", word: "perro", syllables: ["rro", "pe"] },
    { id: "3", image: "🌸", word: "flor", syllables: ["flor"] },
  ],
  "4": [
    { id: "1", image: "🎓", word: "escuela", syllables: ["la", "es", "cue"] },
    { id: "2", image: "✏️", word: "lápiz", syllables: ["piz", "lá"] },
    { id: "3", image: "📖", word: "página", syllables: ["na", "pá", "gi"] },
  ],
  "5": [
    { id: "1", image: "💻", word: "computadora", syllables: ["ra", "com", "pu", "ta", "do"] },
    { id: "2", image: "📱", word: "teléfono", syllables: ["no", "te", "lé", "fo"] },
    { id: "3", image: "🎮", word: "videojuego", syllables: ["go", "vi", "deo", "jue"] },
  ],
  "6": [
    { id: "1", image: "🔬", word: "microscopio", syllables: ["pio", "mi", "cros", "co"] },
    { id: "2", image: "🌍", word: "geografía", syllables: ["fía", "geo", "gra"] },
    { id: "3", image: "⚗️", word: "química", syllables: ["ca", "quí", "mi"] },
  ],
}

export default function PhonologicalGamePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [games, setGames] = useState<SyllablePair[]>([])
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [totalGames, setTotalGames] = useState(0)

  useEffect(() => {
    const gameList = phonologicalGames[gradeId] || phonologicalGames["1"]
    setGames(gameList)
    setTotalGames(gameList.length)
  }, [gradeId])

  const currentGame = games[currentGameIndex]

  const handleSyllableClick = (syllable: string) => {
    if (!selectedSyllables.includes(syllable)) {
      setSelectedSyllables([...selectedSyllables, syllable])
    }
  }

  const handleRemoveSyllable = (index: number) => {
    setSelectedSyllables(selectedSyllables.filter((_, i) => i !== index))
  }

  const handleCheck = () => {
    const correctOrder = currentGame.syllables.sort((a, b) => {
      const wordIndex = currentGame.word.indexOf(a + b)
      const otherIndex = currentGame.word.indexOf(b + a)
      return wordIndex - otherIndex
    })

    const isCorrect = selectedSyllables.join("") === currentGame.word

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
    }

    if (currentGameIndex < games.length - 1) {
      setCurrentGameIndex(currentGameIndex + 1)
      setSelectedSyllables([])
    } else {
      // Save results and go to next game
      const studentId = localStorage.getItem("currentStudentId")
      if (studentId) {
        const gameResults = localStorage.getItem("gameResults")
        const results = gameResults ? JSON.parse(gameResults) : {}

        if (!results[studentId]) {
          results[studentId] = []
        }

        const lastResult = results[studentId][results[studentId].length - 1]
        if (lastResult && lastResult.grade === gradeId) {
          lastResult.phonologicalAccuracy = Math.round((correctCount / totalGames) * 100)
        }

        localStorage.setItem("gameResults", JSON.stringify(results))
      }
      router.push(`/game/${gradeId}/syntax`)
    }
  }

  if (!currentGame) {
    return <div>Cargando...</div>
  }

  const shuffledSyllables = [...currentGame.syllables].sort(() => Math.random() - 0.5)

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-purple-900">Conciencia Fonológica</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-purple-900">Progreso</p>
            <p className="text-2xl font-bold text-purple-600">
              {currentGameIndex + 1}/{totalGames}
            </p>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Image and Word */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{currentGame.image}</div>
            <p className="text-2xl font-bold text-gray-800">Palabra: {currentGame.word}</p>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
            <p className="text-gray-700 font-semibold">Ordena las sílabas para formar la palabra correctamente.</p>
          </div>

          {/* Syllables to Select */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">Sílabas disponibles:</p>
            <div className="flex flex-wrap gap-3">
              {shuffledSyllables.map((syllable, index) => (
                <button
                  key={index}
                  onClick={() => handleSyllableClick(syllable)}
                  disabled={selectedSyllables.includes(syllable)}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  {syllable}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Syllables */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
            <p className="text-sm font-semibold text-gray-700 mb-3">Tu respuesta:</p>
            <div className="flex flex-wrap gap-2 min-h-12 items-center">
              {selectedSyllables.length === 0 ? (
                <p className="text-gray-400">Selecciona las sílabas...</p>
              ) : (
                selectedSyllables.map((syllable, index) => (
                  <button
                    key={index}
                    onClick={() => handleRemoveSyllable(index)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer transition-colors"
                  >
                    {syllable} ✕
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setSelectedSyllables([])}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={handleCheck}
            disabled={selectedSyllables.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Verificar
          </button>
        </div>
      </div>
    </main>
  )
}
