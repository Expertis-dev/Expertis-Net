import { Encuesta } from "@/types/encuesta"
import { RespuestasFetch } from "@/app/dashboard/encuesta/resultados/[id]/resultadosPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EyeIcon } from "lucide-react"
import { Fragment, useState } from "react"
import { ResponseModal } from "./ResponseModal"

interface Props {
  responses: RespuestasFetch[]
  encuesta: Encuesta
}

export const ResponsesPage = ({ encuesta, responses }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeResponse, setActiveResponse] = useState<RespuestasFetch | null>(null)
  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>cantidad de respuestas: {responses !== undefined ? responses.length : 0}</CardTitle>
        </CardHeader>
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
    </>
  )
}
