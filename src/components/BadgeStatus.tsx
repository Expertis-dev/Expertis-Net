import { Badge } from './ui/badge'

export const BadgeStatus = ({ estado }: { estado: string }) => {
    switch (estado) {
        case "PERMISO":
        case "APROBADO":
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">{estado}</Badge>
        case "TARDANZA":
        case "PENDIENTE":
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">{estado}</Badge>
        case "FALTA":
        case "RECHAZADO":
            return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">{estado}</Badge>
        default:
            return <Badge variant="secondary">{estado}</Badge>
    }
}