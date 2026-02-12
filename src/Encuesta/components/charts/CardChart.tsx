import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface Props {
    title: string
    children: ReactNode
    className?: string
}

export const CardChart = ({
    title,
    children,
    className,
}: Props) => {
    return (
        <Card className={className ?? "w-full max-w-130"}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}
