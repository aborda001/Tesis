"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mic } from "lucide-react"
import { CameraInline } from "@/components/camera-inline"

const characters: { [key: string]: { name: string; emotion: string; example: string }[] } = {
  "2": [
    { name: "Feliz", emotion: "happy", example: "¡Qué día tan hermoso!" },
    { name: "Triste", emotion: "sad", example: "No quiero irme..." },
    { name: "Enojado", emotion: "angry", example: "¡Eso no es justo!" },
  ],
}

export default function CharacterVoicePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [characterList, setCharacterList] = useState<(typeof characters)["2"]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<string>("null")
  const [isRecording, setIsRecording] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [completedCharacters, setCompletedCharacters] = useState<string[]>([])

  useEffect(() => {
    const chars = characters[gradeId] || characters["2"]
    setCharacterList(chars)
  }, [gradeId])

  const handleSelectCharacter = (name: string) => {
    setSelectedCharacter(name)
    setAccuracy(0)
  }

  const handleRecordCharacter = () => {
    if (selectedCharacter && !isRecording) {
      setIsRecording(true)
    } else if (isRecording) {
      setIsRecording(false)
      // Simular evaluación
      const simulatedAccuracy = Math.floor(Math.random() * 30) + 70
      setAccuracy(simulatedAccuracy)

      if (!completedCharacters?.includes(selectedCharacter)) {
        setCompletedCharacters([...completedCharacters, selectedCharacter])
      }
    }
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
        gameType: "characterVoice",
        accuracy: accuracy,
        completedAt: new Date().toISOString(),
      })

      localStorage.setItem("gameResults", JSON.stringify(results))
    }
    router.push(`/game/${gradeId}/completion`)
  }

  const currentCharacter = characterList.find((c) => c.name === selectedCharacter)

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
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
            <h1 className="text-3xl font-bold text-purple-900">Habla como un personaje</h1>
            <p className="text-gray-600 mt-2">Imita diferentes emociones</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-purple-900">Entonación</p>
            <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <CameraInline />
          {/* Instructions */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700">
              Selecciona un personaje y grábate imitando su emoción. Trabaja tu entonación y expresividad.
            </p>
          </div>

          {/* Character Selection */}
          <div className="mb-8">
            <p className="text-lg font-semibold text-gray-700 mb-4">Elige un personaje:</p>
            <div className="grid grid-cols-3 gap-4">
              {characterList.map((character, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectCharacter(character.name)}
                  className={`p-4 rounded-lg font-semibold text-lg transition-all ${
                    selectedCharacter === character.name
                      ? "bg-purple-600 text-white border-2 border-purple-800"
                      : "bg-purple-100 text-purple-900 border-2 border-purple-300 hover:bg-purple-200"
                  } cursor-pointer`}
                >
                  {character.name}
                  {completedCharacters.includes(character.name) && <span className="ml-2">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Character Example */}
          {currentCharacter && (
            <div className="mb-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Ejemplo de {currentCharacter.name.toLowerCase()}:</p>
              <p className="text-xl font-semibold text-purple-900 italic">"{currentCharacter.example}"</p>
            </div>
          )}

          {/* Recording Section */}
          {selectedCharacter && (
            <div className="mb-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="text-center text-gray-700 mb-4">
                Grábate diciendo la frase como si fueras {selectedCharacter.toLowerCase()}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleRecordCharacter}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"
                  } cursor-pointer`}
                >
                  <Mic size={20} />
                  {isRecording ? "Detener grabación" : "Grabar"}
                </button>
              </div>
            </div>
          )}

          {accuracy > 0 && (
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold text-center">
                ¡Excelente entonación!
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setSelectedCharacter("null")
              setAccuracy(0)
              setIsRecording(false)
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={handleNext}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </main>
  )
}
