import { LoadingModal } from "@/components/loading-modal";

export default function Loading() {
  return (
    <div>
        <LoadingModal
            isOpen
            message="cargando..."
        />
    </div>
  );
}