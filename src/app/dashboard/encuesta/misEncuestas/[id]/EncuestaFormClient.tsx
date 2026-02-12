"use client"

import React, { useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { TextLineAnswer, TextAreaAnswer, DateAnswer, BooleanAnswer, MultipleAnswers, SelectAnswer } from '@/Encuesta/components/answers'
import { useUser } from "@/Provider/UserProvider"
import { notFound, useRouter } from "next/navigation"
import { SuccessModal } from "@/components/success-modal"

type AnswerValue = string | boolean | string[] | null

export type Option = {
    _id: string;
    value: string | number
    label: string
}

export type Pregunta = {
    _id?: string
    id: number
    content: string
    mustAnswer: boolean
    responseType: string
    options?: Option[]
}

export type EncuestaClient = {
    _id: string
    surveyId: string
    title: string
    description: string
    urlImage?: string
    createdAt?: string
    preguntas: Pregunta[]
}

interface Props {
    encuesta: EncuestaClient
}

export default function EncuestaFormClient({ encuesta }: Props) {
    const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
    const { user } = useUser()
    const router = useRouter()
    const defaultValues = useMemo(() => {
        const dv: Record<string, AnswerValue> = {}
        encuesta.preguntas.forEach((p) => {
            if (p.responseType === 'MULTIPLE_SELECT') {
                dv[p.id] = []
                return
            }
            if (p.responseType === 'BOOLEAN') {
                dv[p.id] = null
                return
            }
            dv[p.id] = ''
        })
        return dv
    }, [encuesta])

    const { handleSubmit, reset, control } = useForm<Record<string, AnswerValue>>({ defaultValues })

    const onSubmit = async (data: Record<string, AnswerValue>) => {
        const responses: Record<string, AnswerValue> = { ...data }
        const body = {
            survey: encuesta._id,
            surveyId: encuesta.surveyId,
            dni: Number(user?.dni ?? -1) || -1,
            name: `${user?.nombre?.toUpperCase().trim() ?? ""} ${user?.apellido1?.trim().toUpperCase() ?? ""}`.trim(),
            responses
        }
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/respuesta`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }).then(async (r) => {
            const res: {success: boolean, message: string, error: string} = await r.json()
            if (res.success === false){
                console.log(res)
                alert("Ya has respondiste esta encuesta")
            }else{
                setSuccessModalIsOpen(true)
            }
        }).catch(() => {
            alert("Hubo un error al subir la respuesta")
        })
        router.push("/dashboard/encuesta/misEncuestas")
    }

    return (
        <main className="flex justify-center px-4 py-8">
            <section className="w-full max-w-3xl">
                <header className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-slate-700">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{encuesta.title}</h1>
                    {encuesta.description ? (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{encuesta.description}</p>
                    ) : null}
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-6 border border-gray-100 dark:border-slate-700">
                    {encuesta.preguntas.map((pregunta, idx) => {
                        const name = `${pregunta.id}`
                        return (
                            <div key={pregunta.id} className="rounded-lg border border-gray-100 dark:border-slate-700 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.2fr)] gap-3 md:gap-6 items-start">
                                    <div className="shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-600 font-medium">{idx + 1}</div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-base font-medium text-gray-800 dark:text-gray-100">{pregunta.content}</span>
                                            {pregunta.mustAnswer ? <span className="text-sm text-red-500">*</span> : null}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        {pregunta.responseType === 'TEXT_LINE' && (
                                            <Controller
                                                control={control}
                                                    name={name}
                                                    rules={{ required: pregunta.mustAnswer }}
                                                    render={({ field }) => (
                                                        <TextLineAnswer value={field.value!.toString()} onChange={field.onChange} />
                                                    )}
                                                />
                                            )}

                                            {pregunta.responseType === 'TEXT_AREA' && (
                                                <Controller
                                                    control={control}
                                                    name={name}
                                                    rules={{ required: pregunta.mustAnswer }}
                                                    render={({ field }) => (
                                                        <TextAreaAnswer value={field.value!.toString()} onChange={field.onChange} rows={4} />
                                                    )}
                                                />
                                            )}

                                            {pregunta.responseType === 'DATE' && (
                                                <Controller
                                                    control={control}
                                                    name={name}
                                                    rules={{ required: pregunta.mustAnswer }}
                                                    render={({ field }) => (
                                                        <DateAnswer value={field.value!.toString()} onChange={field.onChange} />
                                                    )}
                                                />
                                            )}

                                            {pregunta.responseType === 'BOOLEAN' && (
                                                <Controller
                                                    control={control}
                                                    name={name}
                                                    rules={{
                                                        validate: (value) =>
                                                            !pregunta.mustAnswer || value === true || value === false,
                                                    }}
                                                    render={({ field }) => (
                                                        <BooleanAnswer
                                                            value={
                                                                field.value === true
                                                                    ? true
                                                                    : field.value === false
                                                                        ? false
                                                                        : null
                                                            }
                                                            onChange={(v) => field.onChange(v)}
                                                        />
                                                    )}
                                                />
                                            )}

                                            {pregunta.responseType === 'UNIQUE_SELECT' && (
                                                <Controller
                                                    control={control}
                                                    name={name}
                                                    rules={{ required: pregunta.mustAnswer }}
                                                    render={({ field }) => (
                                                        <MultipleAnswers options={pregunta.options || []} name={name} value={field.value!.toString()} onChange={(v) => field.onChange(v)} />
                                                    )}
                                                />
                                            )}

                                            {pregunta.responseType === 'MULTIPLE_SELECT' && (
                                                <Controller
                                                    control={control}
                                                    name={name}
                                                    rules={{ required: pregunta.mustAnswer }}
                                                    render={({ field }) => (
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            {pregunta.options?.map((o) => {
                                                                const val = String(o.value)
                                                                const selectedValues = Array.isArray(field.value) ? field.value : []
                                                                const checked = selectedValues.includes(val)
                                                                return (
                                                                    <label key={o.label} className="inline-flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            value={val}
                                                                            checked={checked}
                                                                            onChange={(e) => {
                                                                                if (e.target.checked) {
                                                                                    field.onChange([...selectedValues, val])
                                                                                } else {
                                                                                    field.onChange(selectedValues.filter((v: string) => v !== val))
                                                                                }
                                                                            }}
                                                                            className="peer sr-only"
                                                                        />
                                                                        <span className="w-5 h-5 rounded-sm border border-gray-300 dark:border-slate-600 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition">
                                                                            <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                                        </span>
                                                                        <span className="text-sm text-gray-700 dark:text-gray-200">{o.label}</span>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                />
                                            )}

                                            {pregunta.responseType === 'LIST' && (
                                                <Controller
                                                    control={control}
                                                    name={name}
                                                    rules={{ required: pregunta.mustAnswer }}
                                                    render={({ field }) => (
                                                        <SelectAnswer options={pregunta.options || []} value={field.value!.toString()} onChange={(v) => field.onChange(v)} />
                                                    )}
                                                />
                                            )}
                                        </div>
                                </div>
                            </div>
                        )
                    })}

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" onClick={() => reset()} className="px-4 py-2 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 transition">Limpiar</button>
                        <button type="submit" className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">Enviar</button>
                    </div>
                </form>
            </section>
            <SuccessModal isOpen={successModalIsOpen} message="Encuesta respondida con exito"/>
        </main>
    )
}
