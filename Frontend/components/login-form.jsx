"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginForm({ onLogin, onTeacherLogin, onRegisterClick, onTeacherRegisterClick }) {
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const [isTeacherMode, setIsTeacherMode] = useState(false)
  const [teacherPassword, setTeacherPassword] = useState("")
  const [teacherusername, setTeacherusername] = useState("")

  const handleStudentSubmit = (e) => {
    e.preventDefault()

    if (!userId.trim()) {
      setError("Por favor ingresa tu ID de usuario")
      return
    }

    setError("")
    localStorage.setItem("currentStudentId", userId)
    onLogin(userId)
  }

  const handleTeacherSubmit = (e) => {
    e.preventDefault()

    if (!teacherPassword.trim() ) {
      setError("Por favor ingresa la contraseña de docente")
      return
    }

    if (!teacherusername.trim()) {
      setError("Por favor ingresa el nombre de usuario de docente")
      return
    }

    setError("")
    onTeacherLogin(teacherPassword, teacherusername)
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
        {/* Lado izquierdo - Ilustración */}
        <div className="flex items-center justify-center">
          <div className="relative w-full h-64 md:h-80">
            <svg viewBox="0 0 300 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Nubes */}
              <ellipse cx="80" cy="60" rx="35" ry="25" fill="#FFE5B4" opacity="0.7" />
              <ellipse cx="240" cy="80" rx="40" ry="28" fill="#FFE5B4" opacity="0.7" />

              {/* Estrellas */}
              <circle cx="150" cy="50" r="4" fill="#FFD700" />
              <circle cx="170" cy="70" r="3" fill="#FFD700" />

              {/* Cabeza */}
              <circle cx="120" cy="140" r="35" fill="#F4A460" />

              {/* Cabello */}
              <path d="M 85 140 Q 85 105 120 105 Q 155 105 155 140" fill="#8B4513" />
              <circle cx="95" cy="110" r="8" fill="#8B4513" />
              <circle cx="145" cy="110" r="8" fill="#8B4513" />

              {/* Cara */}
              <circle cx="110" cy="135" r="5" fill="#000" />
              <circle cx="130" cy="135" r="5" fill="#000" />
              <path d="M 120 150 Q 120 155 125 155" stroke="#000" strokeWidth="2" fill="none" />
              <path d="M 115 160 Q 120 165 125 160" stroke="#FF6B6B" strokeWidth="2" fill="none" />

              {/* Cuerpo */}
              <rect x="95" y="175" width="50" height="60" rx="5" fill="#FF6B6B" />

              {/* Brazos */}
              <rect x="50" y="185" width="45" height="20" rx="10" fill="#F4A460" />
              <rect x="205" y="185" width="45" height="20" rx="10" fill="#F4A460" />

              {/* Mano levantada */}
              <circle cx="45" cy="175" r="12" fill="#F4A460" />
              <path d="M 40 165 L 35 155 M 45 165 L 45 150 M 50 165 L 55 150" stroke="#F4A460" strokeWidth="3" />

              {/* Piernas */}
              <rect x="105" y="235" width="12" height="40" fill="#333" />
              <rect x="123" y="235" width="12" height="40" fill="#333" />

              {/* Zapatos */}
              <ellipse cx="111" cy="280" rx="10" ry="8" fill="#000" />
              <ellipse cx="129" cy="280" rx="10" ry="8" fill="#000" />
            </svg>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center md:text-left">
            {isTeacherMode ? "Acceso Docente" : "Iniciar Sesión"}
          </h1>

          <form onSubmit={isTeacherMode ? handleTeacherSubmit : handleStudentSubmit} className="space-y-6">
            {!isTeacherMode ? (
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                  ID de usuario
                </label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Ingresa tu ID de usuario"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    setError("")
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            ) : (
              <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <Input
                  id="username"
                  type="username"
                  placeholder="Ingresa la usuario"
                  value={teacherusername}
                  onChange={(e) => {
                    setTeacherusername(e.target.value)
                    setError("")
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={teacherPassword}
                  onChange={(e) => {
                    setTeacherPassword(e.target.value)
                    setError("")
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isTeacherMode ? "Acceder como Docente" : "Ingresar"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            {!isTeacherMode ? (
              <>
                <p className="text-gray-600">
                  ¿No tienes un ID?{" "}
                  <button
                    onClick={onRegisterClick}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Regístrate aquí
                  </button>
                </p>
                <p className="text-gray-600">
                  ¿Eres un docente?{" "}
                  <button
                    onClick={() => {
                      setIsTeacherMode(true)
                      setError("")
                      setTeacherPassword("")
                    }}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Acceder aquí
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600">
                  ¿No estás registrado?{" "}
                  <button
                    onClick={onTeacherRegisterClick}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Regístrate aquí
                  </button>
                </p>
                <p className="text-gray-600">
                  <button
                    onClick={() => {
                      setIsTeacherMode(false)
                      setError("")
                      setTeacherPassword("")
                    }}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Volver a alumno
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
