"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const columnasNvl1 = [
  "Asesor",
  "Total clientes",
  "Total gestionados",
  "Total no gestionados",
  "Porcentaje gestionados",
  "Contacto efectivo",
  "No contacto",
  "Contacto no efectivo",
];

const columnasNvl2 = [
  "Asesor", "VLL", "CAN", "PAR", "PPC", "PPM", "REN", "RPP", "TAT",
  "FAL", "MCT", "DES", "GRB", "HOM", "ILC", "NOC", "NTT"
];

const columnasHoras = [
  "Asesor",
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export default function Bases() {
  // Estado para controlar qué tabla mostrar
  const [vistaActiva, setVistaActiva] = useState("nvl1");

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Resumen de Bases</h1>
          <Button variant="default" size="sm">
            Cargar Excel
          </Button>
        </div>

        {/* File Selection Status */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Ningún archivo seleccionado</p>
        </div>

        {/* Filter Section */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Selecciona las columnas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Asesor:</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="col1">Columna 1</SelectItem>
                  <SelectItem value="col2">Columna 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Documento:</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="col1">Columna 1</SelectItem>
                  <SelectItem value="col2">Columna 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Cartera:</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="col1">Columna 1</SelectItem>
                  <SelectItem value="col2">Columna 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Fecha inicio:</label>
              <input
                type="date"
                defaultValue="2025-11-03"
                className="px-2 py-2 border rounded-md text-sm w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Fecha fin:</label>
              <input
                type="date"
                defaultValue="2025-11-03"
                className="px-2 py-2 border rounded-md text-sm w-full"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mt-4">
            <Button 
              variant={vistaActiva === "nvl1" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setVistaActiva("nvl1")}
            >
              nvl1
            </Button>
            <Button 
              variant={vistaActiva === "nvl2" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setVistaActiva("nvl2")}
            >
              nvl2
            </Button>
            <Button 
              variant={vistaActiva === "horas" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setVistaActiva("horas")}
            >
              horas
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              Procesar y Comparar
            </Button>
          </div>
        </div>

        {/* Tabla nvl1 */}
        {vistaActiva === "nvl1" && (
          <div className="rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  {columnasNvl1.map(col => (
                    <TableHead key={col} className="text-foreground">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <td colSpan={columnasNvl1.length} className="text-center py-8 text-foreground">
                    No hay datos para mostrar
                  </td>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Tabla nvl2 */}
        {vistaActiva === "nvl2" && (
          <div className="rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  {columnasNvl2.map(col => (
                    <TableHead key={col} className="text-foreground">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <td colSpan={columnasNvl2.length} className="text-center py-8 text-foreground">
                    No hay datos para mostrar
                  </td>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Tabla horas */}
        {vistaActiva === "horas" && (
          <div className="rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  {columnasHoras.map(col => (
                    <TableHead key={col} className="text-foreground">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <td colSpan={columnasHoras.length} className="text-center py-8 text-foreground">
                    No hay datos para mostrar
                  </td>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}