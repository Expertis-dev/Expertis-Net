import { Inter } from "next/font/google"
import { DashboardLayout } from "@/components/dashboard-layout"
const inter = Inter({ subsets: ["latin"] })
export default function RootLayout({
    children,
}: {
    readonly children: React.ReactNode
}) {
    return (
        <DashboardLayout>
            <div className={inter.className}>
                {children}
            </div>
        </DashboardLayout>
    )
}
