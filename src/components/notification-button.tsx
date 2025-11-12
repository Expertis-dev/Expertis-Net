"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { toast } from "sonner"

export function NotificationButton() {
  const [hasNotifications] = useState(true)

  const handleNotificationClick = () => {
    toast.success("¡Tienes 3 notificaciones nuevas!", {
      description: "Haz clic para ver todas las notificaciones",
      action: {
        label: "Ver todas",
        onClick: () =>,
      },
    })
  }

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
      <Bell className="h-5 w-5" />
      {hasNotifications && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />}
    </Button>
  )
}
