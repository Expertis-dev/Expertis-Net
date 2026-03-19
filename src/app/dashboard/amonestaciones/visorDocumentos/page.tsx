"use client"

import { AmonestacionPreview } from "@/components/amonestaciones/visorDocumentos/AmonestacionPreview";
import { Button } from "@/components/ui/button";
import { DownloadIcon, PrinterIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useMemo, useState } from "react";

export default function VisorDocumentosPage() {

    const MIN_ZOOM = 50;
    const MAX_ZOOM = 130;
    const ZOOM_STEP = 10;
    const BASE_PAGE_WIDTH_MM = 210;
    const BASE_PAGE_HEIGHT_MM = 297;

    const [zoomVal, setZoomVal] = useState(100);

    const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

    const handleZoom = (delta: number) => {
        setZoomVal((prev) => clampZoom(prev + delta));
    };

    const zoomScale = useMemo(() => zoomVal / 100, [zoomVal]);
    const canZoomOut = zoomVal > MIN_ZOOM;
    const canZoomIn = zoomVal < MAX_ZOOM;

    const scaledPageSize = useMemo(() => {
        return {
            width: `${BASE_PAGE_WIDTH_MM * zoomScale}mm`,
            height: `${BASE_PAGE_HEIGHT_MM * zoomScale}mm`,
        };
    }, [zoomScale]);

    const pageTransformStyle = useMemo(() => {
        return {
            transform: `scale(${zoomScale})`,
            transformOrigin: "top left",
            transition: "transform 120ms ease",
        };
    }, [zoomScale]);

    return (
        <>
            <div className="flex flex-row gap-2 border-b p-2">
                <h1 className="self-center">Visor de Documentos</h1>
                <hr className="border border-gray-200 h-auto" />
                <p className="text-sm self-center ml-2 font-light text-gray-800">Nombre_archivo.pdf</p>
                <span className="flex-1" />
                <div className="flex flex-row bg-gray-200 rounded-sm px-2">
                    <button
                        type="button"
                        onClick={() => handleZoom(-ZOOM_STEP)}
                        disabled={!canZoomOut}
                        aria-label="Reducir zoom"
                        className={`self-center ${canZoomOut ? "cursor-pointer hover:text-gray-700" : "cursor-not-allowed opacity-40"}`}
                    >
                        <ZoomOutIcon className="h-4 w-4" />
                    </button>
                    <p className="text-sm self-center mx-2">{zoomVal}%</p>
                    <button
                        type="button"
                        onClick={() => handleZoom(ZOOM_STEP)}
                        disabled={!canZoomIn}
                        aria-label="Aumentar zoom"
                        className={`self-center ${canZoomIn ? "cursor-pointer hover:text-gray-700" : "cursor-not-allowed opacity-40"}`}
                    >
                        <ZoomInIcon className="h-4 w-4" />
                    </button>
                </div>
                <Button className="flex flex-row bg-blue-900 hover:bg-blue-700 text-xs">
                    <DownloadIcon />
                    <p>Descargar</p>
                </Button>
                <Button className="flex flex-row bg-white text-black border-2 border-gray-400 hover:bg-gray-400 text-xs">
                    <PrinterIcon />
                    <p>Imprimir</p>
                </Button>
            </div>
            <div className="flex flex-col bg-gray-300 w-full p-2 h-screen overflow-y-auto">
                <div className="flex flex-col mx-auto gap-4">
                    <div className="self-start mt-4">
                        <h1 className="text-lef text-xs text-gray-600">RRHH &gt; Expedientes de control &gt; Macurs Jensen</h1>
                    </div>
                    {/* Hoja (s) */}
                    <div style={scaledPageSize}>
                        <div className="flex flex-col bg-white w-[210mm] h-[297mm] origin-top-left" style={pageTransformStyle}>
                            <AmonestacionPreview />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
