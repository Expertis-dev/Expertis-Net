import { DashboardLayout } from '@/components/dashboard-layout'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Toaster } from 'sonner'
const inter = Inter({ subsets: ["latin"] })

export default function NotFound() {
    console.log(inter.className)
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="text-center space-y-6">
                    {/* 404 Title */}
                    <div className="space-y-2">
                        <h1 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                            404
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                            Página no encontrada
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                        Lo sentimos, la página que buscas no existe o ha sido movida. Intenta regresar al inicio.
                    </p>

                    {/* Button */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition transform hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al inicio
                    </Link>
                </div>
                <Toaster position="top-right" richColors theme="system" />
            </div>
        </DashboardLayout>
    )
}
