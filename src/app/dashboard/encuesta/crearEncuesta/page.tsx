import CrearEncuestaFormClient from "./CrearEncuestaFormClient"

interface Props {
    body: Object
}

export default function Page({body = {}}: Props) {
    return (
        <div className="bg-gray-200 dark:bg-zinc-900 min-h-screen -mx-4 px-4 -my-4">
            <CrearEncuestaFormClient body={{}}/>
        </div>
    )
}