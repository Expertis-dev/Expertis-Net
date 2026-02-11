'use client'
import { useCallback, useEffect } from "react"

interface Props {
    surveyState: string,
    _id: string
}

export const SurveyStatusSelector = ({surveyState, _id}: Props) => {

    const onSelect = useCallback((surveyId: string, newState: string) => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/encuesta/${surveyId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({surveyState: newState})
        })
    }, [])

    useEffect(() => {
        
    }, [onSelect])

    return (
        <select
            defaultValue={surveyState}
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => onSelect(_id, e.target.value)}
        >
            <option value="BORRADOR">Borrador</option>
            <option value="PUBLICADA">Publicada</option>
            <option value="CERRADA">Cerrada</option>
        </select>
    )
}
