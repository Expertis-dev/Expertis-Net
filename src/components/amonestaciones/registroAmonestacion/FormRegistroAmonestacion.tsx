"use client"

import { Button } from '@/components/ui/button'
import { SaveIcon, UploadCloudIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface RegistroAmonestacion {
    tipoAmon: string,
    fechaIncidente: Date;
    descripcion: string;
    evidencia: FileList
}

export const FormRegistroAmonestacion = () => {
    const { register, handleSubmit, watch, reset } = useForm<RegistroAmonestacion>();
    const router = useRouter()
    const onSubmit: SubmitHandler<RegistroAmonestacion> = (data) => {
        console.log(data)
        router.push("/dashboard/amonestaciones/generacionAmonestacion")
    }

    const file = watch("evidencia")
    return (
        <form className="p-4 border shadow rounded-2xl dark:border-zinc-700 dark:bg-zinc-900" onSubmit={handleSubmit(onSubmit)}>
            <h1 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Detalle del incidente</h1>
            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                <div className="flex flex-col flex-1 gap-2">
                    <p className="text-gray-900 dark:text-gray-100">Tipo de Amonestacion</p>
                    <select {...register("tipoAmon")} id="1" className="py-2 px-4 border border-gray-300 rounded-lg w-full dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100">
                        <option value="tardanza">Amonestacion verbal</option>
                        <option value="tardanza justificada">Amonetacion Escrita</option>
                        <option value="revision contrato">Revision de contrato</option>
                    </select>
                </div>
                <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">Fecha del incidente</p>
                    <input type="date" {...register("fechaIncidente")} className="mt-2 border border-gray-300 rounded-lg py-1.5 px-2 w-full dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100" />
                </div>
            </div>
            <div className="flex flex-col mt-2 gap-2">
                <p className="text-gray-900 dark:text-gray-100">Descripcion de los Hechos</p>
                <textarea id="desc" {...register("descripcion")} cols={10} className="border border-gray-300 rounded-lg py-1 px-2 min-h-30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-100" placeholder="Describa detalladamente lo sucedido..." />
                <p className="text-xs text-gray-500 dark:text-gray-400">Sea objetivo y preciso. Evite opinciones personales</p>
                <p className="text-gray-900 dark:text-gray-100">Evidencia adjunta</p>
                <label
                    htmlFor="evidencia"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:bg-blue-500/10"
                >
                    <UploadCloudIcon className="text-blue-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-100">Arrastra y suelta un archivo</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">o haz clic para seleccionar</span>
                    {file?.length > 0 && (
                        <p className="text-xs text-gray-500">
                            Archivo: {file[0].name}
                        </p>
                    )}
                    <input id="evidencia" type="file" accept="image/*,.pdf" className="sr-only" {...register("evidencia")} />
                </label>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-2">
                    <Button onClick={() => reset()} className="bg-white border border-gray text-black hover:bg-gray-300 w-full sm:w-auto dark:bg-zinc-900 dark:text-gray-100 dark:border-zinc-700 dark:hover:bg-gray-800">
                        Cancelar
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-800 w-full sm:w-auto" type='submit'>
                        <SaveIcon />
                        Registrar Amonestacion
                    </Button>
                </div>
            </div>
        </form>
    )
}
