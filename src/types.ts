export type StageStatus = 'To Do' | 'Doing' | 'Done' | 'Standby' | 'Blocked' | 'Manual enviado' | '';

export interface StageDefinition {
  id: string;
  name: string;
  shortName: string;
  order: number;
}

export const STAGES_LIST: StageDefinition[] = [
  { id: 'kickoff', name: 'Presentación y demostración', shortName: 'Presentación y demo', order: 1 },
  { id: 'infoGathering', name: 'Recopilación de información', shortName: 'Recopilación info.', order: 2 },
  { id: 'initialSetup', name: 'Configuración inicial', shortName: 'Config. inicial', order: 3 },
  { id: 'scorecardPrompt', name: 'Configuración del cuadro de mando y de las indicaciones.', shortName: 'Cuadro de mando e indic.', order: 4 },
  { id: 'audioTesting', name: 'Pruebas de audio', shortName: 'Pruebas de audio', order: 5 },
  { id: 'jointValidation', name: 'Validación conjunta', shortName: 'Validación conjunta', order: 6 },
  { id: 'adjustmentsRetesting', name: 'Ajustes y nuevas pruebas', shortName: 'Ajustes y pruebas', order: 7 },
  { id: 'captureInstallation', name: 'Instalación de captura', shortName: 'Instalación captura', order: 8 },
  { id: 'goLiveTraining', name: 'Puesta en marcha y formación', shortName: 'Puesta en marcha', order: 9 },
  { id: 'modoCaptura', name: 'Modo captura', shortName: 'Modo captura', order: 10 },
];

export interface FolderChecklist {
  audios: 'ok' | 'parcial' | 'vacio' | 'no_hay';
  scorecard: 'ok' | 'borrador' | 'pendiente';
  evaluacionManual: 'ok' | 'no_visualiza' | 'no_hay' | 'vacio';
  usuarios: 'ok' | 'enviado_mail' | 'no_lista' | 'vacio';
  detalles?: string;
}

export interface ClientRecord {
  id: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  grupo: string; // 'Prueba' | 'Grupo 1' | 'Grupo 1 A' | 'Grupo 1 B'
  compania: string; // 'Solvo' | 'BeCall' | 'Apex' | 'TBPO' | 'Onesource'
  pais?: string; // e.g. Argentina, Colombia, etc.
  cliente: string; // Nombre del proceso / cliente
  lineaNegocio: string; // Línea de negocio / Contacto
  canalAtencion: string; // e.g. 'Voz'
  modoCaptura: string; // 'Si' | 'TBD' | 'Manual enviado' | ''
  tipoCuenta: string; // 'Cuenta Nueva' | 'En Calibraite V1 - Con problemas' | 'En Calibraite V1 - OnGoing'
  decision: string; // 'Despliegue - Grupo 1' | 'Migrar Grupo 1'
  estado: string; // 'Sin implementar' | 'Pruebas CSuite' | 'Sin migrar' | 'En curso' | 'Finalizado'
  observaciones: string;
  grupoTeams: string;
  diagnostico: string;
  estadoCarpeta: string;
  folderChecklist: FolderChecklist;
  etapas: Record<string, StageStatus>;
  preRequisitos: string;
  informadoPor: string;
  fechaLimitePreRequisito: string;
  goLiveCompleto?: string; // Go-Live completo de traspaso
  paralelo?: string; // Paralelo de traspaso
  goLiveInicio: string;
  goLiveFin: string;
  proximosPasos: string;
  diasSeguimiento?: string;
  alertasPersonalizadas?: string[];
  origenTraspaso?: boolean; // Para saber si vino de clientes a traspasar
  updatedAt?: string;
}

export interface ClientAToJRecord {
  id: string;
  prioridad: 'Alta' | 'Media' | 'Baja' | string;
  grupo: string; // Grupo
  compania: string; // Indique el BPO / Compañía
  pais?: string; // Pais
  cliente: string; // Indique el cliente
  lineaNegocio: string; // Indique la linea de negocio del Cliente
  goLiveCompleto?: string; // Go-Live completo
  paralelo?: string; // Paralelo
  canalAtencion: string; // Canal de atencion
  modoCaptura?: string;
  tipoCuenta?: string;
  decision?: string;
  estado?: string;
  observaciones?: string;
}

export interface RoadmapRecord {
  id: string;
  prioridad: 'Alta' | 'Media' | 'Baja' | string;
  categoria?: string;
  features: string;
  descripcion: string;
  responsable: string;
  fechaInicio?: string;
  fechaCompromiso: string;
  fechaEntrega: string;
  notas: string;
}

export type ViewMode = 'matriz' | 'traspasar' | 'nuevos' | 'metricas' | 'pipeline' | 'alertas' | 'cronograma' | 'roadmap';
