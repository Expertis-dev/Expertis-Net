import { CompromisoPage } from "@/components/feedback/compromisoMejora/CompromisoPage";
import { SideTable } from "@/components/feedback/compromisoMejora/SideTable";

export default function CompromisoMejoraPage() {
    return (
        <>
            <div className="flex flex-row">
                {/* // *SIDE BAR*/}
                <SideTable/>
                <hr className="border-gray-100 border h-auto ml-2 w-0.5 dark:border-zinc-500 flex-initial" />
                <CompromisoPage/>
            </div>
        </>
    );
}
