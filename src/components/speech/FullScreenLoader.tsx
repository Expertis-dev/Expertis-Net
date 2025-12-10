"use client"

interface FullScreenLoaderProps {
  mensaje?: string
}

export function FullScreenLoader({ mensaje = "Cargando..." }: FullScreenLoaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        fontSize: "1rem",
        color: "#0f172a",
      }}
    >
      {mensaje}
    </div>
  )
}

export default FullScreenLoader
