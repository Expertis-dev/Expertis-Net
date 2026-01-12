This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Requisitos (Speech Analytics)

Nota: Los requisitos listados abajo se infieren del codigo actual del modulo Speech y pueden necesitar validacion funcional con negocio.

### Restricciones del modulo Speech
- RST-01: El modulo Speech debe ejecutarse como parte del frontend web (Next.js).
- RST-02: El modulo debe funcionar en navegadores modernos compatibles con Next.js.
- RST-03: La generacion de reportes (PDF/XLSX) debe realizarse en el cliente.
- RST-04: El acceso a datos y permisos debe integrarse con la autenticacion/roles del sistema existente.

### Requisitos funcionales (RF)
- RF-01: Permitir seleccionar un periodo (fecha desde y hasta) para consultar evaluaciones de calidad.
- RF-02: Mostrar dos vistas de resultados: detalle de llamadas auditadas y resumen por asesor.
- RF-03: Permitir ordenar columnas en las vistas de resultados.
- RF-04: Permitir filtrar por agencia, supervisor, asesor y por columnas (con busqueda y seleccion multiple) cuando el usuario tenga permisos.
- RF-05: Mostrar estados de carga, error, periodo no seleccionado y ausencia de resultados.
- RF-06: Calcular y mostrar KPI y cuartiles por asesor en la vista general.
- RF-07: Permitir generar retroalimentacion para un asesor, incluyendo actitudes, sugerencia y compromiso.
- RF-08: Generar un PDF de feedback con resumen de criterios, evolutivo semanal y firmas.
- RF-09: Permitir visualizar el PDF generado para un asesor.
- RF-10: Permitir exportar datos en formatos de archivo (XLSX y PDF).
- RF-11: Mostrar tablero embebido de Speech Analytics con recarga manual y estados de carga/error.
- RF-12: En Speech Pagos, permitir filtrar por fecha/agencia/supervisor, alternar prometedoras/mejorables y exportar.
- RF-13: En Speech Pagos, permitir ver transcripcion, resumen y observacion de una gestion.
- RF-14: En Speech Reclamos, permitir filtrar por fecha/agencia/supervisor/columnas, ver transcripcion/observacion y exportar.
- RF-15: En Speech Reclamos, permitir reproducir grabaciones cuando exista URL.
- RF-16: Restringir la visualizacion de carteras internas/externas/judiciales segun permisos.
- RF-17: Permitir seleccionar vista detalle/general en Calidad y navegar con paginacion.
- RF-18: Permitir exportar listados de Pagos y Reclamos a Excel.

### Requisitos no funcionales (RNF)
#### Rendimiento
- RNF-PERF-01: La interfaz debe soportar paginacion de resultados para evitar renderizado excesivo.
- RNF-PERF-02: La generacion de PDF debe ejecutarse en el cliente sin bloquear la interfaz.
- RNF-PERF-03: Los filtros y ordenamientos deben responder de forma fluida en vistas con volumen moderado de registros.

#### Fiabilidad/Disponibilidad
- RNF-REL-01: El sistema debe mostrar estados claros de carga, error y ausencia de resultados.
- RNF-REL-02: Los errores de red o de API deben presentarse con mensajes comprensibles para el usuario.
- RNF-REL-03: Los archivos generados deben mantener integridad (sin datos truncados o inconsistentes).

#### Seguridad
- RNF-SEC-01: El acceso a filtros avanzados debe restringirse segun rol/permisos.
- RNF-SEC-02: Los nombres de archivos generados deben sanitizarse para evitar caracteres peligrosos.
- RNF-SEC-03: La aplicacion no debe exponer datos sensibles en mensajes de error visibles al usuario.

#### Usabilidad
- RNF-UX-01: La interfaz debe ser responsive para uso en desktop y mobile.
- RNF-UX-02: Las acciones criticas (generar feedback, ver PDF, exportar) deben ser visibles y accesibles desde la vista.
- RNF-UX-03: La navegacion por paginas debe indicar el estado actual (pagina y total).

#### Mantenibilidad
- RNF-MNT-01: Las funciones de calculo (KPIs, cuartiles, evolutivo) deben estar encapsuladas en utilidades reutilizables.
- RNF-MNT-02: Los componentes UI deben reutilizarse mediante un sistema de componentes compartidos.
- RNF-MNT-03: La logica de permisos debe centralizarse para evitar duplicacion.

#### Compatibilidad
- RNF-COMP-01: La aplicacion debe funcionar en navegadores modernos compatibles con Next.js.
- RNF-COMP-02: La exportacion a XLSX y PDF debe ser compatible con los formatos estandar actuales.

#### Escalabilidad
- RNF-SCAL-01: La UI debe soportar crecimiento de datos mediante paginacion y filtros.
- RNF-SCAL-02: El diseno debe permitir agregar nuevos criterios de evaluacion sin reescribir la vista principal.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
