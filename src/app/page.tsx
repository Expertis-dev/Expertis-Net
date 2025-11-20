"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useUser } from "@/Provider/UserProvider"
import { Activity } from "./dashboard/page"

export default function LoginPage() {
  const { setUser } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState({ usuario: "", password: "" })
  const safeSetLocalStorage = (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signIn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
    if (response.status === 200) {
      toast.success("Credenciales Correctas")
      const data = await response.json()
      const seed: Activity = {
        usuario: credentials.usuario,
        titulo: "Inicio de sesión",
        descripcion: "El usuario ha iniciado sesión en el sistema.",
        tiempo: new Date().toLocaleString(),
        estado: "completed",
      };
      setTimeout(() => {
        safeSetLocalStorage("actividadesRecientes", JSON.stringify([seed]))
        safeSetLocalStorage("isAuthenticated", "true")
        safeSetLocalStorage("token", data.token)
        safeSetLocalStorage("user", JSON.stringify(data.user))
        setUser(data.user)
        window.location.href = "/dashboard"
      }, 500)
    } else {
      toast.error("Credenciales incorrectas")
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full grid lg:grid-cols-2 gap-4 items-center"
      >
        {/* Formulario de Login */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mx-auto w-16 h-16 flex items-center justify-center"
              >
                <Image src="/icono-logo.png" alt="Logo" width={80} height={80} priority className="text-white w-full h-auto" />
              </motion.div>
              <CardTitle className="text-4xl font-bold text-[#001529] dark:text-white">ExpertisNet</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="space-y-2"
                >
                  <Label htmlFor="usuario" className="text-slate-700 dark:text-slate-300">
                    Usuario
                  </Label>
                  <Input
                    id="usuario"
                    type={"text"}
                    placeholder="Ingresa tu usuario"
                    value={credentials.usuario}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, usuario: e.target.value }))}
                    className="h-10 pr-12 focus:right-1 right-1  outline-none"
                    required
                    autoComplete="username"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={credentials.password}
                      onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                      className="h-10 pr-12 focus:right-1 right-1  outline-none"
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#001529] hover:bg-[#002040] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Imagen lateral */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden lg:block"
        >
          <div className="relative h-screen overflow-hidden shadow-2xl">
            <Image
              src="/IMAGEN-OPORTUNIDAD-UNETE.png"
              alt="Intranet Login"
              fill
              sizes="5xl"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#001529]/70" />
            {/* Contenedor centrado con flex */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-96 w-96">
                <Image
                  src="/LOGO-CENTRAL.png"
                  alt="Intranet Login"
                  fill
                  sizes="5xl"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  )
}
