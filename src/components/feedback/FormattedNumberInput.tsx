import { forwardRef } from "react"

interface Props {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    name?: string
    placeholder?: string
    inputAsesor?: boolean
    disbaled?: boolean
}

export const FormattedNumberInput = forwardRef<HTMLInputElement, Props>(({
    value,
    onChange,
    onBlur,
    name,
    placeholder,
    inputAsesor = false,
    disbaled = false
}, ref) => (
    <input
        ref={ref}
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`ml-1 w-full ${inputAsesor ? "" : "text-right"} min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400`}
        disabled={disbaled}
    />
))

FormattedNumberInput.displayName = "FormattedNumberInput"
