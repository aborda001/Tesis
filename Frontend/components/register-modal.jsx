"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "react-day-picker";

export default function RegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "",
    docenteId: "",
    userId: "",
    age: 1,
    grade: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [docentesList, setDocentesList] = useState([]);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const response = await fetch("http://localhost:3100/api/docentes");
        if (response.ok) {
          const data = await response.json();
          setDocentesList(data);
        }
      } catch (error) {
        console.error("Error fetching docentes:", error);
      }
    };

    fetchDocentes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.docenteId.trim() ||
      !formData.userId.trim() ||
      !formData.age.trim() ||
      !formData.grade.trim()
    ) {
      alert("Por favor completa todos los campos");
      return;
    }

    setShowSuccess(true);

    /* curl --location 'http://localhost:3100/api/alumnos' \
--header 'Content-Type: application/json' \
--data '{
    "username": "Alex2",
    "docenteId": "68fa33f7a6e9c19f2df62ec4"
}' */

    fetch("http://localhost:3100/api/alumnos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname: formData.fullName,
        username: formData.userId,
        docenteId: formData.docenteId,
        age: formData.age,
        grade: formData.grade,
      }),
    }).catch((error) => {
      console.error("Error registering alumno:", error);
    });

    setFormData({
      fullName: "",
      docenteId: "",
      userId: "",
    });

    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl shadow-2xl max-w-md w-full p-8">
        {/* Icono de libros */}
        <div className="flex justify-center mb-6">
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Libro naranja */}
            <rect x="20" y="30" width="35" height="40" rx="3" fill="#FF8C42" />
            <rect x="20" y="30" width="35" height="8" fill="#FF6B1A" />

            {/* Libro azul */}
            <rect x="45" y="45" width="35" height="40" rx="3" fill="#4A90E2" />
            <rect x="45" y="45" width="35" height="8" fill="#2E5C8A" />

            {/* Hoja verde */}
            <circle cx="65" cy="20" r="12" fill="#4CAF50" />
            <path
              d="M 65 8 Q 70 15 65 22"
              stroke="#2E7D32"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Registro
          <br />
          de Alumnos
        </h2>

        {!showSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="fullName"
              placeholder="Nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />

            <Select
              name="docenteId"
              value={formData.docenteId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
            >
              <option value="">Seleccionar Docente</option>
              {docentesList.map((docente) => (
                <option key={docente._id} value={docente._id}>
                  {docente.username}
                </option>
              ))}
            </Select>

            <Input
              type="text"
              name="userId"
              placeholder="ID de usuario"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />

            <Input
              type="number"
              name="age"
              placeholder="Edad"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
            
            <Input
              type="text"
              name="grade"
              placeholder="Grado"
              value={formData.grade}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6"
            >
              Guardar alumno
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
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-600 font-semibold text-center">
              Alumno registrado con éxito
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
