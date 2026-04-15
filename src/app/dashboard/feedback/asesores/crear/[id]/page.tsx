"use client"
import { CrearFbAsesorForm, Form as FormRutina} from "@/components/feedback/asesor/crear/CrearFbAsesorForm";
import { Colaborador, HeaderCrearFbAsesor } from "@/components/feedback/asesor/crear/HeaderCrearFbAsesor";
import { useUser } from "@/Provider/UserProvider";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface DataFbBase {
    fecInsert:             Date;
    idEmpleado:             string;
    periodo:                Date;
    estadoFeedback:         string;
    observacionesGenerales: string;
    analisisResultados:     null;
    tipoEmpleado:           string;
    compromisoMejora:       null;
    usrInsert:              string;
    USUARIO: string
}

type DataFb =
    | (DataFbBase & { tipoEvaluacion: "RUTINA"; resultadoEvaluacion: string })
    | (DataFbBase & { tipoEvaluacion: "NEGATIVO"; resultadoEvaluacion: string })

interface DataFbRutina {
    recupero:                string;
    recuperoMeta:            string;
    calidadPdp:              string;
    calidadPdpPromedio:      string;
    calidadCierre:           string;
    calidadCierrePromedio:   string;
    produccionPdp:           string;
    produccionPdpPromedio:   string;
    ticketDePdp:             string;
    ticketDePdpPromedio:     string;
    faltasInjustificadas:    string;
    tardanzasInjustificadas: string;
}


export default function EditarFeedbackAsesorPage({params}: {
    params: Promise<{id: string}>
}) {
    const {id: idFeedback} = use(params)
    const [currentFeedback, setCurrentFeedback] = useState("rutina")
    const [form, setForm] = useState<FormRutina>()
    const [data, setData] = useState<DataFbBase>()
    const [modal, setModal] = useState({
        isOpen: false,
        message: ""
    })

    const router = useRouter()
    const {user} = useUser()
    const [asesor, setAsesor] = useState<Colaborador>()
    const today = new Date()
    const toMonthValue = (date: Date) => {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, "0")
        return `${year}-${month}`
    }
    const toDateValue = (date: Date) => {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, "0")
        const day = String(date.getUTCDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }
    const [periodoRutina, setPeriodoRutina] = useState(toMonthValue(today))
    const [periodoNegativa, setPeriodoNegativa] = useState(toDateValue(today))

    
    const parseFeedback = (data: DataFb): FormRutina => {
        const resultadoEvaluacion: DataFbRutina = JSON.parse(data.resultadoEvaluacion)
        return {
            calidadCierre: resultadoEvaluacion.calidadCierre,
            calidadCierrePromedio: resultadoEvaluacion.calidadCierrePromedio,
            calidadPdp: resultadoEvaluacion.calidadPdp,
            calidadPdpPromedio: resultadoEvaluacion.calidadPdpPromedio,
            faltasInjustificadas: resultadoEvaluacion.faltasInjustificadas,
            observacionesGenerales: data.observacionesGenerales,
            produccionPdp: resultadoEvaluacion.produccionPdp,
            produccionPdpPromedio: resultadoEvaluacion.produccionPdpPromedio,
            recupero: resultadoEvaluacion.recupero,
            recuperoMeta: resultadoEvaluacion.recuperoMeta,
            tardanzasInjustificadas: resultadoEvaluacion.tardanzasInjustificadas,
            ticketDePdp: resultadoEvaluacion.ticketDePdp,
            ticketDePdpPromedio: resultadoEvaluacion.ticketDePdpPromedio
        }
    }

    useEffect(() => {
        const fetchFeedback = async (idFeedback: number): Promise<DataFb> => {
            console.log(idFeedback)
            const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${idFeedback}`).then(r => r.json())
            return data
        }
        fetchFeedback(+idFeedback).then(data => {
            const formValues = parseFeedback(data)
            console.log(data)
            setForm(formValues)
            setData(data)
            const periodoDate = new Date(data.periodo)
            if (!Number.isNaN(periodoDate.getTime())) {
                setPeriodoRutina(toMonthValue(periodoDate))
                setPeriodoNegativa(toDateValue(periodoDate))
            }
            setCurrentFeedback(data.tipoEvaluacion === "RUTINA" ? "rutina" : "negativa")
        })
        
    }, [idFeedback])
    
    return (
        <div className="flex flex-col rounded-xs dark:text-zinc-100">
            <div className="text-xs flex mb-1 cursor-pointer text-gray-500" onClick={() => router.push(`/dashboard/feedback/asesores/?usuario=${user?.usuario || ""}`, )}>
                <ArrowLeft size={15}/>
                <p className="self-center">Volver a la pagina anterior</p>
            </div>
            <HeaderCrearFbAsesor 
                currentFeedback={currentFeedback} 
                setCurrentFeedback={setCurrentFeedback} 
                setAsesor={setAsesor}
                idEmpleado={data?.idEmpleado != null ? +data.idEmpleado : undefined}
                USUARIO={data?.USUARIO}
                periodoRutina={periodoRutina}
                periodoNegativa={periodoNegativa}
                setPeriodoRutina={setPeriodoRutina}
                setPeriodoNegativa={setPeriodoNegativa}
                periodoDisabled={true}
            />
            
            <CrearFbAsesorForm
                asesor={asesor}
                modal={modal}
                router={router}
                setModal={setModal}
                defaultValues={form}
                periodoSeleccionado={periodoRutina}
                currentFeedback={currentFeedback}
            />
        </div>
    );
}

