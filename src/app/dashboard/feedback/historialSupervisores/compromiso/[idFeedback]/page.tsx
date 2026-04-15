import { CompromisoPage } from "@/components/feedback/compromisoMejora/CompromisoPage";
import { FeedbackSupervisor, SideTable } from "@/components/feedback/compromisoMejora/SideTable";



const fetchFeedbackXId = async (idFeedback: number): Promise<FeedbackSupervisor> => {
    const fb = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${idFeedback}`).then(r => r.json())
    const data = {
        ...fb,
        resultadoEvaluacion: JSON.parse(fb.resultadoEvaluacion)
    }
    return data
}

export default async function CompromisoMejoraPage({params}: {
    params: Promise<{idFeedback: number}>
}) {

    const {idFeedback: id} = await params
    const feedback = await fetchFeedbackXId(id)

    return (
        <div>
            <div className="flex flex-row">
                {/* // *SIDE BAR*/}
                <hr className="border-gray-100 border h-auto ml-2 w-0.5 dark:border-zinc-500 flex-initial" />
                <CompromisoPage 
                    feedback={feedback}
                />
                <SideTable 
                    Feedback={feedback}
                />
            </div>
        </div>
    );
}
