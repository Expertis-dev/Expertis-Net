"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Loading } from "@/components/Loading"

// Datos simulados para el dashboard
const dashboardData = {
  stats: [
    {
      title: "Justificaciones Pendientes",
      value: 12,
      change: "+2.5%",
      trend: "up",
      icon: FileText,
      color: "blue",
    },
    {
      title: "Vacaciones Aprobadas",
      value: 8,
      change: "+12.3%",
      trend: "up",
      icon: Calendar,
      color: "green",
    },
    {
      title: "Solicitudes del Mes",
      value: 24,
      change: "-5.2%",
      trend: "down",
      icon: Clock,
      color: "orange",
    },
    {
      title: "Asesores Activos",
      value: 156,
      change: "+8.1%",
      trend: "up",
      icon: Users,
      color: "purple",
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: "justification",
      title: "Justificación aprobada",
      description: "Juan Pérez - Cita médica",
      time: "Hace 2 horas",
      status: "approved",
    },
    {
      id: 2,
      type: "vacation",
      title: "Nueva solicitud de vacaciones",
      description: "María García - Del 15 al 20 de febrero",
      time: "Hace 4 horas",
      status: "pending",
    },
    {
      id: 3,
      type: "justification",
      title: "Justificación pendiente",
      description: "Carlos López - Permiso personal",
      time: "Hace 6 horas",
      status: "pending",
    },
    {
      id: 4,
      type: "vacation",
      title: "Vacaciones registradas",
      description: "Ana Martínez - Período completado",
      time: "Hace 1 día",
      status: "completed",
    },
  ],
  carouselSlides: [
    {
      id: 1,
      title: "Control de Vacaciones",
      subtitle: "Planificación simplificada",
      description: "Administra el tiempo libre de tu equipo sin complicaciones",
      gradient: "from-brand-secondary to-orange-600",
    },
    {
      id: 2,
      title: "Gestión de Justificaciones",
      subtitle: "Proceso automatizado",
      description: "Aprueba y gestiona justificaciones de manera eficiente",
      gradient: "from-brand-primary to-cyan-600",
    },
    {
      id: 3,
      title: "Reportes en Tiempo Real",
      subtitle: "Información actualizada",
      description: "Toma decisiones basadas en datos actualizados",
      gradient: "from-purple-500 to-indigo-600",
    },
  ],
}

export default function DashboardHome() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: "", cargo: "" })

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    if (!auth) {
      window.location.href = "/"
      return
    }
    setIsAuthenticated(true)

    // Obtener información del usuario
    const userName = localStorage.getItem("userName") || "Usuario"
    const userCargo = localStorage.getItem("userCargo") || "1"
    const cargoNames = {
      "1": "Administrador",
      "2": "Supervisor",
      "3": "Asesor",
    }

    setUserInfo({
      name: userName,
      cargo: cargoNames[userCargo as keyof typeof cargoNames] || "Usuario",
    })

    // Auto-advance carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dashboardData.carouselSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % dashboardData.carouselSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + dashboardData.carouselSlides.length) % dashboardData.carouselSlides.length)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatColor = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
      purple: "from-purple-500 to-purple-600",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white/80 dark:bg-slate-900 h-screen">
        <Loading/>
      </div>
    )
  }
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground mt-1">
              Bienvenido, {userInfo.name} • {userInfo.cargo}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Carousel Hero */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-[300px] md:h-[400px]">
              {dashboardData.carouselSlides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: index === currentSlide ? 1 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
                  style={{ display: index === currentSlide ? "block" : "none" }}
                >
                  <div className="flex items-center justify-center h-full text-white p-8">
                    <div className="text-center max-w-2xl">
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-5xl font-bold mb-4"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl font-medium mb-2 opacity-90"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-lg opacity-80"
                      >
                        {slide.description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Controles del carrusel */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {dashboardData.carouselSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            stat.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stat.trend === "up" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {stat.change}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getStatColor(stat.color)} flex items-center justify-center`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-muted-foreground">{activity.time}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}
