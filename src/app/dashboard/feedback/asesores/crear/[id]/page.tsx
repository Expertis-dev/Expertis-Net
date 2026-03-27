"use client"
import { CrearFbAsesorForm, Form as FormRutina} from "@/components/feedback/asesor/crear/CrearFbAsesorForm";
import { CrearFbNegativoAsesorForm,  Form as FormNegativo} from "@/components/feedback/asesor/crear/CrearFbNegativoAsesorForm";
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

interface DataFbNegativo {
    puntualidad:          string;
    indicadoresPurecloud: string;
    indicadoresGestion:   string;
    calidadLlamadas:      string;
}

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
    const [form, setForm] = useState<FormRutina | FormNegativo>()
    const [data, setData] = useState<DataFbBase>()
    const [modal, setModal] = useState({
        isOpen: false,
        message: ""
    })

    const router = useRouter()
    const {user} = useUser()
    const [asesor, setAsesor] = useState<Colaborador>()

    const isFormRutina = (value?: FormRutina | FormNegativo): value is FormRutina =>
        value !== undefined && "recupero" in value

    const isFormNegativo = (value?: FormRutina | FormNegativo): value is FormNegativo =>
        value !== undefined && "puntualidad" in value
    
    const parseFeedback = (data: DataFb): FormNegativo | FormRutina => {
        if (data.tipoEvaluacion === "RUTINA") {
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
        const resultadoEvaluacion: DataFbNegativo = JSON.parse(data.resultadoEvaluacion)
        return {
            calidadLlamadas: resultadoEvaluacion.calidadLlamadas,
            indicadoresGestion: resultadoEvaluacion.indicadoresGestion,
            indicadoresPurecloud: resultadoEvaluacion.indicadoresPurecloud,
            observaciones: data.observacionesGenerales,
            puntualidad: resultadoEvaluacion.puntualidad
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
            />
            {
                (currentFeedback === "rutina" && form) ? 
                <CrearFbAsesorForm
                    asesor={asesor}
                    modal={modal}
                    router={router}
                    setModal={setModal}
                    defaultValues={isFormRutina(form) ? form : undefined}
                />
                :
                <CrearFbNegativoAsesorForm
                    modal={modal}
                    router={router}
                    setModal={setModal}
                    asesor={asesor}
                    defaultFields={isFormNegativo(form) ? form : undefined}
                />
            }
        </div>
    );
}

