import { ResultadosPage } from "./resultadosPage";

interface Props {
    id: string
}

export default async function Resultados({
    params,
}: {
    params: Promise<Props>;
}) {
    const {id} = await params

    return (
        <ResultadosPage id={id} />
    );
}
