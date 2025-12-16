import { DashboardLayout } from "@/components/dashboard-layout"
import { SocketProvider } from "@/Provider/SocketProvider"
export default function RootLayout({
    children,
}: {
    readonly children: React.ReactNode
}) {

    return (
        <SocketProvider>
            <DashboardLayout>
                <div>
                    {children}
                </div>
            </DashboardLayout>
        </SocketProvider>
    )
}
