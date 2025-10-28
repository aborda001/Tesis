"use client"

import { useEffect, useRef, useState } from "react"

export function CameraInline() {
  const videoRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
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
        tracks.forEach((track:any) => track.stop())
      }
    }
  }, [])

  if (error) {
    return <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-red-800 text-center">{error}</div>
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-md mx-auto mb-8">
      <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
      {hasPermission && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          En vivo
        </div>
      )}
    </div>
  )
}
