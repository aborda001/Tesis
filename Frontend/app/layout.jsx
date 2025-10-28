import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Login App",
  description: "Aplicación de login con registro de alumnos",
  generator: "",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
