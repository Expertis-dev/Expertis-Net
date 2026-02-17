"use client"
import React, { useState } from 'react'
import { Encuesta, CATEGORIES, RESPONSE_TYPES, responseType, Option, AGENCIA } from '@/types/encuesta'
import { Plus, Trash2 } from 'lucide-react'
import { SuccessModal } from '@/components/success-modal'
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useUser } from '@/Provider/UserProvider'
import { useRouter } from 'next/navigation'

interface Props {
    encuesta: Encuesta
}

type PreguntaForm = {
    content: string,
    responseType: string,
    mustAnswer: boolean,
    options?: OptionInput[];
}

type OptionInput = Omit<Option, "_id">

type EncuestaForm = {
    title: string;
    category: string;
    description: string;
    availableFor: string;
    preguntas: PreguntaForm[];
};

export const EditarEncuestaFromClient = ({ encuesta }: Props) => {
    const router = useRouter()
    const [successModalIsOpen, setSuccessModalIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: encuesta.title,
            category: encuesta.category,
            description: encuesta.description,
            availableFor: encuesta.availableFor,
            preguntas: encuesta.preguntas.map((p) => {
                return {
                    content: p.content,
                    responseType: p.responseType,
                    mustAnswer: p.mustAnswer,
                    options: p.options || [{ label: "", value: "" }]
                }
            })
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "preguntas"
    })

    const watchPreguntas = watch("preguntas")

    const { user } = useUser()

    const onSaveSubmit: SubmitHandler<EncuestaForm> = async (data) => {
        setIsSubmitting(true)
        const sanitized = sanitizePayload(data)
        const createdBy = user?.nombre.toUpperCase().trim() + " " + user?.apellido1.trim().toUpperCase()
        const surveyId = sanitized.category!.toUpperCase().split(" ").at(-1) + "_" + user?.apellido1.trim().toUpperCase() + "_" + (Math.random() * 999 + 1).toFixed(0)
        const body = {
            createdBy,
            surveyId,
            surveyState: "PUBLICADA",
            ...sanitized
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuesta/${encuesta._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }).then(() => {
            setIsSubmitting(false)
            setSuccessModalIsOpen(true)
        }).catch(() => {
            alert("Hubo un error al publicar la encuesta")
            setIsSubmitting(false)
        })
        setTimeout(() => {
            router.push("/dashboard/encuesta/encuestasCreadas")
        }, 1500)
    }

    const requiresOptionsFor = (type: string) => ["UNIQUE_SELECT", "MULTIPLE_SELECT", "LIST"].includes(type)

    const sanitizePayload = (data: EncuestaForm) => {
        const copy = { ...data }
        copy.preguntas = (copy.preguntas || []).map((p: PreguntaForm, idx: number) => {
            const np: PreguntaForm & { id: number } = { ...p, id: idx + 1 }
            // add ordering id
            // normalize responseType
            const type = String(np.responseType)
            if (requiresOptionsFor(type)) {
                // keep options but remove empty labels, ensure value==label
                if (Array.isArray(np.options)) {
                    np.options = np.options
                        .map((o: OptionInput) => ({ label: String(o.label || "").trim(), value: String((o.value ?? o.label) || "").trim() }))
                        .filter((o: OptionInput) => String(o.label || "").trim().length > 0)
                    if (np.options.length === 0) delete np.options
                }
            } else {
                // remove options key entirely
                if (np.hasOwnProperty('options')) delete np.options
            }
            return np
        })
        return copy
    }

    return (
        <main className="flex justify-center px-4 py-8 m-auto">
            <section className="w-full max-w-3xl">
                {/* HEADER */}
                <header className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-zinc-700">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar encuesta</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Modifica tu encabezado, agrega preguntas u opciones o modifica las que ya tienes</p>
                </header>

                <form onSubmit={handleSubmit(onSaveSubmit)} className="space-y-6">
                    {/* CABECERA DE LA ENCUESTA */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-zinc-700 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Datos de la encuesta</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                                Título del cuestionario <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("title", { required: "El título es obligatorio" })}
                                placeholder="Ej: Encuesta de satisfacción del cliente"
                                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                                Tema o categoría <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("category", { required: "La categoría es obligatoria" })}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecciona una categoría</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                                Descripción <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register("description", { required: "La descripción es obligatoria" })}
                                rows={3}
                                placeholder="Describe el propósito o contexto de esta encuesta"
                                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                                ¿A que agencias está destinada esta encuesta? <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("availableFor", { required: "Los destinatarios son obligatorios" })}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecciona una agencia</option>
                                {AGENCIA.map((cat) => (
                                    <option key={cat} value={cat}>{cat.split("_").join(" ")}</option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                        </div>
                    </div>

                    {/* PREGUNTAS */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white pl-6">Preguntas de la encuesta</h2>

                        {fields.map((field, idx) => {
                            const responseType = watchPreguntas[idx]?.responseType
                            const requiresOptions = ["UNIQUE_SELECT", "MULTIPLE_SELECT", "LIST"].includes(responseType)

                            return (
                                <div key={field.id} className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-zinc-700 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:text-gray-200 dark:bg-zinc-700 flex items-center justify-center text-blue-600 font-medium">
                                            {idx + 1}
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                                                    Enunciado de la pregunta <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    {...register(`preguntas.${idx}.content`, { required: "El enunciado es obligatorio" })}
                                                    placeholder="Escribe tu pregunta aquí"
                                                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                                                        Tipo de pregunta <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        {...register(`preguntas.${idx}.responseType`)}
                                                        className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        {RESPONSE_TYPES.map((type) => (
                                                            <option key={type.value} value={type.value}>
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex items-end">
                                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            {...register(`preguntas.${idx}.mustAnswer`)}
                                                            className="w-4 h-4 text-blue-600 rounded"
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-200">Pregunta obligatoria</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-700 rounded transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* OPCIONES */}
                                    {requiresOptions && (
                                        <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
                                                Opciones de respuesta <span className="text-red-500">*</span>
                                            </label>
                                            <Controller
                                                name={`preguntas.${idx}.options`}
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        {field.value?.map((option: OptionInput, optIdx: number) => (
                                                            <div key={optIdx} className="flex gap-2 items-center">
                                                                <input
                                                                    type="text"
                                                                    value={option.label}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...field.value]
                                                                        newOptions[optIdx].label = e.target.value
                                                                        newOptions[optIdx].value = e.target.value

                                                                        field.onChange(newOptions)
                                                                    }}
                                                                    placeholder={`Opción ${optIdx + 1}`}
                                                                    className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                                {field.value.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newOptions = field.value.filter((_: OptionInput, i: number) => i !== optIdx)
                                                                            field.onChange(newOptions)
                                                                        }}
                                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-700 rounded transition"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = [...(field.value || []), { label: "", value: "" }]
                                                                field.onChange(newOptions)
                                                            }}
                                                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
                                                        >
                                                            <Plus size={16} /> Agregar opción
                                                        </button>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* BOTÓN AGREGAR PREGUNTA */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => append({
                                content: "",
                                responseType: responseType.TEXT_LINE,
                                mustAnswer: false,
                                options: [{ label: "", value: "" }]
                            })}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
                        >
                            <Plus size={18} /> Agregar pregunta
                        </button>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-zinc-700">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-600 transition"
                        >
                            Limpiar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-2xl bg-blue-600 text-white dark:bg-black hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </section>
            <SuccessModal isOpen={successModalIsOpen} message={"Acción completada satisfactoriamente"} />
        </main>
    )
}
