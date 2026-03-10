import { CompromisoPage } from "@/components/feedback/compromisoMejora/CompromisoPage";
import { SideTable } from "@/components/feedback/compromisoMejora/SideTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CompromisoMejoraPage() {
    return (
        <div>
            <Link href={"/dashboard/feedback/historialSupervisores"} className="text-xs flex mb-2 cursor-pointer text-gray-500">
                <ArrowLeft size={15} />
                <p className="self-center">Volver a la pagina anterior</p>
            </Link>
            <div className="flex flex-row">
                {/* // *SIDE BAR*/}
                <SideTable />
                <hr className="border-gray-100 border h-auto ml-2 w-0.5 dark:border-zinc-500 flex-initial" />
                <CompromisoPage />
            </div>
        </div>
    );
}
