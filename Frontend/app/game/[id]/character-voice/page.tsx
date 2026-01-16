"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mic } from "lucide-react"
import { CameraInline } from "@/components/camera-inline"
import { Timer } from "@/components/timer"

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
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    const chars = characters[gradeId] || characters["2"]
    setCharacterList(chars)
  }, [gradeId])

  const handleSelectCharacter = (name: string) => {
    setSelectedCharacter(name)
    setAccuracy(0)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await analyzeEmotion(audioBlob)
        
        // Detener todos los tracks del stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error al acceder al micrófono:", error)
      alert("No se pudo acceder al micrófono. Por favor, permite el acceso al micrófono.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsAnalyzing(true)
    }
  }

  const analyzeEmotion = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('emotion', currentCharacter?.emotion || 'happy')

      const response = await fetch('http://localhost:3100/api/analyze-emotion', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al analizar la emoción')
      }

      const result = await response.json()
      setAccuracy(Math.round(result.accuracy))

      if (!completedCharacters?.includes(selectedCharacter)) {
        setCompletedCharacters([...completedCharacters, selectedCharacter])
      }
    } catch (error) {
      console.error("Error al analizar emoción:", error)
      alert("Error al analizar el audio. Asegúrate de que el servidor esté corriendo.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRecordCharacter = () => {
    if (selectedCharacter && !isRecording && !isAnalyzing) {
      startRecording()
    } else if (isRecording) {
      stopRecording()
    }
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

  const handleNext = async () => {
    const finalScore = accuracy
    await sendActividadResults(
      "Hablar como un personaje",
      finalScore,
      "Habla como un personaje",
      elapsed,
      new Date().toISOString()
    )
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
          <div className="flex flex-col items-end gap-2">
            <Timer onTimeUpdate={setElapsed} startTime={startTime} />
            <div className="text-right">
              <p className="text-lg font-semibold text-purple-900">Entonación</p>
              <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
            </div>
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
              <p className="text-xl font-semibold text-purple-900 italic mb-4">"{currentCharacter.example}"</p>
              
              <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm font-semibold text-blue-800 mb-2">💡 Tips para esta emoción:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {currentCharacter.emotion === 'happy' && (
                    <>
                      <li>• Habla con energía y entusiasmo</li>
                      <li>• Sube el tono de tu voz</li>
                      <li>• Habla más rápido de lo normal</li>
                    </>
                  )}
                  {currentCharacter.emotion === 'sad' && (
                    <>
                      <li>• Habla suavemente y despacio</li>
                      <li>• Baja el tono de tu voz</li>
                      <li>• Habla de forma monótona</li>
                    </>
                  )}
                  {currentCharacter.emotion === 'angry' && (
                    <>
                      <li>• Habla fuerte y con intensidad</li>
                      <li>• Varía mucho el tono de tu voz</li>
                      <li>• Habla rápido y con firmeza</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Recording Section */}
          {selectedCharacter && (
            <div className="mb-8 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="text-center text-gray-700 mb-4">
                Grábate diciendo la frase como el personaje que has seleccionado.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleRecordCharacter}
                  disabled={isAnalyzing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    isRecording 
                      ? "bg-red-500 hover:bg-red-600" 
                      : isAnalyzing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  } cursor-pointer disabled:cursor-not-allowed`}
                >
                  <Mic size={20} />
                  {isRecording ? "Detener grabación" : isAnalyzing ? "Analizando..." : "Grabar"}
                </button>
              </div>
            </div>
          )}

          {accuracy > 0 && (
            <div className={`border-2 rounded-lg p-4 mb-6 ${
              accuracy >= 80 ? 'bg-green-100 border-green-500' :
              accuracy >= 60 ? 'bg-yellow-100 border-yellow-500' :
              accuracy >= 40 ? 'bg-orange-100 border-orange-500' :
              'bg-red-100 border-red-500'
            }`}>
              <p className={`font-semibold text-center text-lg mb-2 ${
                accuracy >= 80 ? 'text-green-800' :
                accuracy >= 60 ? 'text-yellow-800' :
                accuracy >= 40 ? 'text-orange-800' :
                'text-red-800'
              }`}>
                Precisión: {accuracy}%
              </p>
              <p className={`text-center ${
                accuracy >= 80 ? 'text-green-700' :
                accuracy >= 60 ? 'text-yellow-700' :
                accuracy >= 40 ? 'text-orange-700' :
                'text-red-700'
              }`}>
                {accuracy >= 80 ? '¡Excelente! Capturaste muy bien la emoción' :
                 accuracy >= 60 ? 'Bien hecho, pero puedes ser más expresivo' :
                 accuracy >= 40 ? 'Intenta expresar más la emoción con tu voz' :
                 'Necesitas más expresividad. ¡Inténtalo de nuevo!'}
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
