"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useUser } from "@/Provider/UserProvider"
import { CargarActividad } from "@/services/CargarActividad"
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import { Upload, UploadFile, message } from "antd"
import type { UploadProps } from "antd"
import { motion } from 'framer-motion'
import { useState } from "react"

export default function CargaMasiva() {
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [uploading, setUploading] = useState(false)
    const { user } = useUser()
    // ✅ Maneja los cambios en el dragger
    const handleChange: UploadProps["onChange"] = (info) => {
        let files = [...info.fileList]
        // Solo permitimos un archivo
        files = files.slice(-1)
        // ✅ Aceptamos tipos válidos de Excel
        files = files.filter(
            file =>
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel" ||
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xls")
        )
        setFileList(files)
    }

    // ✅ Simula la subida al backend
    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning("Selecciona un archivo antes de subirlo")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append("file", fileList[0].originFileObj as Blob)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/justificaciones/actualizarDatos`, {
                method: "POST",
                body: formData,
            })
            if (!response.ok) throw new Error("Error al subir archivo")
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "Actualizo en carga masiva",
                descripcion: `Se actualizo la carga de los asesores y supervisores con la nueva plantilla`,
                estado: "completed",
            })
            message.success("Archivo subido correctamente 🎉")
            setFileList([])
        } catch (error) {
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "No se pudo actualizar en carga masiva",
                descripcion: `Se intento actualizar la carga de los asesores y supervisores con la nueva plantilla`,
                estado: "error",
            })
            console.error(error)
            message.error("Ocurrió un error al subir el archivo")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex items-center justify-center">
            <Card className="w-3xl overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <UploadOutlined className="h-5 w-5" />
                        Cargar Plantilla
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                    <div className="space-y-2">
                        <Label>Seleccionar documento</Label>

                        <Upload.Dragger
                            accept=".xlsx,.xls"
                            listType="text"
                            fileList={fileList}
                            multiple={false}
                            maxCount={1}
                            beforeUpload={() => false} // evita que suba automáticamente
                            onChange={handleChange}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="dark:text-neutral-100">Haga clic o arrastre el archivo aquí</p>
                            <p className="dark:text-neutral-400">Máximo 1 archivo, formato Excel (.xlsx o .xls), menor a 2MB</p>
                        </Upload.Dragger>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={handleUpload}
                            disabled={uploading || fileList.length === 0}
                            className="flex-1 bg-[#0e1924] hover:bg-[#002040] dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                        >
                            {uploading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                />
                            ) : (
                                <UploadOutlined className="h-4 w-4 mr-2" />
                            )}
                            {uploading ? "Subiendo..." : "Subir archivo"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
