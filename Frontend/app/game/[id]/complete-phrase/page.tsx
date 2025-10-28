"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mic } from "lucide-react"

const phrases: { [key: string]: { incomplete: string; examples: string[] } } = {
  "2": {
    incomplete: "La niña come...",
    examples: ["manzana", "pan", "fruta", "galletas"],
  },
}

export default function CompletePhraseGame() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [incompletePhrase, setIncompletePhrase] = useState("")
  const [examples, setExamples] = useState<string[]>([])
  const [selectedWord, setSelectedWord] = useState("")
  const [accuracy, setAccuracy] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    const phraseData = phrases[gradeId] || phrases["2"]
    setIncompletePhrase(phraseData.incomplete)
    setExamples(phraseData.examples)
  }, [gradeId])

  const handleSelectWord = (word: string) => {
    setSelectedWord(word)
    // Simular evaluación
    setAccuracy(85)
  }

  const handleNext = () => {
    const studentId = localStorage.getItem("currentStudentId")
    if (studentId) {
      const gameResults = localStorage.getItem("gameResults")
      const results = gameResults ? JSON.parse(gameResults) : {}

      if (!results[studentId]) {
        results[studentId] = []
      }

      results[studentId].push({
        grade: gradeId,
        gameType: "completePhrase",
        accuracy: accuracy,
        completedAt: new Date().toISOString(),
      })

      localStorage.setItem("gameResults", JSON.stringify(results))
    }
    router.push(`/game/${gradeId}/character-voice`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-pink-900">Completa con tu voz</h1>
            <p className="text-gray-600 mt-2">Termina la frase</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-pink-900">Precisión</p>
            <p className="text-2xl font-bold text-pink-600">{accuracy}%</p>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Incomplete Phrase */}
          <div className="mb-8 p-6 bg-pink-50 rounded-lg border-2 border-pink-200">
            <p className="text-2xl font-semibold text-center text-pink-900">{incompletePhrase}</p>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700">
              Selecciona la palabra que mejor completa la frase y luego grábate diciéndola.
            </p>
          </div>

          {/* Word Options */}
          <div className="mb-8">
            <p className="text-lg font-semibold text-gray-700 mb-4">Elige una palabra:</p>
            <div className="grid grid-cols-2 gap-4">
              {examples.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectWord(word)}
                  className={`p-4 rounded-lg font-semibold text-lg transition-all ${
                    selectedWord === word
                      ? "bg-pink-600 text-white border-2 border-pink-800"
                      : "bg-pink-100 text-pink-900 border-2 border-pink-300 hover:bg-pink-200"
                  } cursor-pointer`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Recording Section */}
          {selectedWord && (
            <div className="mb-8 p-6 bg-pink-50 rounded-lg border-2 border-pink-200">
              <p className="text-center text-gray-700 mb-4">
                Ahora grábate diciendo: "{incompletePhrase} <span className="font-bold">{selectedWord}</span>"
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-pink-600 hover:bg-pink-700"
                  } cursor-pointer`}
                >
                  <Mic size={20} />
                  {isRecording ? "Detener" : "Grabar"}
                </button>
              </div>
            </div>
          )}

          {accuracy > 0 && (
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold text-center">
                ¡Muy bien! Completaste correctamente con {accuracy}% de precisión
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setSelectedWord("")
              setAccuracy(0)
              setIsRecording(false)
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={handleNext}
            disabled={accuracy === 0}
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </main>
  )
}
