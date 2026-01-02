import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, AlertCircle, Calendar, Loader2 } from "lucide-react";
import type { VistaActiva } from "@/types/Bases";

// Header
interface HeaderProps {
  title: string;
  subtitle: string;
  onUploadClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  extraActions?: React.ReactNode;
}

export const BaseHeader = ({ title, subtitle, onUploadClick, extraActions }: HeaderProps) => (
  <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      {extraActions}
      <input 
        type="file" 
        id="fileInput" 
        accept=".xlsx,.xls" 
        onChange={onUploadClick} 
        className="hidden" 
      />
      {!extraActions && (
        <Button variant="default" onClick={() => document.getElementById("fileInput")?.click()} className="gap-2 shadow-sm">
          <Upload className="w-4 h-4" /> Cargar Archivo
        </Button>
      )}
    </div>
  </header>
);

// File Status
interface FileStatusProps {
  file: File | null;
  onClear: () => void;
  error: string | null;
}

export const FileStatus = ({ file, onClear, error }: FileStatusProps) => (
  <div className="space-y-4">
    <div className="bg-card border rounded-lg">
      {file ? (
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 rounded-lg p-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClear} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-muted-foreground p-4">
          <div className="bg-muted rounded-lg p-1">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <p className="text-sm">Ningún archivo seleccionado</p>
        </div>
      )}
    </div>
    {error && (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2 text-destructive">
        <AlertCircle className="w-5 h-5" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    )}
  </div>
);

// Process Filter
interface FilterProps {
  dateStart: string;
  dateEnd: string;
  maxDate: string; // Recibimos la fecha tope
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  onProcess: () => void;
  loading: boolean;
  blocked: boolean;
  requirementsText?: string;
}

export const ProcessFilters = ({ 
  dateStart, 
  dateEnd, 
  maxDate,
  onStartChange, 
  onEndChange, 
  onProcess, 
  loading, 
  blocked,
  requirementsText
}: FilterProps) => (
  <section className="space-y-6">
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">Configuración de Filtros</h2>
      {/* Usamos el texto dinámico o el valor por defecto si no viene nada */}
      <p className="text-sm text-muted-foreground">
        {requirementsText || "Requisito: Columnas Documento, Cartera y Asesor."}
      </p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha inicio</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="date" 
              max={maxDate}
              value={dateStart} 
              onChange={(e) => onStartChange(e.target.value)} 
              className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha fin</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <input 
               type="date" 
               max={maxDate}
               value={dateEnd} 
               onChange={(e) => onEndChange(e.target.value)} 
               className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
             />
          </div>
        </div>
      </div>
      <div className="flex items-end">
        <Button onClick={onProcess} disabled={loading || blocked} className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
            </div>
          ) : (
            "Procesar Información"
          )}
        </Button>
      </div>
    </div>
  </section>
);

// View Tabs
interface ViewSelectorProps {
  activeView: VistaActiva;
  onViewChange: (view: VistaActiva) => void;
}

export const ViewSelector = ({ activeView, onViewChange }: ViewSelectorProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Button 
      variant={activeView === "nvl1" ? "default" : "outline"} 
      size="sm" 
      onClick={() => onViewChange("nvl1")} 
      className="px-4"
    >
      Vista Nivel 1
    </Button>
    <Button 
      variant={activeView === "nvl2" ? "default" : "outline"} 
      size="sm" 
      onClick={() => onViewChange("nvl2")} 
      className="px-4"
    >
      Vista Nivel 2
    </Button>
    <Button 
      variant={activeView === "horas" ? "default" : "outline"} 
      size="sm" 
      onClick={() => onViewChange("horas")} 
      className="px-4"
    >
      Vista Horas
    </Button>
  </div>
);