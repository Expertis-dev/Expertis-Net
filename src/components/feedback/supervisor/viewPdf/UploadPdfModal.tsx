import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react'

interface Props {
    setIsUploadModalOpen: Dispatch<SetStateAction<boolean>>,
    isUploadModalOpen: boolean,
    idFeedback: number
}

export const UploadPdfModal = ({
    setIsUploadModalOpen,
    isUploadModalOpen,
    idFeedback
}: Props) => {
    const router = useRouter()
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const processSelectedFile = (file: File | null) => {
        if (!file) return;
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            setSelectedPdf(null);
            setUploadError("Solo se permite un archivo PDF.");
            return;
        }
        setUploadError("");
        setSelectedPdf(file);
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        processSelectedFile(file);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        processSelectedFile(file);
    };

    const handleConfirmUpload = async () => {
        if (!selectedPdf) return;
        if (isUploading) return;
        const formData = new FormData()
        formData.append('file', selectedPdf);

        setIsUploading(true);
        setUploadError("");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/supervisor/fbFirmado/${idFeedback}`, {
                method: "PUT",
                body: formData
            })
            if (!response.ok) {
                throw new Error("Error al subir el PDF.");
            }
            setIsUploadModalOpen(false);
            setSelectedPdf(null);
            setUploadError("");
        } catch {
            setUploadError("Error al subir el PDF.");
        } finally {
            setIsUploading(false);
            router.refresh()
        }
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
        setIsDragging(false);
        setSelectedPdf(null);
        setUploadError("");
    };
    return (
        <Dialog
            open={isUploadModalOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleCloseUploadModal();
                    return;
                }
                setIsUploadModalOpen(true);
            }}
        >
            <DialogContent className="sm:max-w-2xl w-auto">
                <DialogHeader>
                    <DialogTitle>Subir PDF firmado</DialogTitle>
                    <DialogDescription>
                        Arrastra un archivo PDF o haz clic para seleccionarlo.
                    </DialogDescription>
                </DialogHeader>

                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => inputFileRef.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            inputFileRef.current?.click();
                        }
                    }}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(true);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    className={`rounded-md border-2 border-dashed p-8 text-center transition-colors ${isDragging
                        ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                        : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                        }`}
                >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Arrastra aqui tu PDF firmado
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Solo 1 archivo .pdf
                    </p>
                    {selectedPdf && (
                        <div className="mt-3 rounded-md border border-zinc-200 bg-white px-3 py-2 text-left dark:border-zinc-700 dark:bg-zinc-800">
                            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedPdf.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {(selectedPdf.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    )}
                </div>

                <input
                    ref={inputFileRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={handleFileInputChange}
                />

                {uploadError && (
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">{uploadError}</p>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleCloseUploadModal}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmUpload} disabled={!selectedPdf || isUploading}>
                        {isUploading ? "Subiendo..." : "Subir PDF"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

