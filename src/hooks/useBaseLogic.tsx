import { useState, useEffect } from "react";

export const useBaseLogic = (storageKeyPrefix: string, limit: number = 2) => {
  // Fechas por defecto
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const maxDate = getTodayStr();

  const getInitialStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState<string>(maxDate);
  const [dateY, setDateY] = useState<string>(getInitialStartDate());
  
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Control de límites
  const [bloqueado, setBloqueado] = useState<boolean>(false);
  const [contadorProcesos, setContadorProcesos] = useState<number>(0);

    // Cargar estado inicial del localStorage
  useEffect(() => {
    const hoy = getTodayStr();
    const keyConteo = `${storageKeyPrefix}_procesos_realizados`;
    const keyFecha = `${storageKeyPrefix}_fecha_procesos`;

    const contadorGuardado = localStorage.getItem(keyConteo);
    const fechaGuardada = localStorage.getItem(keyFecha);

    if (!fechaGuardada || fechaGuardada !== hoy) {
      localStorage.setItem(keyConteo, "0");
      localStorage.setItem(keyFecha, hoy);
      setContadorProcesos(0);
      setBloqueado(false);
    } else {
      const num = parseInt(contadorGuardado || "0");
      setContadorProcesos(num);
      if (num >= limit) setBloqueado(true);
    }
  }, [storageKeyPrefix, limit]);

 // Manejadores de Fecha
  const handleChangeStartDate = (value: string) => {
    if (value > maxDate) return;
    setDateY(value);
  };

  const handleChangeEndDate = (value: string) => {
    if (value > maxDate) return;
    setDate(value);
  };

  // Manejadores de Archivo 
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoSeleccionado(file);
    setError(null);
    e.target.value = "";
  };

  const handleClearFile = () => {
    setArchivoSeleccionado(null);
    setError(null);
  };

  // Registrar éxito (incrementar contador)
  const registrarProcesoExitoso = () => {
    const nuevoContador = contadorProcesos + 1;
    setContadorProcesos(nuevoContador);
    localStorage.setItem(`${storageKeyPrefix}_procesos_realizados`, nuevoContador.toString());
    localStorage.setItem(`${storageKeyPrefix}_fecha_procesos`, getTodayStr());
    if (nuevoContador >= limit) setBloqueado(true);
  };

  return {
    date,
    dateY,
    maxDate,
    handleChangeStartDate,
    handleChangeEndDate,
    archivoSeleccionado,
    handleFileSelect,
    handleClearFile,
    error,
    setError,
    bloqueado,
    registrarProcesoExitoso,
  };
};