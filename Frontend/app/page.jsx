"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/login-form";
import RegisterModal from "@/components/register-modal";

export default function LoginPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const router = useRouter();

  const handleLogin = async (userId) => {
    /* curl --location 'http://localhost:3100/api/alumnos?username=Alex' */
    const response = await fetch(`http://localhost:3100/api/alumnos/${userId}`);
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      localStorage.setItem("username", userId);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("userType", "student");
      localStorage.setItem("fullname", data.fullname);
      router.push("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const handleTeacherLogin = async (password, username) => {
    /* curl --location 'http://localhost:3000/api/docentes/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "admin",
    "password": "admin"
}' */

    const response = await fetch("http://localhost:3100/api/docentes/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("userType", "teacher");
      localStorage.setItem("access_token", data.token);
      router.push("/teacher/students");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <LoginForm
        onLogin={handleLogin}
        onTeacherLogin={handleTeacherLogin}
        onRegisterClick={() => setIsRegisterOpen(true)}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </main>
  );
}
