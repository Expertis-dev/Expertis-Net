import { ReporteCallMensual } from "./ReporteCallMensualPage";
import { ReporteAsistencia } from "./types";

const fetchReporteMensual = async (fechaInicio: string, fechaFin: string): Promise<ReporteAsistencia[]> => {
    const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reporteCruzadoIntervalo/${fechaInicio}/${fechaFin}`) // 2026-04-05/2026-04-07
        .then(res => res.json());
    return data
}

export default async function ReporteCallMensualPage({
    searchParams,
}: {
    searchParams: Promise<{ fechaInicio?: string; fechaFin?: string }>
}) {
    const { fechaInicio, fechaFin } = await searchParams;

    const fechaHoy = new Date();
    const defaultFechaInicio = new Date(Date.UTC(
        fechaHoy.getUTCFullYear(),
        fechaHoy.getUTCMonth(),
        1
    ));
    
    const defaultFechaFin = new Date();
    const formatFecha = (d: Date) => d.toISOString().slice(0, 10);
    const inicio = fechaInicio || formatFecha(defaultFechaInicio);
    const fin = fechaFin || formatFecha(defaultFechaFin);
    const dataReporte = await fetchReporteMensual(inicio, fin);

    return (
        <>
            <ReporteCallMensual
                defaultFechaFin={fin}
                defaultFechaInicio={inicio}
                data={dataReporte}
            />
        </>
    );
}
