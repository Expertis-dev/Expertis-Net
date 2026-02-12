import { Encuesta } from "@/types/encuesta"
import { RespuestasFetch } from "@/app/dashboard/encuesta/resultados/[id]/resultadosPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EyeIcon } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { ResponseModal } from "./ResponseModal"
import * as XLSX from 'xlsx'
import { es } from "date-fns/locale"
import { saveAs } from "file-saver";
import {format} from 'date-fns'
interface Props {
  responses: RespuestasFetch[]
  encuesta: Encuesta
}

export const ResponsesPage = ({ encuesta, responses }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeResponse, setActiveResponse] = useState<RespuestasFetch | null>(null)

  const onDownloadExcel = () => {
    // console.log("Descargando excel")
    // console.log("Encuesta", encuesta)
    // console.log("responses", responses)
    const questionHeaders = encuesta.preguntas.map((p) => p.content)
    const rows = responses.map((response) => {
      const nombre = response.name
      const fecha = new Date(response.createdAt).toLocaleString("es-PE", {timeZone: "America/Lima"})
      const respuestas = Object.values(response.responses).map((a) => {
        return Array.isArray(a) ? a.join(';') : a
      })
      return [nombre, fecha, ...respuestas]
    });

    console.log(rows)

    const aoaData: string[][] = [
      ["NOMBRE EMPLEADO", "FECHA", ...questionHeaders], // COLUMNAS
      ...rows
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Repuestas");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `Tabla_de_respuestas_${encuesta.title}_${format((new Date), 'yyyy-MM', { locale: es })}.xlsx`);
  }
  
  return (
    <div className="flex justify-center">
      <Card className="mt-4 relative size-full w-[60%] max-w-250 min-w-150">
        <div className="flex items-start justify-between gap-4 mb-2">
          <CardHeader className="self-center">
            <CardTitle className="w-55 min-w-55">
              cantidad de respuestas: {(responses !== undefined) || (responses !== null) ? responses.length : 0}
            </CardTitle>
          </CardHeader>
          <Button className="w-70 mr-[1.5%]" onClick={onDownloadExcel}>Exportar Excel</Button>
        </div>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-center">Ver Respuesta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((item, index) => (
                  <Fragment key={item._id}>
                    <TableRow
                      className="animate-in slide-in-from-left-5 duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TableCell className="w-0">{(new Date(item.createdAt)).toLocaleString("es-PE", { timeZone: "America/Lima" })}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-medium text-center">
                        <Button
                          variant={"ghost"}
                          size={"icon"}
                          className="mx-auto h-8 w-8"
                          onClick={() => {
                            setActiveResponse(item)
                            setIsOpen(true)
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {activeResponse && (
        <ResponseModal
          encuesta={encuesta}
          response={activeResponse}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
