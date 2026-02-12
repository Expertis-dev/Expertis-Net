import { notFound } from "next/navigation";
import EncuestaFormClient from "./EncuestaFormClient";
import { Encuesta } from "@/types/encuesta";

interface Props {
    id: string
}


const fetchEncuesta = async (id: string): Promise<Encuesta> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuesta/${id}`)
            .then(async r => await r.json());
        if (response === null) return notFound();
        return response
    } catch (error) {
        console.log(error)
        notFound()
    }
}


export default async function Page({
    params,
}: {
    params: Promise<Props>
}) {
    
    const { id } = await params
    const encuesta = await fetchEncuesta(id)
    // serializar datos para enviarlos al cliente
    const encuestaData = JSON.parse(JSON.stringify(encuesta))
    return (<EncuestaFormClient encuesta={encuestaData} key={encuesta._id}/>)
}
