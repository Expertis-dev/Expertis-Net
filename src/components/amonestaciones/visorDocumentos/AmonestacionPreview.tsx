import Image from "next/image"

interface Props {
    nombre?: string,
    fechaHoy?: Date,
    nombreSupervisor?: string,
    numMemorando?: string,
    extra?: PropsTextoFalta | PropsTextoTardanza
}

export const AmonestacionPreview = ({fechaHoy, nombre, nombreSupervisor, numMemorando, extra}: Props) => {
    return (
        <>
            <div className="px-19 mt-14 mb-5 flex flex-row">
                <Image src={"/LOGO-CENTRAL.png"} width={100} height={100} alt="Logo" className="" />
            </div>
            <div className="self-center w-[80%]">
                <h1 className="uppercase text-lg text-center py-2 font-black underline">MEMORANDO N 984-2026</h1>
                <p className="font-bold">Lima, 04 de Marzo 2026</p>

                <div className="flex flex-col gap-2 mt-8">
                    <p>
                        <span className="font-bold uppercase">para: </span>
                        FRANK ANTONIO PACORA GARCIA <span className="font-bold">/ Asesor de cobranza telefónica</span>
                    </p>
                    <p className="font-bold">
                        ASUNTO: Amonestación Escrita
                    </p>
                </div>
                <div className="flex flex-col mt-8">
                    <TextoFalta/>
                    <p className="mt-4 text-justify">
                        La conducta descrita se encuentra tipificada en el manual de inducción firmado por su persona, así como nuestro decisión se encuentra debidamente sustentada en el artículo 9 del Decreto Supremo
                        003-97-TR Ley de Productividad y Competitividad Laboral.
                    </p>
                    <p className="text-justify mt-4">
                        Copia de esta comunicación va a su archivo personal para los efectos legales pertinentes.
                    </p>
                    <p className="text-justify mt-4">
                        Atentamente,
                    </p>
                </div>
                <div className="flex flex-col mt-22">
                    <p className="font-semibold">______________________</p>
                    <p className="font-bold">KENNETH CUBA</p>
                    <p className="font-bold">SUPERVISOR</p>
                </div>
                <div className="flex flex-col mt-4">
                    <p>Firma:</p>
                    <p>Nombres y Apellidos</p>
                    <p>DNI:</p>
                    <p>Fecha</p>
                </div>
            </div>
        </>
    )
}

interface PropsTextoTardanza {
    fechas?: Date[]
    cantTardanzasInjustificadas?: number
}

const TextoTardanza = ({fechas ,cantTardanzasInjustificadas}: PropsTextoTardanza) => {
    return (
        <p className="text-justify">
            Por medio de la presente nos dirigimos a Ud. para manifestarle nuestra desición de formularle la <span className="font-bold">Amonestación Escrita</span> por la actitud asumida por su persona al haber incurrido en 04 TARDANZAS (03, 16, 26 y 28 de febrero)
        </p>
    )
}

interface PropsTextoFalta {
    fecha?: Date
    cantFaltasInjustificadas?: number
}
const TextoFalta = ({fecha, cantFaltasInjustificadas}: PropsTextoFalta) => {
    return (
        <p className="text-justify">
            Por medio de la presente nos dirigimos a Ud. para manifestarle nuestra desición de formularle la <span className="font-bold">Amonestación Escrita</span> por la actitud asumida por su persona el <span className="font-bold">03 de marzo de 2026</span> al haber incurrido en <span className="font-bold">1 Falta injustificada</span>
        </p>
    )
}