"use client"

import { useEffect, useState } from "react"
import type { ComponentType, SVGProps } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  User,
  ChartNoAxesCombined,
} from "lucide-react"
import { Loading } from "@/components/Loading"
import { useUser } from "@/Provider/UserProvider"
import { ListaColaboradores } from "@/services/ListaColaboradores"
import { getRolFromStorage } from "@/components/dashboard-layout"
export type Activity = {
  usuario: string
  titulo: string
  descripcion: string
  tiempo: string
  estado: "approved" | "completed" | "pending" | "error"
}
type StatItem = {
  title: string
  value: number | string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  color: "blue" | "green" | "orange" | "purple"
}
const getStatColor = (color: string) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  }
  return (colors as Record<string, string>)[color] || colors.blue
}
const carouselImages: { id: number; src: string; alt?: string }[] = [
  { id: 1, src: "/imagen5.webp", alt: "Slide 1" },
  { id: 2, src: "/imagen1.jpg", alt: "Slide 2" },
  { id: 3, src: "/imagen3.jpg", alt: "Slide 3" },  
  { id: 4, src: "/imagen2.jpg", alt: "Slide 4" },
]
export default function DashboardHome() {
  const { user } = useUser()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [actividadesRecientes, setActividadesRecientes] = useState<Activity[]>([])
  const [info, setInfo] = useState<StatItem[] | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    if (!auth) {
      globalThis.location.href = "/"
      return
    }

    const ObtenerInfo = async () => {
      try {
        const idColaboradores = await ListaColaboradores(user?.usuario)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/indicadoresHome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lista: idColaboradores,
            grupo: user?.usuario?.split(" ")[0],
          }),
        })
        const data = await response.json()

        setInfo([
          { title: `Número de ${user?.idJefe === user?.idEmpleado ? "Colaboradores" : "Asesores"}`, value: data.numAsesores, icon: User, color: "green" },
          { title: "Número de Justificaciones", value: data.cantidadJustificacionesEquipo, icon: ChartNoAxesCombined, color: "blue" },
          { title: "Justificaciones en Revisión", value: data.justificacionesEnRevision, icon: FileText, color: "orange" },
        ])
      } catch (e) {
        console.error(e)
        setInfo(null)
      }
    }

    setIsAuthenticated(true)

    // Auto-advance carousel (cada 5s)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)

    const raw = localStorage.getItem("actividadesRecientes")
    setActividadesRecientes(raw ? JSON.parse(raw) : [])

    ObtenerInfo()
    return () => clearInterval(interval)
  }, [user])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (!isAuthenticated || info === null) {
    return (
      <div className="h-[72vh] -translate-x-10">
        <Loading />
      </div>
    )
  }

  return (
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
              Bienvenido, {user?.usuario} • {getRolFromStorage()}
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
        {/* Carrusel de Imágenes */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-[300px] md:h-[400px]">
              {carouselImages.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index === currentSlide ? 1 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                  style={{ display: index === currentSlide ? "block" : "none" }}
                >
                  {/* Imagen full-bleed */}
                  <div className="absolute inset-0">
                    <Image
                      src={slide.src}
                      alt={slide.alt || `Slide ${slide.id}`}
                      fill
                      priority={index === 0}
                      sizes=""
                      className="object-contain"
                    //className="object-cover w-full h-full"
                    />
                    {/* Overlay sutil para legibilidad de controles */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
                  </div>
                </motion.div>
              ))}

              {/* Controles */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/40 text-white backdrop-blur-sm"
                onClick={prevSlide}
                aria-label="Anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/40 text-white backdrop-blur-sm"
                onClick={nextSlide}
                aria-label="Siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Ir al slide ${index + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white" : "bg-white/50"
                      }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas (cards rediseñadas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {info?.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <div className="relative rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800">
                <Card className="rounded-2xl border-0 bg-white/70 dark:bg-neutral-800 backdrop-blur supports-[backdrop-filter]:bg-white/40">
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {/* Icono en badge con gradiente */}
                      <div
                        className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getStatColor(
                          stat.color
                        )} flex items-center justify-center shadow-sm`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Texto y valor */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-3xl font-bold tracking-tight text-foreground">
                            {stat.value}
                          </span>
                        </div>
                      </div>

                      {/* Acento decorativo */}
                      <div className="hidden md:block">
                        <div className="h-10 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
              {actividadesRecientes.map((activity, index) => (
                <motion.div
                  key={`${activity.estado}-${activity.titulo}-${activity.tiempo}-${index}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0">{getStatusIcon(activity.estado)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{activity.titulo}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.descripcion}</p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-muted-foreground">{activity.tiempo}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
  )
}
