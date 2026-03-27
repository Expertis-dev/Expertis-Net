"use client"

import { format } from "date-fns"
import * as XLSX from "xlsx"
import { es } from "date-fns/locale"
import { saveAs } from "file-saver";
import { SheetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistFeedback } from "@/types/feedback/interfaces";
import { Form } from "./crear/CrearFbAsesorForm";

interface Props {
    feedbacks: HistFeedback[]
}

export interface Fb {
    USUARIO:                string;
    idFeedBack:             number;
    idEmpleado:             number;
    tipoEvaluacion:         string;
    periodo:                Date;
    estadoFeedback:         string;
    observacionesGenerales: string;
    analisisResultados:     null;
    tipoEmpleado:           string;
    compromisoMejora:       null;
    resultadoEvaluacion:    string | Form;
    usrInsert:              string;
    fecInsert:              Date;
}

const extractData = (feedbacks: HistFeedback[]) => {
    const formattedFeedbacks = feedbacks.map(f => ({ ...f, resultadoEvaluacion: JSON.parse(f.resultadoEvaluacion) }))

    const negativeFeedbacks = formattedFeedbacks.filter(f => f.tipoEvaluacion === "NEGATIVO")
    const rutinaFeedbacks = formattedFeedbacks.filter(f => f.tipoEvaluacion === "RUTINA")

    return [negativeFeedbacks, rutinaFeedbacks]
}

const getAoaData = (feedbacks: HistFeedback[]): string[][] => {
    const columns: string[] = []

    const objetKeys = Object.keys(feedbacks[0]).slice(0, -1)
    const resultadoEval = Object.keys(feedbacks[0].resultadoEvaluacion)
    columns.push(...objetKeys)
    columns.push(...resultadoEval)

    const objectValues: string[][] = feedbacks.map(f => {
        return [
            ...Object.values(f).slice(0,-1),
            ...Object.values(f.resultadoEvaluacion).map(v => {
                if (isNaN(+v.replace(",", ""))) return v
                return +v.replace(",", "")
            })
        ]
    })

    const result: string[][] = [
        [...columns],
        ...objectValues
    ]
    return result
}

export const DownloadExcelButton = ({ feedbacks }: Props) => {

    const onDownloadExcel = () => {
        const [negativeFeedbacks, rutinaFeedbacks] = extractData(feedbacks)

        const aoaNegativeData = getAoaData(negativeFeedbacks);
        const aoaRutinaData = getAoaData(rutinaFeedbacks);

        
        const worksheetNegativo = XLSX.utils.aoa_to_sheet(aoaNegativeData);
        const worksheetRutina = XLSX.utils.aoa_to_sheet(aoaRutinaData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheetNegativo, "feedbacksNegativos");
        XLSX.utils.book_append_sheet(workbook, worksheetRutina, "feedbacksRutina");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, `reporte_feedback_${format((new Date), 'yyyy-MM', { locale: es })}.xlsx`);
    }
    
    return (
        <>
            <Button className="mr-2.5 dark:bg-green-700 bg-green-500 mt-1 dark:text-gray-200 dark:hover:bg-green-900 hover:bg-green-600" 
                onClick={() => onDownloadExcel()}
            >
                <SheetIcon />
                Exportar a Excel
            </Button>
        </>
    )
}
