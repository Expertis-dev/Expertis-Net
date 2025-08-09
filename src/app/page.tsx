"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"

// Usuarios de ejemplo
const users = {
  admin: { name: "Juan Pérez", idCargo: 1, password: "admin123" },
  supervisor: { name: "María García", idCargo: 2, password: "super123" },
  asesor: { name: "Carlos López", idCargo: 3, password: "asesor123" },
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular autenticación
    setTimeout(() => {
      const user = users[credentials.username as keyof typeof users]

      if (user && user.password === credentials.password) {
        // Guardar información en cookies
        document.cookie = `isAuthenticated=true; path=/; max-age=86400`
        document.cookie = `username=${credentials.username}; path=/; max-age=86400`
        document.cookie = `userName=${user.name}; path=/; max-age=86400`
        document.cookie = `userCargo=${user.idCargo}; path=/; max-age=86400`

        // También en localStorage para acceso rápido
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("username", credentials.username)
        localStorage.setItem("userName", user.name)
        localStorage.setItem("userCargo", user.idCargo.toString())

        window.location.href = "/dashboard"
      } else {
        alert("Credenciales incorrectas")
      }
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 items-center"
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
                <Image src="/icono-logo.png" alt="Logo" width={80} height={80} className="text-white w-full h-auto" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-[#001529] dark:text-white">ExpertisNet</CardTitle>
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
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
                    Usuario
                  </Label>
                  <Select
                    value={credentials.username}
                    onValueChange={(value) => setCredentials((prev) => ({ ...prev, username: value }))}
                  >
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin - Juan Pérez (Administrador)</SelectItem>
                      <SelectItem value="supervisor">supervisor - María García (Supervisor)</SelectItem>
                      <SelectItem value="asesor">asesor - Carlos López (Asesor)</SelectItem>
                    </SelectContent>
                  </Select>
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

              {/* Información de usuarios de prueba 
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">Usuarios de prueba:</p>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>• admin / admin123 (Administrador)</div>
                  <div>• supervisor / super123 (Supervisor)</div>
                  <div>• asesor / asesor123 (Asesor)</div>
                </div>
              </motion.div>*/}
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
          <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image src="/IMAGEN-OPORTUNIDAD-UNETE.png" alt="Intranet Login" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001529]/80 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Bienvenido</h2>
              <p className="text-lg opacity-90">Accede a tu panel de control empresarial</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
