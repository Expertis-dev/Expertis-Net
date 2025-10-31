"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { Justificaciones } from "../types/Justificaciones"
import { InboxOutlined, UploadOutlined } from "@ant-design/icons"
import { Upload, UploadFile, Image } from "antd"
import type { UploadProps } from "antd"
import type { RcFile } from "antd/es/upload"
import { toast } from "sonner"
import { LoadingModal } from "./loading-modal"

interface UploadProofModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly justification: Justificaciones | null
}

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

export function UploadProofModal({ isOpen, onClose, justification }: UploadProofModalProps) {
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState("")

  const beforeUpload = (file: RcFile) => {
    console.log(file)
    const isImage = file.type.startsWith("image/")
    console.log(file)
    if (fileList.length === 4) {
      toast.error("Solo se permiten 4 imágenes")
      return Upload.LIST_IGNORE
    }
    if (!isImage) {
      toast.error("Solo se permiten imágenes")
      return Upload.LIST_IGNORE
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      toast.error("La imagen debe ser menor a 2MB")
      return Upload.LIST_IGNORE
    }
    return true
  }

  const handleChange: UploadProps["onChange"] = ({ fileList }) => {
    setFileList(fileList)
  }

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleUpload = async () => {
    if (fileList.length === 0) return
    console.log("Subiendo archivos:", fileList)
    setUploading(true)
    try {
      const uploadPromises = fileList.map(async (file) => {
        if (!file.originFileObj) {
          throw new Error("Missing file object")
        }
        const formData = new FormData();
        formData.append("file", file.originFileObj as Blob);
        formData.append("upload_preset", "zjilxjgo");
        formData.append("api_key", "348638695531547");
        formData.append("folder", "EXPERTIS");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        return data.secure_url;
      });
      const urls = await Promise.all(uploadPromises);
      console.log("URLs de las imágenes subidas:", urls);
      try {
        for (const url of urls) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crearPruebaaaa`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_justificacion: justification?.id, urlPrueba: url }),
          });
          if (response.status === 200) {
            console.log("Prueba guardada con éxito:", url);
            setUploading(false)
            toast.success("Imágenes subidas con éxito")
            setFileList([])
            onClose()
          } else {
            toast.error("Error al guardar las imágenes. Inténtalo de nuevo.")
            setUploading(false)
          }
        }
      } catch (error) {
        console.log("Error al guardar archivos:", error)
        toast.error("Error al guardar las imágenes. Inténtalo de nuevo.")
        setUploading(false)
      }
      setUploading(false)
    } catch (error) {
      console.log("Error al subir archivos:", error)
      toast.error("Error al subir las imágenes. Inténtalo de nuevo.")
      setUploading(false)
    }
  }

  if (!justification) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl"
          >
            <Card className="max-h-[98vh] overflow-y-auto ">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UploadOutlined className="h-5 w-5" />
                  Cargar Pruebas - {justification.asesor}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label>Seleccionar Imágenes</Label>
                  <Upload.Dragger
                    accept="image/*"
                    listType="picture"
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    onPreview={handlePreview}
                    multiple
                    maxCount={4}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="dark:text-neutral-100">Haga clic o arrastre imágenes aquí</p>
                    <p className="dark:text-neutral-400">Máximo 4 imágenes, tamaño menor a 2MB</p>
                  </Upload.Dragger>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[#0e1924] hover:bg-[#002040] dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                    onClick={handleUpload}
                    disabled={uploading || fileList.length === 0}
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
                    {uploading ? "Subiendo..." : "Subir Imágenes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Modal de preview real */}
            {previewImage && (
              <Image
                wrapperStyle={{ display: "none" }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(""),
                }}
                src={previewImage}
                width={200}
                height={200}
                alt="IMAGENES DE PRUEBA"
                className="object-cover rounded-lg"
              />
            )}
          </motion.div>
          <LoadingModal isOpen={uploading} message="Subiendo Imagenes..." />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
