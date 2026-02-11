import { Encuesta } from "@/types/encuesta"
import { RespuestasFetch } from "@/app/dashboard/encuesta/resultados/[id]/resultadosPage"

interface Props {
    responses: RespuestasFetch[]
    encuesta: Encuesta
}

export const StatisticsPage = ({}: Props) => {
  return (
    <div>StatisticsPage</div>
  )
}
