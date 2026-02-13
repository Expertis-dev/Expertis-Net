import { notFound } from "next/navigation";
import { Encuesta } from "@/types/encuesta";
import { EditarEncuestaFromClient } from "./EditarEncuestaFromClient";


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
    const {id} = await params
    const encuesta = await fetchEncuesta(id)
    return (
        <div className="bg-gray-200 dark:bg-zinc-900 min-h-screen -mx-4 px-4 -my-4">
            <EditarEncuestaFromClient encuesta={encuesta}/>
        </div>
    )
}