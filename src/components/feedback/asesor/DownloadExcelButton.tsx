"use client"

import { format } from "date-fns"
import * as XLSX from "xlsx"
import { es } from "date-fns/locale"
import { saveAs } from "file-saver";
import { SheetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistFeedback } from "@/types/feedback/interfaces";
import { useEffect, useState } from "react";
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


export const DownloadExcelButton = ({feedbacks}: Props) => {

    const onDownloadExcel = () => {
        console.log(feedbacks)
        const questionHeaders: string[] = []
        const rows: string[][] = [[]]

        //! PRIMERA HOJA RUTINA
        const aoaDataRutina: string[] = feedbacks[0]
            ? Object.keys(feedbacks[0])
            : []

        //! SEGUNDA HOJA NEGATIVO


        // const aoaData: string[][] = [
        //     ["NOMBRE EMPLEADO", "FECHA", ...questionHeaders], // COLUMNAS
        //     ...rows
        // ];
        // const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
        // const workbook = XLSX.utils.book_new();
        // XLSX.utils.book_append_sheet(workbook, worksheet, "Repuestas");

        // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        // const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        // saveAs(data, `reporte_feedback_${"encuesta.title"}_${format((new Date), 'yyyy-MM', { locale: es })}.xlsx`);
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
