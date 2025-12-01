"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Timer } from "@/components/timer"

interface ConnectorQuestion {
  id: string
  phrase1: string
  phrase2: string
  correctConnector: string
  options: string[]
}

const sendActividadResults = async (descripcion: any, puntaje: any, actividad: any, tiempo: any, fecha: any) => {
  const studentId = localStorage.getItem("userId")
  console.log("Student ID:", studentId)
  console.log("Datos a enviar", {
    actividad,
    descripcion,
    puntaje,
    alumnoId: studentId,
    tiempo,
    fecha
  })

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
        fecha
      }),
    }).then(async (res) => {
      if (!res.ok) {
        console.error("Error al enviar los resultados de la actividad")
      }
      console.log("Resultados de la actividad enviados correctamente:", await res.json())
    })
  }
}

const connectorGames: { [key: string]: ConnectorQuestion[] } = {
  "3": [
    {
      id: "1",
      phrase1: "Pedro fue al parque",
      phrase2: "estaba con ganas de jugar",
      correctConnector: "porque",
      options: ["porque", "y", "para"],
    },
    {
      id: "2",
      phrase1: "María come manzana",
      phrase2: "bebe agua",
      correctConnector: "y",
      options: ["porque", "y", "para"],
    },
    {
      id: "3",
      phrase1: "Nosotros estudiamos",
      phrase2: "aprender más",
      correctConnector: "para",
      options: ["porque", "y", "para"],
    },
    {
      id: "4",
      phrase1: "No iremos al parque",
      phrase2: "llueve mucho",
      correctConnector: "porque",
      options: ["porque", "y", "para"],
    },
    { id: "5", phrase1: "Ella juega", phrase2: "se divierte", correctConnector: "y", options: ["porque", "y", "para"] },
  ],
}

export default function ConnectorsGamePage() {
  const router = useRouter()
  const params = useParams()
  const gradeId = params.id as string

  const [games, setGames] = useState<ConnectorQuestion[]>([])
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [correctCount, setCorrectCount] = useState(0)
  const [totalGames, setTotalGames] = useState(0)
  const [message, setMessage] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const gameList = connectorGames[gradeId] || connectorGames["3"]
    setGames(gameList)
    setTotalGames(gameList.length)
  }, [gradeId])

const currentGame = games[currentGameIndex]

// 🔹 Inicializa con un array vacío
const [shuffledOptions, setShuffledOptions] = useState<string[]>([])

useEffect(() => {
  // 🔹 Solo se ejecuta cuando currentGame está definido
  if (currentGame) {
    setShuffledOptions([...currentGame.options].sort(() => Math.random() - 0.5))
  }
}, [currentGameIndex, games])



  const handleSelectConnector = (connector: string) => {
    if (selectedOption === "") {
      setSelectedOption(connector)
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (connector === currentGame.correctConnector) {
        const newCorrectCount = correctCount + 1
        setCorrectCount(newCorrectCount)
        setMessage("¡Correcto! 🎉")
        setTimeout(() => {
          if (currentGameIndex < games.length - 1) {
            setCurrentGameIndex(currentGameIndex + 1)
            setSelectedOption("")
            setMessage("")
          } else {
            handleComplete(newCorrectCount, newAttempts)
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

  const handleComplete = (finalCorrectCount: number, totalAttempts: number) => {
    const finalScore = Math.round((finalCorrectCount / totalAttempts) * 100)
    
    sendActividadResults(
      `Juego de conectores completado con ${finalCorrectCount}/${totalGames} respuestas correctas en ${totalAttempts} intentos`,
      finalScore,
      "Conectores",
      elapsed,
      new Date().toISOString()
    )
    
    router.push(`/game/${gradeId}/syntax`)
  }

  if (!currentGame) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-8">
      <p className="text-xl font-semibold text-orange-800">Cargando juego...</p>
    </main>
  )
}


  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-semibold"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-900">Conectores</h1>
            <p className="text-gray-600 mt-2">Grado {gradeId}</p>
          </div>
          <Timer onTimeUpdate={setElapsed} startTime={startTime} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-8">
            <p className="text-xl font-bold text-orange-900 mb-4">
              Pregunta {currentGameIndex + 1} de {totalGames}
            </p>

            <div className="mb-6">
              <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300 mb-4">
                <p className="text-xl font-semibold text-gray-800">{currentGame.phrase1}  _______  {currentGame.phrase2}</p>
              </div>
            </div>

            <p className="text-lg font-semibold text-gray-700 mb-4 text-center">¿Cuál es el conector correcto?</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {shuffledOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectConnector(option)}
                  disabled={selectedOption !== ""}
                  className={`p-4 rounded-lg font-semibold text-lg transition-colors cursor-pointer ${
                    selectedOption === option
                      ? option === currentGame.correctConnector
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-orange-200 hover:bg-orange-300 text-gray-800"
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
                <span className="font-bold text-orange-600">
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
