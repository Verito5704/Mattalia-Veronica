import { ClientRecord } from '../types';

export const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: 'c1',
    prioridad: 'Alta',
    grupo: 'Prueba',
    compania: 'BeCall',
    cliente: 'Unicef',
    lineaNegocio: 'Sales',
    canalAtencion: 'Voz',
    modoCaptura: 'TBD',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Pruebas CSuite',
    observaciones: 'Definir dónde nos disponibilizan audios o modo captura - 9 Sept',
    grupoTeams: 'CalibrAIte - BeCall Unicef',
    diagnostico: 'Pendiente definición de audios',
    estadoCarpeta: 'Audios pendientes',
    folderChecklist: {
      audios: 'no_hay',
      scorecard: 'pendiente',
      evaluacionManual: 'no_hay',
      usuarios: 'no_lista',
      detalles: 'Definir fuente de audios'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Doing',
      initialSetup: 'To Do',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'To Do'
    },
    preRequisitos: 'Definir dónde nos disponibilizan audios o modo captura',
    informadoPor: 'Alex',
    fechaLimitePreRequisito: '2026-09-09',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Definir dónde nos disponibilizan audios o modo captura - 9 Sept'
  },
  {
    id: 'c2',
    prioridad: 'Alta',
    grupo: 'Prueba',
    compania: 'Apex',
    cliente: 'Teco Fibertel',
    lineaNegocio: 'Atención Clientes',
    canalAtencion: 'Voz',
    modoCaptura: 'TBD',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Pruebas CSuite',
    observaciones: 'Mostrar resultados de pruebas y correr otra prueba, pedir audios 50 con sus respectivas calificaciones manuales',
    grupoTeams: 'Apex - Teco Fibertel CSuite',
    diagnostico: 'Audios muestra insuficientes',
    estadoCarpeta: '50 audios solicitados',
    folderChecklist: {
      audios: 'parcial',
      scorecard: 'ok',
      evaluacionManual: 'no_hay',
      usuarios: 'vacio',
      detalles: 'Pedir 50 audios con calificaciones manuales'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Done',
      scorecardPrompt: 'Doing',
      audioTesting: 'Doing',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'To Do'
    },
    preRequisitos: '50 audios con calificaciones manuales para correlación',
    informadoPor: 'CharlyA',
    fechaLimitePreRequisito: '2026-09-10',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Mostrar resultados de pruebas y correr otra prueba'
  },
  {
    id: 'c3',
    prioridad: 'Alta',
    grupo: 'Prueba',
    compania: 'TBPO',
    cliente: 'Midea',
    lineaNegocio: 'CX',
    canalAtencion: 'Voz',
    modoCaptura: 'TBD',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Pruebas CSuite',
    observaciones: 'Mostrar resultados de pruebas y correr otra prueba, pedir audios 50 con sus respectivas calificaciones manuales',
    grupoTeams: 'TBPO - Midea QA Hub',
    diagnostico: 'Calificaciones manuales pendientes',
    estadoCarpeta: 'Carpeta en revisión',
    folderChecklist: {
      audios: 'parcial',
      scorecard: 'ok',
      evaluacionManual: 'no_visualiza',
      usuarios: 'no_lista',
      detalles: 'Se requieren 50 muestras validadas'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Doing',
      scorecardPrompt: 'Doing',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'To Do'
    },
    preRequisitos: '50 audios y calibración de rúbrica',
    informadoPor: 'Alex',
    fechaLimitePreRequisito: '2026-09-10',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Mostrar resultados y calibrar matriz'
  },
  {
    id: 'c4',
    prioridad: 'Alta',
    grupo: 'Grupo 1',
    compania: 'BeCall',
    cliente: 'Asisa',
    lineaNegocio: 'Sales',
    canalAtencion: 'Voz',
    modoCaptura: '',
    tipoCuenta: 'En Calibraite V1 - Con problemas',
    decision: 'Migrar Grupo 1',
    estado: 'Sin migrar',
    observaciones: 'Cliente crítico en V1 con errores de captura y latencia',
    grupoTeams: 'BeCall - Asisa Migración V2',
    diagnostico: 'Migración prioritaria requerida',
    estadoCarpeta: 'Carpeta V1 pendiente de traspaso',
    folderChecklist: {
      audios: 'ok',
      scorecard: 'ok',
      evaluacionManual: 'no_visualiza',
      usuarios: 'no_lista'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Doing',
      initialSetup: 'To Do',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'To Do'
    },
    preRequisitos: 'Definición de plan de rollback y matriz de agentes',
    informadoPor: 'Laura Sanchez',
    fechaLimitePreRequisito: '2026-09-12',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Coordinar con BeCall fecha de traspaso de credenciales'
  },
  {
    id: 'c5',
    prioridad: 'Alta',
    grupo: 'Grupo 1',
    compania: 'Apex',
    cliente: 'Sky',
    lineaNegocio: 'Servicios',
    canalAtencion: 'Voz',
    modoCaptura: '',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Migrar Grupo 1',
    estado: 'Sin migrar',
    observaciones: '12 Octubre Golive Operativo comprometido con gerencia',
    grupoTeams: 'Apex - Sky Operaciones Calidad',
    diagnostico: 'Kickoff completado, pendiente relevamiento de conectores',
    estadoCarpeta: 'Carpeta creada - pendiente documentos de seguridad',
    folderChecklist: {
      audios: 'no_hay',
      scorecard: 'pendiente',
      evaluacionManual: 'no_hay',
      usuarios: 'vacio'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Doing',
      initialSetup: 'To Do',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'To Do'
    },
    preRequisitos: 'Validación de seguridad de red y puertos de captura',
    informadoPor: 'CharlyA',
    fechaLimitePreRequisito: '2026-09-15',
    goLiveInicio: '2026-10-12',
    goLiveFin: '2026-10-16',
    proximosPasos: 'Preparar arquitectura de integración antes del 15 Sep'
  },
  {
    id: 'c6',
    prioridad: 'Media',
    grupo: 'Grupo 1',
    compania: 'Onesource',
    cliente: 'TPG',
    lineaNegocio: 'Sales',
    canalAtencion: 'Voz',
    modoCaptura: '',
    tipoCuenta: 'En Calibraite V1 - OnGoing',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Monitoreo en curso en V1, planificar ventana de corte',
    grupoTeams: 'Onesource - TPG Implementation',
    diagnostico: 'Operación estable en V1, migración en segunda ola',
    estadoCarpeta: 'Carpeta compartida pendiente revisión',
    folderChecklist: {
      audios: 'ok',
      scorecard: 'borrador',
      evaluacionManual: 'ok',
      usuarios: 'enviado_mail'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'To Do',
      initialSetup: 'To Do',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'To Do'
    },
    preRequisitos: 'Confirmación de inventario de licencias',
    informadoPor: 'Andres Posada',
    fechaLimitePreRequisito: '2026-09-18',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Reunión de alineación con Onesource'
  },
  {
    id: 'c7',
    prioridad: 'Alta',
    grupo: 'Grupo 1 A',
    compania: 'Solvo',
    cliente: '4_Operations Coaching Process',
    lineaNegocio: 'Andres Posada',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta OK. Avanzado en validación conjunta.',
    grupoTeams: 'CalibrAIte Suite Implementation - SF Solvo',
    diagnostico: 'Audios, scorecard, carpeta de resultado de pruebas vacio',
    estadoCarpeta: 'Audios: ok | Scorecard: ok | Evaluacion manual: no se visualiza | Usuarios: falta lista',
    folderChecklist: {
      audios: 'ok',
      scorecard: 'ok',
      evaluacionManual: 'no_visualiza',
      usuarios: 'no_lista',
      detalles: '8-9 Audios ok, Scorecard ok, Eval manual no se visualiza, Usuarios sin lista'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Done',
      scorecardPrompt: 'Done',
      audioTesting: 'Done',
      jointValidation: 'Done',
      adjustmentsRetesting: 'Doing',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'Manual enviado'
    },
    preRequisitos: 'Whitelist\nUsuarios\nInstalación Widget\nConfiguracion de la cuota\nConfigurar permisos usuarios',
    informadoPor: 'Lugar: Teams | Responsable: Alex | Imple: CharlyA',
    fechaLimitePreRequisito: '2026-09-11',
    goLiveInicio: '2026-09-11',
    goLiveFin: '2026-09-21',
    proximosPasos: 'Whitelist+Micro: Doing | Cuota y usuarios: Preguntar | Instalacion widget: Depende jueves 10 Sep | Monitoreo 5 usuarios x 3 días (11 al 15 sep) | Reunión con cliente aprobación (16 sep) | Despliegue masivo (17 sep) | GoLive 21/Sep OK con Dashboards'
  },
  {
    id: 'c8',
    prioridad: 'Alta',
    grupo: 'Grupo 1 A',
    compania: 'Solvo',
    cliente: '5_WBR / Weekly Business Review',
    lineaNegocio: 'Andres Posada',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta OK pero sin audios cargados',
    grupoTeams: 'CalibrAIte Suite Implementation - SF Solvo',
    diagnostico: 'Sin audios en carpeta',
    estadoCarpeta: 'Audios: No hay | Evaluacion manual: no se visualiza | Scorecard: ok | Usuarios: falta lista',
    folderChecklist: {
      audios: 'no_hay',
      scorecard: 'ok',
      evaluacionManual: 'no_visualiza',
      usuarios: 'no_lista'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Doing',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'Manual enviado'
    },
    preRequisitos: 'Whitelist\nUsuarios\nInstalación Widget\nConfiguracion de la cuota\nConfigurar permisos usuarios',
    informadoPor: 'Lugar: Teams | Responsable: Alex',
    fechaLimitePreRequisito: '2026-09-11',
    goLiveInicio: '2026-09-11',
    goLiveFin: '2026-09-21',
    proximosPasos: 'Reclamar audios urgentes para poder avanzar con Initial Setup y Scorecard'
  },
  {
    id: 'c9',
    prioridad: 'Alta',
    grupo: 'Grupo 1 A',
    compania: 'Solvo',
    cliente: '9_SDR Process',
    lineaNegocio: 'Erin Killian',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta OK. Cliente informó que envió usuarios por correo.',
    grupoTeams: 'CalibrAIte Suite - SDR Process',
    diagnostico: 'Audios, scorecard, evaluaciones en carpeta',
    estadoCarpeta: 'Audios: ok | Scorecard: ok | Eval manual: no se visualiza | Usuarios: enviado por mail',
    folderChecklist: {
      audios: 'ok',
      scorecard: 'ok',
      evaluacionManual: 'no_visualiza',
      usuarios: 'enviado_mail'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Doing',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'Manual enviado'
    },
    preRequisitos: 'Whitelist\nUsuarios\nInstalación Widget\nConfiguracion de la cuota\nConfigurar permisos usuarios',
    informadoPor: 'Lugar: Teams | Responsable: Alex | Imple: CharlyA',
    fechaLimitePreRequisito: '2026-09-11',
    goLiveInicio: '2026-09-11',
    goLiveFin: '2026-09-21',
    proximosPasos: 'Validar lista de usuarios enviada por mail e integrarla a Initial Setup'
  },
  {
    id: 'c10',
    prioridad: 'Alta',
    grupo: 'Grupo 1 A',
    compania: 'Solvo',
    cliente: '1_IA for Sales / Initial Appointment',
    lineaNegocio: 'Gus Perez - Operations and Sales Manager',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta Doing (3 videollamadas. Pending Folder Jacquelyn Flannery and Juan Fernando Diaz. Scorecard borrador compartido)',
    grupoTeams: 'CalibrAIte Suite - IA for Sales / Initial Appointment',
    diagnostico: 'Solo 3 videollamadas disponibles. Carpetas pendientes.',
    estadoCarpeta: 'Audios: solo 3 | Evaluacion manual: no se visualiza | Scorecard: revisar hora scorecard | Usuarios: vacio',
    folderChecklist: {
      audios: 'parcial',
      scorecard: 'borrador',
      evaluacionManual: 'no_visualiza',
      usuarios: 'vacio',
      detalles: 'Solo 3 audios cargados'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Doing',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'Manual enviado'
    },
    preRequisitos: 'Whitelist\nUsuarios\nInstalación Widget\nConfiguracion de la cuota\nConfigurar permisos usuarios',
    informadoPor: 'Lugar: Teams | Responsable: Alex | Imple: CharlyA',
    fechaLimitePreRequisito: '2026-09-11',
    goLiveInicio: '2026-09-11',
    goLiveFin: '2026-09-21',
    proximosPasos: 'Revisar con cliente horario scorecard y exigir usuarios antes del límite 11-Sept'
  },
  {
    id: 'c11',
    prioridad: 'Alta',
    grupo: 'Grupo 1 B',
    compania: 'Solvo',
    cliente: '2_Alignment Call',
    lineaNegocio: 'Jose Gordo - Laura Sanchez - Chief Talent Officer',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta OK - Mesa trabajo (Priorizado por Laura)',
    grupoTeams: 'CalibrAIte Suite - Procesos de reclutamiento',
    diagnostico: 'Scorecard, no tenemos acceso a links de grabaciones. No hay evaluaciones manuales para comparar.',
    estadoCarpeta: 'Sin acceso a links de grabaciones | Sin evaluaciones manuales',
    folderChecklist: {
      audios: 'vacio',
      scorecard: 'ok',
      evaluacionManual: 'no_hay',
      usuarios: 'no_lista'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Doing',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'Manual enviado'
    },
    preRequisitos: 'Whitelist\nUsuarios\nInstalación Widget\nConfiguracion cuota y permisos',
    informadoPor: 'Lugar: Teams | Responsable: Alex | Imple: CharlyA',
    fechaLimitePreRequisito: '2026-09-11',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Laura Sanchez debe brindar acceso a links de grabaciones'
  },
  {
    id: 'c12',
    prioridad: 'Alta',
    grupo: 'Grupo 1',
    compania: 'Solvo',
    cliente: '3_Ops Call / Operational Call',
    lineaNegocio: 'Jose Gordo - Andres Posada',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión Pte - Carpeta OK',
    grupoTeams: 'Operation Call - CalibrAIte Suite',
    diagnostico: 'Sin información',
    estadoCarpeta: 'Carpeta creada pero sin contenido',
    folderChecklist: {
      audios: 'no_hay',
      scorecard: 'pendiente',
      evaluacionManual: 'no_hay',
      usuarios: 'vacio'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'To Do',
      initialSetup: 'To Do',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: ''
    },
    preRequisitos: 'Agendar reunión operativa y cargar documentos base',
    informadoPor: 'Alex',
    fechaLimitePreRequisito: '2026-09-14',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Reunión de diagnóstico con Jose Gordo'
  },
  {
    id: 'c13',
    prioridad: 'Alta',
    grupo: 'Grupo 1',
    compania: 'Solvo',
    cliente: '6_Touch Base Call (POC / Activation Lead)',
    lineaNegocio: 'Jose Gordo - Andres Posada (Gustavo Rodríguez)',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta Pte - Mesa trabajo',
    grupoTeams: 'CalibrAIte Suite - Procesos de reclutamiento',
    diagnostico: 'En espera de carpeta compartida',
    estadoCarpeta: 'Carpeta pendiente',
    folderChecklist: {
      audios: 'no_hay',
      scorecard: 'pendiente',
      evaluacionManual: 'no_hay',
      usuarios: 'no_lista'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Standby',
      initialSetup: 'To Do',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: ''
    },
    preRequisitos: 'Acceso a carpeta compartida por parte de Solvo',
    informadoPor: 'Alex',
    fechaLimitePreRequisito: '2026-09-13',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Destrabar carpeta con Gustavo Rodríguez'
  },
  {
    id: 'c14',
    prioridad: 'Alta',
    grupo: 'Grupo 1 B',
    compania: 'Solvo',
    cliente: '7_Recruiter – Candidate Interview',
    lineaNegocio: 'Laura Sanchez - Chief Talent Officer (Catalina Chavez)',
    canalAtencion: 'Voz',
    modoCaptura: 'Si',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta OK - Mesa trabajo',
    grupoTeams: 'CalibrAIte Suite - Procesos de reclutamiento',
    diagnostico: 'Scorecard. Grabaciones. No hay evaluaciones manuales para comparar.',
    estadoCarpeta: 'Falta carga de evaluaciones manuales de comparación',
    folderChecklist: {
      audios: 'ok',
      scorecard: 'ok',
      evaluacionManual: 'no_hay',
      usuarios: 'no_lista'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Done',
      initialSetup: 'Doing',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: 'Manual enviado'
    },
    preRequisitos: 'Whitelist\nUsuarios\nInstalación Widget\nConfigurar permisos',
    informadoPor: 'Lugar: Teams | Responsable: Alex | Imple: CharlyA',
    fechaLimitePreRequisito: '2026-09-11',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Solicitar evaluaciones manuales a Catalina Chavez'
  },
  {
    id: 'c15',
    prioridad: 'Alta',
    grupo: 'Grupo 1',
    compania: 'Solvo',
    cliente: '8_Client – Candidate Interview',
    lineaNegocio: 'Laura Sanchez - Chief Talent Officer (Gustavo Rodríguez)',
    canalAtencion: 'Voz',
    modoCaptura: 'TBD',
    tipoCuenta: 'Cuenta Nueva',
    decision: 'Despliegue - Grupo 1',
    estado: 'Sin implementar',
    observaciones: 'Reunión OK - Carpeta Pte - Mesa trabajo',
    grupoTeams: 'CalibrAIte Suite - Procesos de reclutamiento',
    diagnostico: 'Sin información',
    estadoCarpeta: 'Carpeta pendiente',
    folderChecklist: {
      audios: 'no_hay',
      scorecard: 'pendiente',
      evaluacionManual: 'no_hay',
      usuarios: 'no_lista'
    },
    etapas: {
      kickoff: 'Done',
      infoGathering: 'Standby',
      initialSetup: 'To Do',
      scorecardPrompt: 'To Do',
      audioTesting: 'To Do',
      jointValidation: 'To Do',
      adjustmentsRetesting: 'To Do',
      captureInstallation: 'To Do',
      goLiveTraining: 'To Do',
      modoCaptura: ''
    },
    preRequisitos: 'Relevamiento inicial y entrega de carpeta',
    informadoPor: 'Laura Sanchez',
    fechaLimitePreRequisito: '2026-09-14',
    goLiveInicio: '',
    goLiveFin: '',
    proximosPasos: 'Esperar resolución de Touch Base Call antes de avanzar'
  }
];

const STORAGE_KEY = 'calibraite_implementacion_clients_v1';

export function loadSavedClients(): ClientRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.cliente && parsed[0]?.etapas) {
        return parsed.map((c: any) => ({
          ...c,
          folderChecklist: c.folderChecklist || {
            audios: 'vacio',
            scorecard: 'pendiente',
            evaluacionManual: 'no_hay',
            usuarios: 'vacio'
          },
          etapas: c.etapas || {}
        }));
      }
    }
  } catch (err) {
    console.error('Error loading saved clients:', err);
  }
  return INITIAL_CLIENTS;
}

export function saveClients(clients: ClientRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Error saving clients:', err);
  }
}

export function resetClientsToDefault(): ClientRecord[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error resetting clients:', err);
  }
  return INITIAL_CLIENTS;
}

