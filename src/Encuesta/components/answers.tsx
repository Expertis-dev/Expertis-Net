'use client'
import { Option } from '@/types/encuesta'
import React from 'react'

interface MultipleProps {
    options: Option[]
    name?: string
    value?: string | number
    onChange?: (val: string | number) => void
}

interface TextProps {
    name?: string
    value?: string
    placeholder?: string
    onChange?: (val: string) => void
}

interface DateProps {
    name?: string
    value?: string
    onChange?: (val: string) => void
}

interface BooleanProps {
    name?: string
    value?: boolean | null
    onChange?: (val: boolean) => void
}

interface TextAreaProps extends TextProps {
    rows?: number
}

export const TextLineAnswer: React.FC<TextProps> = ({ value = '', placeholder = '', onChange }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    )
}

export const DateAnswer: React.FC<DateProps> = ({ value = '', onChange }) => {
    return (
        <input
            type="date"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-auto px-3 py-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    )
}

export const MultipleAnswers: React.FC<MultipleProps> = ({ options, name = 'option', value, onChange }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {options.map((o) => {
                const id = `${name}-${o.label}`
                return (
                    <label key={o.label} htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                            id={id}
                            name={name}
                            type="radio"
                            checked={String(value) === String(o.value)}
                            onChange={() => onChange?.(o.value)}
                            className="h-4 w-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-200">{o.label}</span>
                    </label>
                )
            })}
        </div>
    )
}

export const BooleanAnswer: React.FC<BooleanProps> = ({ value = null, onChange }) => {
    const isYes = value === true
    const isNo = value === false
    return (
        <div className="inline-flex items-center gap-3">
            <button
                type="button"
                aria-pressed={isYes}
                onClick={() => onChange?.(true)}
                className={`px-3 py-1 rounded-md transition ${isYes ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}
            >
                Sí
            </button>
            <button
                type="button"
                aria-pressed={isNo}
                onClick={() => onChange?.(false)}
                className={`px-3 py-1 rounded-md transition ${isNo ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}
            >
                No
            </button>
        </div>
    )
}

export const TextAreaAnswer: React.FC<TextAreaProps> = ({ value = '', placeholder = '', rows = 4, onChange }) => {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
        />
    )
}

interface SelectProps {
    name?: string
    options: Option[]
    value?: string | number
    placeholder?: string
    onChange?: (val: string) => void
}

export const SelectAnswer: React.FC<SelectProps> = ({ options, value = '', placeholder = 'Seleccione...', onChange }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
            <option value="">{placeholder}</option>
            {options.map((o) => (
                <option key={o.label} value={String(o.value)}>{o.label}</option>
            ))}
        </select>
    )
}


