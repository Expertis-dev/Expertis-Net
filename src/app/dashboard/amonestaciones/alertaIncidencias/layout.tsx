import { Suspense } from "react";
import Loading from "./loading";

export default function AlertasIncidenciasLayout({
 children
}: {
 children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading/>}>
        <div>
            {children}
        </div>
    </Suspense>
  );
}