import { ClientRecord, STAGES_LIST, StageStatus } from '../types';

export interface AppAlert {
  id: string;
  clientId: string;
  clientName: string;
  compania: string;
  grupo: string;
  grupoTeams: string;
  tipo: 'urgente' | 'proxima' | 'retraso_etapa' | 'carpeta_incompleta';
  titulo: string;
  descripcion: string;
  diasDiferencia?: number;
  etapaAfectada?: string;
  fechaLimite?: string;
}

// Tiempos estimados estándar en días por etapa
export const STAGE_ESTIMATED_DAYS: Record<string, number> = {
  kickoff: 2,
  infoGathering: 3,
  initialSetup: 3,
  scorecardPrompt: 4,
  audioTesting: 3,
  jointValidation: 3,
  adjustmentsRetesting: 2,
  captureInstallation: 2,
  goLiveTraining: 3,
  modoCaptura: 2,
};

export function getClientActiveStage(client: ClientRecord): { stageId: string; stageName: string; status: StageStatus } {
  // Primero buscar si hay alguna en 'Doing'
  for (const stage of STAGES_LIST) {
    if (client.etapas[stage.id] === 'Doing') {
      return { stageId: stage.id, stageName: stage.name, status: 'Doing' };
    }
  }
  // Luego si hay alguna 'Standby' o 'Blocked'
  for (const stage of STAGES_LIST) {
    if (client.etapas[stage.id] === 'Standby' || client.etapas[stage.id] === 'Blocked') {
      return { stageId: stage.id, stageName: stage.name, status: client.etapas[stage.id] };
    }
  }
  // Buscar la primera en 'To Do'
  for (const stage of STAGES_LIST) {
    if (client.etapas[stage.id] === 'To Do') {
      return { stageId: stage.id, stageName: stage.name, status: 'To Do' };
    }
  }
  // Si todas son Done
  const last = STAGES_LIST[STAGES_LIST.length - 2]; // Go-Live
  return { stageId: last.id, stageName: last.name, status: client.etapas[last.id] || 'Done' };
}

export function parseDateSafe(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;

  // Handles 'YYYY-MM-DD'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // Handles '11-sept' or '11-sep'
  const match = dateStr.toLowerCase().match(/^(\d{1,2})[-/]([a-z]{3,4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2];
    const monthMap: Record<string, number> = {
      ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, sept: 8, oct: 9, nov: 10, dic: 11
    };
    const month = monthMap[monthStr] ?? 8;
    return new Date(2026, month, day);
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getDaysDifference(targetDate: Date, referenceDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  // Clear times to count calendar days
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return Math.round((target.getTime() - ref.getTime()) / msPerDay);
}

export function generateAlerts(clients: ClientRecord[], referenceDate: Date = new Date(2026, 8, 8)): AppAlert[] {
  const alerts: AppAlert[] = [];

  for (const client of clients) {
    // 1. Alerta de Pre-requisitos: fecha límite
    if (client.fechaLimitePreRequisito) {
      const targetDate = parseDateSafe(client.fechaLimitePreRequisito);
      if (targetDate) {
        const diffDays = getDaysDifference(targetDate, referenceDate);

        if (diffDays < 0) {
          alerts.push({
            id: `alert-overdue-${client.id}`,
            clientId: client.id,
            clientName: client.cliente,
            compania: client.compania,
            grupo: client.grupo,
            grupoTeams: client.grupoTeams || 'Sin grupo de Teams asignado',
            tipo: 'urgente',
            titulo: `Pre-requisitos vencidos (${Math.abs(diffDays)}d)`,
            descripcion: `La fecha límite (${client.fechaLimitePreRequisito}) ya pasó. Tareas pendientes: ${client.preRequisitos.split('\n').slice(0, 2).join(', ')}`,
            diasDiferencia: diffDays,
            fechaLimite: client.fechaLimitePreRequisito
          });
        } else if (diffDays <= 3) {
          alerts.push({
            id: `alert-due-soon-${client.id}`,
            clientId: client.id,
            clientName: client.cliente,
            compania: client.compania,
            grupo: client.grupo,
            grupoTeams: client.grupoTeams || 'Sin grupo de Teams asignado',
            tipo: 'proxima',
            titulo: diffDays === 0 ? 'Pre-requisitos vencen HOY' : `Pre-requisitos por vencer en ${diffDays} día(s)`,
            descripcion: `Fecha límite: ${client.fechaLimitePreRequisito}. Pre-requisitos: ${client.preRequisitos.split('\n')[0] || 'Validar entrega'}`,
            diasDiferencia: diffDays,
            fechaLimite: client.fechaLimitePreRequisito
          });
        }
      }
    }

    // 2. Alerta de etapa en Standby o Retraso de etapa (> 2 días de estimado)
    const activeStage = getClientActiveStage(client);
    if (activeStage.status === 'Standby') {
      alerts.push({
        id: `alert-standby-${client.id}`,
        clientId: client.id,
        clientName: client.cliente,
        compania: client.compania,
        grupo: client.grupo,
        grupoTeams: client.grupoTeams || 'Sin grupo de Teams asignado',
        tipo: 'retraso_etapa',
        titulo: `Etapa en Standby: ${activeStage.stageName}`,
        descripcion: `El proceso se encuentra detenido esperando resolución o entrega de carpeta.`,
        etapaAfectada: activeStage.stageName
      });
    }

    // Alerta específica de diagnósticos críticos detectados en el Excel
    if (client.folderChecklist?.audios === 'no_hay' && activeStage.stageId !== 'kickoff') {
      alerts.push({
        id: `alert-audios-${client.id}`,
        clientId: client.id,
        clientName: client.cliente,
        compania: client.compania,
        grupo: client.grupo,
        grupoTeams: client.grupoTeams || 'Sin grupo de Teams asignado',
        tipo: 'carpeta_incompleta',
        titulo: `Faltan audios en carpeta`,
        descripcion: `No hay audios cargados en la carpeta del cliente para avanzar con pruebas acústicas y calibración.`,
        etapaAfectada: 'Pruebas de audio'
      });
    }

    if (client.folderChecklist?.evaluacionManual === 'no_visualiza') {
      alerts.push({
        id: `alert-manual-${client.id}`,
        clientId: client.id,
        clientName: client.cliente,
        compania: client.compania,
        grupo: client.grupo,
        grupoTeams: client.grupoTeams || 'Sin grupo de Teams asignado',
        tipo: 'carpeta_incompleta',
        titulo: `Evaluación manual no visible`,
        descripcion: `Faltan evaluaciones manuales para contraste y calibración de rúbrica en Validación conjunta.`,
        etapaAfectada: 'Validación conjunta'
      });
    }
  }

  return alerts;
}
