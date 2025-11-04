"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TeacherRegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.fullName.trim() || !formData.username.trim() || !formData.password.trim()) {
      alert("Por favor completa todos los campos")
      return
    }

    console.log("Registering teacher:", formData)

    fetch("http://localhost:3100/api/docentes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
      }),
    })
    .catch((error) => {
      console.error("Error registering alumno:", error);
    });


    setShowSuccess(true)

    setFormData({
      fullName: "",
      username: "",
      password: "",
    })

    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-2xl max-w-md w-full p-8">
        {/* Icono de pizarra */}
        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 100 100" className="w-20 h-20" xmlns="http://www.w3.org/2000/svg">
            {/* Pizarra */}
            <rect x="10" y="15" width="80" height="60" rx="3" fill="#2D3E50" />

            {/* Marco de madera */}
            <rect x="5" y="10" width="90" height="70" rx="5" fill="none" stroke="#8B4513" strokeWidth="3" />

            {/* Tiza blanca - líneas */}
            <line x1="20" y1="30" x2="70" y2="30" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="20" y1="40" x2="75" y2="40" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="20" y1="50" x2="70" y2="50" stroke="#FFFFFF" strokeWidth="2" />

            {/* Borrador */}
            <rect x="75" y="20" width="15" height="20" fill="#FF6B6B" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Registro
          <br />
          de Docentes
        </h2>

        {!showSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="fullName"
              placeholder="Nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />

            <Input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />

            <Input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />

            <Button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6"
            >
              Registrar docente
            </Button>

            <Button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-400 rounded-full p-4 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-semibold text-center">Docente registrado con éxito</p>
          </div>
        )}
      </div>
    </div>
  )
}
