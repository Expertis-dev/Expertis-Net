import { DashboardLayout } from "@/components/dashboard-layout"
import { SocketProvider } from "@/Provider/SocketProvider"
import { Suspense } from "react"
import Loading from "./loading"
export default function RootLayout({
    children,
}: {
    readonly children: React.ReactNode
}) {

    return (
        <SocketProvider>
            <DashboardLayout>
                <div>
                    <Suspense fallback={<Loading/>}>
                        {children}
                    </Suspense>
                </div>
            </DashboardLayout>
        </SocketProvider>
    )
}
