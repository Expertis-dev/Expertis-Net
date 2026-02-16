import { Pregunta } from "@/types/encuesta"
import { RespuestasFetch } from "@/app/dashboard/encuesta/resultados/[id]/resultadosPage"
import { useMemo } from "react"
import { StatisticsCharts } from "./StatisticsCharts"

interface Props {
  responses?: RespuestasFetch[]
  preguntas?: Pregunta[]
}


export const StatisticsPage = ({ preguntas = [], responses = [] }: Props) => {
  const respuestas = useMemo(() => responses.map((r) => r.responses), [responses])
  return (
    <div className="mt-4 grid w-full gap-4 grid-cols-1 items-start justify-items-center">
      {(preguntas ?? []).map((pregunta) => {
        return (
          <StatisticsCharts key={pregunta._id} pregunta={pregunta} responses={respuestas} />
        )
      })}
    </div>
  )
}
