interface Props {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string,
    inputAsesor?: boolean
}

export const FormattedNumberInput = ({
    value,
    onChange,
    placeholder,
    inputAsesor = false
}: Props) => (
    <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`ml-1 w-full ${inputAsesor ? "" : "text-right"} min-w-0 bg-transparent focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-400`}
    />
)