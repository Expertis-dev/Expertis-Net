"use client"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver";
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from '@/components/ui/button'
import { HistFeedback } from '@/types/feedback/interfaces'
import { SheetIcon } from 'lucide-react'
import React from 'react'

interface Props {
    feedbacks: HistFeedback[]
}

const extractData = (feedbacks: HistFeedback[]) => {
    const formattedFeedbacks = feedbacks.map(f => ({ ...f, resultadoEvaluacion: JSON.parse(f.resultadoEvaluacion) }))
    return formattedFeedbacks
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
            ...Object.values(f.resultadoEvaluacion).map(v => +v.replace(",", ""))
        ]
    })

    console.log(columns)
    const result: string[][] = [
        [...columns],
        ...objectValues
    ]
    return result
}

export const DownloadExcelButton = ({ feedbacks }: Props) => {

    const onDownloadExcel = () => {
            const supervisorFeedbacks = extractData(feedbacks)
    
            const aoaNegativeData = getAoaData(supervisorFeedbacks);
    
            
            const worksheetNegativo = XLSX.utils.aoa_to_sheet(aoaNegativeData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheetNegativo, "feedbacksSupervisores");
    
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(data, `reporte_feedback_supervisores_${format((new Date), 'yyyy-MM', { locale: es })}.xlsx`);
        }

    return (
        <Button className="mr-2.5 bg-green-600 dark:text-gray-300 dark:hover:bg-green-900 hover:bg-green-500 text-xs h-8 mt-3" 
            onClick={onDownloadExcel}
        >
            <SheetIcon className="text-gray-50" />
            Exportar a Excel
        </Button>
    )
}
