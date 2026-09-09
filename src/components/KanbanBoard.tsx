import React, { useState } from 'react';
import { 
  ClientRecord, 
  STAGES_LIST, 
  StageDefinition, 
  StageStatus 
} from '../types';
import { getClientActiveStage, parseDateSafe, getDaysDifference } from '../utils/alertUtils';
import { 
  Building2, 
  Users2, 
  Flame, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  FolderX,
  ArrowRight,
  Sparkles,
  Info,
  MoreVertical
} from 'lucide-react';

interface KanbanBoardProps {
  clients: ClientRecord[];
  onUpdateClientStage: (clientId: string, targetStageId: string, newStatus?: StageStatus) => void;
  onSelectClient: (client: ClientRecord) => void;
  referenceDate: Date;
  groupByTeams: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  clients,
  onUpdateClientStage,
  onSelectClient,
  referenceDate,
  groupByTeams
}) => {
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Exclude 'modoCaptura' from the 9 core project pipeline stages:
  const kanbanStages: StageDefinition[] = STAGES_LIST.filter(s => s.id !== 'modoCaptura');

  // Map clients to their current active stage in the Kanban board
  const stageClientsMap = kanbanStages.reduce<Record<string, ClientRecord[]>>((acc, stage) => {
    acc[stage.id] = [];
    return acc;
  }, {});

  clients.forEach(client => {
    const activeStage = getClientActiveStage(client);
    // If active stage is in our list, place it there. Otherwise default to kickoff or the closest
    if (stageClientsMap[activeStage.stageId]) {
      stageClientsMap[activeStage.stageId].push(client);
    } else {
      // If modoCaptura or other, check which stage is doing or last
      stageClientsMap['kickoff'].push(client);
    }
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData('text/plain', clientId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedClientId(clientId);
  };

  const handleDragEnd = () => {
    setDraggedClientId(null);
    setDragOverStageId(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stageId: string) => {
    // Only reset if leaving the column itself
    if (e.currentTarget === e.target) {
      if (dragOverStageId === stageId) {
        setDragOverStageId(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData('text/plain') || draggedClientId;
    if (clientId) {
      onUpdateClientStage(clientId, targetStageId, 'Doing');
    }
    setDraggedClientId(null);
    setDragOverStageId(null);
  };

  return (
    <div className="w-full overflow-x-auto p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
      <div className="flex gap-4 min-w-[1900px] pb-4 items-start">
        {kanbanStages.map((stage, index) => {
          const stageClients = stageClientsMap[stage.id] || [];
          const isOver = dragOverStageId === stage.id;

          // Distinct accent colors per stage progression
          const stageColors = [
            'border-blue-500 text-blue-700 bg-blue-50',
            'border-cyan-500 text-cyan-700 bg-cyan-50',
            'border-indigo-500 text-indigo-700 bg-indigo-50',
            'border-violet-500 text-violet-700 bg-violet-50',
            'border-purple-500 text-purple-700 bg-purple-50',
            'border-amber-500 text-amber-700 bg-amber-50',
            'border-orange-500 text-orange-700 bg-orange-50',
            'border-teal-500 text-teal-700 bg-teal-50',
            'border-emerald-500 text-emerald-700 bg-emerald-50',
          ];
          const colorClass = stageColors[index % stageColors.length];

          // If groupByTeams is active, group clients within this column by Teams group
          let groupedTeamsMap: Record<string, ClientRecord[]> = {};
          if (groupByTeams) {
            groupedTeamsMap = stageClients.reduce<Record<string, ClientRecord[]>>((acc, c) => {
              const tg = c.grupoTeams || 'Sin Grupo Teams';
              if (!acc[tg]) acc[tg] = [];
              acc[tg].push(c);
              return acc;
            }, {});
          }

          return (
            <div
              key={stage.id}
              id={`kanban-col-${stage.id}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`w-80 shrink-0 flex flex-col rounded-xl transition-all duration-200 ${
                isOver
                  ? 'bg-indigo-50/90 ring-2 ring-indigo-500 shadow-lg scale-[1.01]'
                  : 'bg-slate-200/70 border border-slate-300/80 shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-300/70 bg-white/95 rounded-t-xl backdrop-blur-xs flex items-center justify-between gap-2 sticky top-0 z-10 min-h-[62px]">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] shrink-0">
                    {index + 1}
                  </span>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide line-clamp-2 leading-tight" title={stage.name}>
                    {stage.name}
                  </h2>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${colorClass}`}>
                  {stageClients.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="p-2.5 flex-1 min-h-[550px] space-y-3 overflow-y-auto max-h-[calc(100vh-230px)]">
                {stageClients.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-300/80 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                    <p className="font-medium text-slate-500">Sin clientes en esta etapa</p>
                    <p className="text-[11px] mt-1 text-slate-400">Arrastra una tarjeta aquí para actualizar</p>
                  </div>
                ) : groupByTeams ? (
                  // Grouped by Teams View within column
                  Object.entries(groupedTeamsMap).map(([teamsGroup, groupClients]) => (
                    <div key={teamsGroup} className="space-y-2.5 bg-white/60 p-2 rounded-lg border border-slate-300/60">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-900 bg-indigo-100/70 px-2 py-1 rounded border border-indigo-200">
                        <Users2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate" title={teamsGroup}>{teamsGroup}</span>
                        <span className="ml-auto text-[10px] text-indigo-700 font-semibold bg-white/80 px-1.5 rounded-full">
                          {groupClients.length}
                        </span>
                      </div>
                      {groupClients.map((client) => (
                        <KanbanCard
                          key={client.id}
                          client={client}
                          stage={stage}
                          allStages={kanbanStages}
                          stageIndex={index}
                          isDragged={draggedClientId === client.id}
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          onDragEnd={handleDragEnd}
                          onSelectClient={() => onSelectClient(client)}
                          onMoveStage={(targetStageId) => onUpdateClientStage(client.id, targetStageId, 'Doing')}
                          referenceDate={referenceDate}
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  // Normal View
                  stageClients.map((client) => (
                    <KanbanCard
                      key={client.id}
                      client={client}
                      stage={stage}
                      allStages={kanbanStages}
                      stageIndex={index}
                      isDragged={draggedClientId === client.id}
                      onDragStart={(e) => handleDragStart(e, client.id)}
                      onDragEnd={handleDragEnd}
                      onSelectClient={() => onSelectClient(client)}
                      onMoveStage={(targetStageId) => onUpdateClientStage(client.id, targetStageId, 'Doing')}
                      referenceDate={referenceDate}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface KanbanCardProps {
  client: ClientRecord;
  stage: StageDefinition;
  allStages: StageDefinition[];
  stageIndex: number;
  isDragged: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onSelectClient: () => void;
  onMoveStage: (targetStageId: string) => void;
  referenceDate: Date;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  client,
  stage,
  allStages,
  stageIndex,
  isDragged,
  onDragStart,
  onDragEnd,
  onSelectClient,
  onMoveStage,
  referenceDate
}) => {
  // Check pre-requisite alert
  let preReqAlert: { type: 'overdue' | 'dueSoon'; text: string; days: number } | null = null;
  if (client.fechaLimitePreRequisito) {
    const target = parseDateSafe(client.fechaLimitePreRequisito);
    if (target) {
      const diffDays = getDaysDifference(target, referenceDate);
      if (diffDays < 0) {
        preReqAlert = {
          type: 'overdue',
          text: `Venció hace ${Math.abs(diffDays)}d (${client.fechaLimitePreRequisito})`,
          days: diffDays
        };
      } else if (diffDays <= 3) {
        preReqAlert = {
          type: 'dueSoon',
          text: diffDays === 0 ? `Vence HOY (${client.fechaLimitePreRequisito})` : `Vence en ${diffDays}d (${client.fechaLimitePreRequisito})`,
          days: diffDays
        };
      }
    }
  }

  // Priority styling
  const priorityColor = 
    client.prioridad === 'Alta' 
      ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold' 
      : client.prioridad === 'Media' 
      ? 'bg-amber-50 text-amber-700 border-amber-300 font-medium'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  // Current stage status
  const currentStageStatus = client.etapas[stage.id] || 'Doing';
  const statusColor = 
    currentStageStatus === 'Done'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : currentStageStatus === 'Doing'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : currentStageStatus === 'Standby'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  const prevStage = stageIndex > 0 ? allStages[stageIndex - 1] : null;
  const nextStage = stageIndex < allStages.length - 1 ? allStages[stageIndex + 1] : null;

  return (
    <div
      id={`kanban-card-${client.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelectClient}
      className={`bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-400 group relative ${
        isDragged ? 'opacity-40 scale-95 border-indigo-400 shadow-none' : 'border-slate-200/90 shadow-xs'
      }`}
    >
      {/* Priority & Group Top Row - CRITICAL: Visible and prominent */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center space-x-1.5 flex-wrap">
          {/* Prioridad Badge */}
          <span className={`inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-md border ${priorityColor}`}>
            {client.prioridad === 'Alta' && <Flame className="w-3 h-3 fill-rose-600 text-rose-600" />}
            <span>{client.prioridad}</span>
          </span>

          {/* Grupo Badge */}
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[90px]" title={client.grupo}>
            {client.grupo}
          </span>
        </div>

        {/* Current Stage Status Pill */}
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${statusColor}`}>
          {currentStageStatus}
        </span>
      </div>

      {/* Client Name & Company */}
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {client.cliente}
        </h3>
        <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">{client.compania}</span>
          {client.lineaNegocio && (
            <>
              <span className="text-slate-300">•</span>
              <span className="truncate max-w-[140px]" title={client.lineaNegocio}>{client.lineaNegocio}</span>
            </>
          )}
        </div>
      </div>

      {/* Teams Group - Prominently Displayed */}
      <div className="mb-2.5 p-1.5 bg-indigo-50/70 rounded-lg border border-indigo-100 flex items-center space-x-1.5 text-xs text-indigo-900">
        <Users2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="font-medium truncate" title={client.grupoTeams}>
          {client.grupoTeams || 'Sin grupo de Teams'}
        </span>
      </div>

      {/* Pre-requisite Alert Pill (<= 3 days or Overdue) */}
      {preReqAlert && (
        <div 
          className={`mb-2 p-1.5 rounded-md text-[11px] font-semibold flex items-start space-x-1.5 border ${
            preReqAlert.type === 'overdue'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
          title={`Pre-requisitos: ${client.preRequisitos}`}
        >
          <AlertCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${preReqAlert.type === 'overdue' ? 'text-rose-600' : 'text-amber-600'}`} />
          <div className="flex-1 min-w-0">
            <p className="truncate font-bold">{preReqAlert.text}</p>
            <p className="text-[10px] text-slate-600 truncate">{client.preRequisitos.split('\n')[0] || 'Validar pre-requisitos'}</p>
          </div>
        </div>
      )}

      {/* Missing Folder Items Warning (Audios, Manual Evaluations) */}
      {(client.folderChecklist.audios === 'no_hay' || client.folderChecklist.evaluacionManual === 'no_visualiza') && (
        <div className="mb-2 text-[10px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded border border-amber-200 flex items-center space-x-1">
          <FolderX className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="truncate">
            {client.folderChecklist.audios === 'no_hay' ? 'Faltan audios' : 'Falta eval. manual'}
          </span>
        </div>
      )}

      {/* Next Steps preview if exists */}
      {client.proximosPasos && (
        <div className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100 mb-2.5">
          <span className="font-semibold text-slate-700">Próximos pasos: </span>
          {client.proximosPasos}
        </div>
      )}

      {/* Card Footer: Quick Move Controls */}
      <div 
        className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs"
        onClick={(e) => e.stopPropagation()} // don't open modal when clicking stage advancement
      >
        <span className="text-[11px] text-slate-400 font-medium">
          {client.tipoCuenta.includes('V1') ? 'Migración V1' : 'Nueva Cta'}
        </span>

        <div className="flex items-center space-x-1">
          {prevStage && (
            <button
              onClick={() => onMoveStage(prevStage.id)}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title={`Retroceder a ${prevStage.name}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {nextStage && (
            <button
              onClick={() => onMoveStage(nextStage.id)}
              className="flex items-center space-x-0.5 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors"
              title={`Avanzar a ${nextStage.name}`}
            >
              <span>Avanzar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
