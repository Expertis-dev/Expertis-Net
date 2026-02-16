export interface Encuesta {
    _id: string;
    surveyId: string;
    title: string;
    description: string;
    urlImage: string;
    category: string;
    createdAt: Date;
    availableFor: string;
    preguntas: Pregunta[];
}

export interface Pregunta {
    _id: string;
    id: number;
    content: string;
    mustAnswer: boolean;
    responseType: responseType;
    options?: Option[];
}

export interface Option {
    _id: string;
    value: number | string;
    label: string;
}


export enum responseType {
    TEXT_LINE = "TEXT_LINE",
    TEXT_AREA = "TEXT_AREA",
    DATE = "DATE",
    BOOLEAN = "BOOLEAN",
    MULTIPLE_SELECT = "MULTIPLE_SELECTS",
    UNIQUE_SELECT = "UNIQUE_SELECT",
    LIST = "LIST"
}


export const RESPONSE_TYPES = [
    { value: "TEXT_LINE", label: "Texto corto" },
    { value: "TEXT_AREA", label: "Texto largo" },
    { value: "DATE", label: "Fecha" },
    { value: "BOOLEAN", label: "Sí/No" },
    { value: "UNIQUE_SELECT", label: "Selección única" },
    { value: "MULTIPLE_SELECT", label: "Selección múltiple" },
    { value: "LIST", label: "Lista desplegable" },
]

export const CATEGORIES = [
    "Satisfacción",
    "Feedback",
    "Evaluación",
    "Encuesta de opinión",
    "Investigación",
    "Otros"
]

export const AGENCIA = [
    'CALL_INTERNO',
    'BPO_EXTERNO',
    'STAFF',
    'EMPLEADOS'
]