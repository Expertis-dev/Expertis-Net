"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DetailModal } from "./detail-modal";
import type { BaseTableProps, SortDirection, DetalleAsesor } from "@/types/Bases";

export default function BaseTable({ columnas, datos = [], datosGlobales }: BaseTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<DetalleAsesor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSort = (columna: string) => {
    if (sortColumn === columna) {
      // Ciclar entre: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columna);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columna: string) => {
    if (sortColumn !== columna) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4 ml-1" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4 ml-1" />;
    }
    return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
  };

  const sortedDatos = [...datos].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Manejar valores undefined o null
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    // Convertir a número si es posible
    const aNum = parseFloat(String(aValue).replace('%', ''));
    const bNum = parseFloat(String(bValue).replace('%', ''));

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  // Calcular totales para cada columna
  const calcularTotales = (): Record<string, string | number> => {
    const totales: Record<string, string | number> = {};
    
    columnas.forEach((columna, index) => {
      if (index === 0) {
        totales[columna] = "TOTAL";
      } else {
        const valores = datos.map(fila => {
          const valor = fila[columna];
          if (valor === undefined || valor === null) return 0;

          const numStr = String(valor).replace(/[%,$]/g, '').trim();
          const num = parseFloat(numStr);
          
          return isNaN(num) ? 0 : num;
        });
        
        const suma = valores.reduce((acc, val) => acc + val, 0);
        
        const todosStrings = datos.every(fila => {
          const valor = fila[columna];
          return valor === undefined || valor === null || isNaN(parseFloat(String(valor).replace(/[%,$]/g, '')));
        });
        
        if (suma === 0 && todosStrings) {
          totales[columna] = "-";
        } else {
          totales[columna] = suma % 1 === 0 ? suma : suma.toFixed(2);
        }
      }
    });
    
    return totales;
  };

  const totales = datos.length > 0 ? calcularTotales() : null;

  const AbrirModal = (fila: Record<string, string | number>) => {
    // Verificar que hay gestiones y datos globales
    if (!datosGlobales || fila["Total gestionados"] === 0) return;
    
    const asesor = fila.Asesor as string;
    
    console.log("Asesor seleccionado:", asesor);
    console.log("DATOS GLOBALES", datosGlobales);
    console.log("GESTIONES DETALLADAS", datosGlobales.gestiones_detalladas_por_asesor[asesor]);
    console.log("GESTIONES NO GESTIONADAS", datosGlobales.no_gestionados_por_asesor[asesor]);
    
    setDetalleSeleccionado({
      gestionesDetalladas: datosGlobales.gestiones_detalladas_por_asesor[asesor] || [],
      gestionesNoGestionadas: datosGlobales.no_gestionados_por_asesor[asesor] || []
    });
    setIsModalOpen(true);
  };

  return (
    <div className="rounded-lg overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-100">
            {columnas.map((col) => (
              <TableHead 
                key={col} 
                className="text-foreground font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort(col)}
              >
                <div className="flex items-center">
                  {col}
                  {getSortIcon(col)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
            
        <TableBody>
          {datos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnas.length} className="text-center py-8 text-foreground">
                No hay datos para mostrar. Procese un archivo para ver los resultados.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedDatos.map((fila, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  onClick={() => AbrirModal(fila)} 
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  {columnas.map((columna, colIndex) => (
                    <TableCell key={colIndex} className="text-foreground">
                      {fila[columna] !== undefined ? fila[columna] : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              {/* Fila de totales */}
              {totales && (
                <TableRow className="text-foreground font-semibold bg-muted/30">
                  {columnas.map((columna, colIndex) => (
                    <TableCell key={colIndex} className="text-foreground">
                      {totales[columna]}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>

      {/* Footer con total de registros */}
      {datos.length > 0 && (
        <div className="bg-muted px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Total de asesores: <span className="font-medium text-foreground">{datos.length}</span>
            {sortColumn && sortDirection && (
              <span className="ml-4">
                Ordenado por: <span className="font-medium">{sortColumn}</span> ({sortDirection === 'asc' ? 'Ascendente' : 'Descendente'})
              </span>
            )}
          </p>
        </div>
      )}
      
      <DetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        detalle={detalleSeleccionado} 
      />
    </div>
  );
}