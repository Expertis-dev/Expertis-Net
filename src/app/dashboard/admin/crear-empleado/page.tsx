"use client"
import { motion } from "framer-motion"
import { Controller } from "react-hook-form";
import { AutoComplete } from "@/components/autoComplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useJefes } from "@/hooks/useJefe";
import { Jefe } from "@/types/Empleado";
import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { LoadingModal } from "@/components/loading-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CargarActividad } from "@/services/CargarActividad";
import { useUser } from "@/Provider/UserProvider";

interface EmpleadoForm {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    dni: string;
    telefono: string;
    fechaIngreso: string;
    usuario: string;
    contrasenia: string;
    jefe: Jefe | null;
    area: string;
    rol: string
}

export default function CrearEmpleado() {
    const { user } = useUser()
    const { jefes } = useJefes();
    const [newEmpleado, setNewEmpleado] = useState<EmpleadoForm>()
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [jefe, setJefe] = useState<Jefe | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        trigger,
        control,
    } = useForm<EmpleadoForm>({
        defaultValues: {
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            dni: "",
            telefono: "",
            fechaIngreso: "",
            usuario: "",
            contrasenia: "",
            jefe: null,
            area: "",
        },
        mode: "onSubmit",
    });
    // Registrar validación para jefe (como campo virtual controlado)
    useEffect(() => {
        // Importante: solo registra una vez
        register("jefe", {
            validate: (value) => (value ? true : "Debe seleccionar un jefe a cargo"),
        });
    }, [register]);
    // --- Validaciones ---
    const validateDNI = (dni: string) => {
        if (!dni) return "El DNI es requerido";
        if (!/^\d{8}$/.test(dni)) return "El DNI debe tener 8 dígitos";
        return true;
    };
    const validateTelefono = (telefono: string) => {
        if (!telefono) return "El teléfono es requerido";
        if (!/^\d{9}$/.test(telefono)) return "El teléfono debe tener 9 dígitos";
        return true;
    };
    // --- Handlers ---
    const handleJefeSelect = async (selectedJefe: Jefe | null) => {
        setJefe(selectedJefe);
        setValue("jefe", selectedJefe, { shouldValidate: true });
        setValue("area", selectedJefe?.area || "");
        await trigger("jefe");
    };

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Aquí iría tu llamada real a la API
            console.log("Datos del empleado:", newEmpleado);
            // Simulación de request
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crearUser`, {
                method: "POST",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newEmpleado)
            })
            const json = await res.json();
            console.log(json)
            if (!res.ok) throw new Error("Error al obtener justificaciones");
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "Se creo nuevo empleado",
                descripcion: `Se creo un nuevo empleado ${newEmpleado?.usuario}`,
                estado: "completed",
            })
            toast.success("Empleado registrado exitosamente");
            reset();
            setJefe(null);
            setSelectedDate(undefined);
            setShowConfirmation(false)
        } catch (error) {
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "Error al crear empleado",
                descripcion: `No se logro crear el nuevo empleado ${newEmpleado?.usuario}`,
                estado: "error",
            })
            console.error("Error al registrar empleado:", error);
            toast.error("Error al registrar empleado. Intente nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onError = (formErrors: FieldErrors<EmpleadoForm>) => {
        const messages = Object.values(formErrors)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((err: any) => err?.message as string | undefined)
            .filter(Boolean);

        if (messages.length > 0) {
            toast.error(messages[0]); // solo el primer error para no saturar
        } else {
            toast.error("Hay errores en el formulario. Revisa los campos resaltados.");
        }
    };
    const OpenConfirmacion = (data: EmpleadoForm) => {
        const toUpper = (value?: string): string =>
            typeof value === "string" ? value.toUpperCase() : "";
        const dataUpper: EmpleadoForm = {
            ...data,
            nombre: toUpper(data.nombre),
            apellidoPaterno: toUpper(data.apellidoPaterno),
            apellidoMaterno: toUpper(data.apellidoMaterno),
            dni: toUpper(data.dni),
            telefono: toUpper(data.telefono),
            usuario: toUpper(data.usuario),
            area: toUpper(data.area),
            rol: toUpper(data.rol),
            // OJO: contrasenia se deja tal cual
            contrasenia: data.contrasenia,
        };

        setNewEmpleado(dataUpper);
        setShowConfirmation(true);
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
        >
            <div>
                <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">
                    Registro de Empleado
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Complete la información del nuevo empleado
                </p>
            </div>
            {/* Formulario */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            Datos del Empleado
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    reset();
                                    setJefe(null);
                                    setSelectedDate(undefined);
                                    toast.info("Formulario limpiado");
                                }}
                                disabled={isSubmitting}
                                className="px-6 py-3"
                            >
                                Limpiar Formulario
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(OpenConfirmacion, onError)}>
                        {/* Información Personal */}
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre */}
                                <div>
                                    <Label className={errors.nombre ? "text-red-500" : ""}>
                                        Nombre *
                                    </Label>
                                    <Input
                                        id="nombre"
                                        {...register("nombre", {
                                            required: "El nombre es requerido",
                                            minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                        })}
                                        placeholder="Ingrese el nombre"
                                        className={`w-full uppercase  ${errors.nombre
                                            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                            : ""
                                            }`}
                                    />
                                </div>

                                {/* Apellido Paterno */}
                                <div>
                                    <Label
                                        className={errors.apellidoPaterno ? "text-red-500" : ""}
                                    >
                                        Apellido Paterno *
                                    </Label>
                                    <Input
                                        id="apellidoPaterno"
                                        {...register("apellidoPaterno", {
                                            required: "El apellido paterno es requerido",
                                            minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                        })}
                                        placeholder="Ingrese el apellido paterno"
                                        className={`w-full uppercase  ${errors.apellidoPaterno
                                            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                            : ""
                                            }`}
                                    />
                                </div>

                                {/* Apellido Materno */}
                                <div>
                                    <Label
                                        className={errors.apellidoMaterno ? "text-red-500" : ""}
                                    >
                                        Apellido Materno *
                                    </Label>
                                    <Input
                                        id="apellidoMaterno"
                                        {...register("apellidoMaterno", {
                                            required: "El apellido materno es requerido",
                                            minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                        })}
                                        placeholder="Ingrese el apellido materno"
                                        className={`w-full uppercase  ${errors.apellidoMaterno
                                            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                            : ""
                                            }`}
                                    />
                                </div>

                                {/* DNI */}
                                <div>
                                    <Label className={errors.dni ? "text-red-500" : ""}>
                                        DNI *
                                    </Label>
                                    <Input
                                        id="dni"
                                        {...register("dni", {
                                            required: "El DNI es requerido",
                                            validate: validateDNI,
                                        })}
                                        placeholder="12345678"
                                        maxLength={8}
                                        className={`w-full ${errors.dni
                                            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                            : ""
                                            }`}
                                    />
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <Label className={errors.telefono ? "text-red-500" : ""}>
                                        Teléfono *
                                    </Label>
                                    <Input
                                        id="telefono"
                                        {...register("telefono", {
                                            required: "El teléfono es requerido",
                                            validate: validateTelefono,
                                        })}
                                        placeholder="912345678"
                                        maxLength={9}
                                        className={`w-full ${errors.telefono
                                            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                            : ""
                                            }`}
                                    />
                                </div>

                                {/* Fecha de Ingreso */}
                                <div className="flex flex-col">
                                    <Label
                                        className={errors.fechaIngreso ? "text-red-500" : ""}
                                    >
                                        Fecha de Ingreso *
                                    </Label>
                                    {/* Selector con calendario */}
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={`w-full justify-between font-normal ${errors.fechaIngreso
                                                    ? "border-red-500 dark:border-red-400"
                                                    : ""
                                                    }`}
                                            >
                                                {selectedDate
                                                    ? selectedDate.toLocaleDateString("es-PE")
                                                    : "Seleccionar fecha"}
                                                <ChevronDownIcon className="ml-2 h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                selected={selectedDate}
                                                onSelect={(date) => {
                                                    setSelectedDate(date || undefined);
                                                    if (date) {
                                                        const iso = date.toISOString().split("T")[0];
                                                        setValue("fechaIngreso", iso, {
                                                            shouldValidate: true,
                                                        });
                                                        setOpen(false);
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* Información de Cuenta */}
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Usuario */}
                                <div>
                                    <Label className={errors.usuario ? "text-red-500" : ""}>
                                        Usuario *
                                    </Label>
                                    <Input
                                        id="usuario"
                                        {...register("usuario", {
                                            required: "El usuario es requerido",
                                        })}
                                        placeholder="usuario123"
                                        className={`w-full uppercase  ${errors.usuario
                                            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                            : ""
                                            }`}
                                    />
                                </div>
                                {/* Contraseña */}
                                <div>
                                    <Label
                                        className={errors.contrasenia ? "text-red-500" : ""}
                                    >
                                        Contraseña *
                                    </Label>
                                    <Input
                                        id="contrasenia"
                                        type="password"
                                        {...register("contrasenia", {
                                            required: "La contraseña es requerida",
                                            minLength: {
                                                value: 6,
                                                message: "Mínimo 6 caracteres",
                                            },
                                        })}
                                        placeholder="••••••••"
                                        className={`w-full ${errors.contrasenia
                                            ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                            : ""
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Información Laboral */}
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Jefe a Cargo */}
                                <div>
                                    <Label className={errors.jefe ? "text-red-500" : ""}>
                                        Jefe a Cargo *
                                    </Label>
                                    <AutoComplete
                                        employees={jefes}
                                        onSelect={handleJefeSelect}
                                        placeholder="Buscar jefe por nombre..."
                                    />
                                </div>
                                {/* Área */}
                                <div>
                                    <Label>Área</Label>
                                    <Input
                                        id="area"
                                        {...register("area")}
                                        value={jefe?.area || ""}
                                        placeholder="Seleccione un jefe para ver el área"
                                        className="w-full bg-gray-50"
                                        readOnly
                                    />
                                    {!jefe && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            El área se completará automáticamente al seleccionar un
                                            jefe
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Jefe a Cargo */}
                                <div>
                                    <Label className={errors.rol ? "text-red-500" : ""}>
                                        Rol del Empleado *
                                    </Label>
                                    <Controller
                                        name="rol"
                                        control={control}
                                        rules={{ required: "El rol es necesario" }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}

                                            >
                                                <SelectTrigger className={`w-full ${errors.rol
                                                    ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                                    : ""
                                                    }`}>
                                                    <SelectValue placeholder="(Seleccionar)" />
                                                </SelectTrigger>
                                                <SelectContent >
                                                    <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                                    <SelectItem value="COLABORADOR">COLABORADOR</SelectItem>
                                                    <SelectItem value="LIDER AREA">LÍDER ÁREA</SelectItem>
                                                    <SelectItem value="JEFE DE OPERACIONES">
                                                        JEFE DE OPERACIONES
                                                    </SelectItem>
                                                    <SelectItem value="JEFE DE RR.HH">
                                                        JEFE DE RR.HH
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex mt-4 flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-2/3 bg-[#1d3246] hover:bg-[#0e2031] dark:bg-slate-400 
                            dark:text-neutral-900 dark:hover:bg-slate-600 dark:hover:text-white 
                            text-white rounded-xl shadow-md transition duration-300 ease-in-out 
                            transform hover:scale-105 active:scale-95 hover:shadow-xl"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Registrando...</span>
                                    </div>
                                ) : (
                                    "Registrar Empleado"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={onSubmit}
                title="Confirmar Registro"
                message="¿Estás seguro de que deseas crear al empleado?" />
            <LoadingModal isOpen={isSubmitting} message="Procesando registro..." />

        </motion.div>

    );
}
