"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

export function CameraView({ isOpen, onClose }) {
  const videoRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setHasPermission(true)
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
        console.error("Error al acceder a la cámara:", err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Tu Cámara</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-red-800 text-center">{error}</div>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
              {hasPermission && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  En vivo
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
