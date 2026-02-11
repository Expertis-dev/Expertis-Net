import { ResultadosPage } from "./resultadosPage";

interface Props {
    id: string
}

export default async function Resultados({
    params,
}: {
    params: Promise<Props>;
}) {


    return (
        <ResultadosPage id={(await params).id} />
    );
}
