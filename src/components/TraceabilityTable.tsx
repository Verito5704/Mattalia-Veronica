import React from 'react';
import { 
  ClientRecord, 
  STAGES_LIST, 
  StageStatus 
} from '../types';
import { parseDateSafe, getDaysDifference } from '../utils/alertUtils';
import { 
  Building2, 
  Users2, 
  Flame, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  FolderX,
  Undo2,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface TraceabilityTableProps {
  clients: ClientRecord[];
  onSelectClient: (client: ClientRecord) => void;
  onUpdateClientStage: (clientId: string, stageId: string, newStatus: StageStatus) => void;
  referenceDate: Date;
  groupByTeams: boolean;
  onMoveToTraspasar?: (id: string) => void;
}

export const TraceabilityTable: React.FC<TraceabilityTableProps> = ({
  clients,
  onSelectClient,
  onUpdateClientStage,
  referenceDate,
  groupByTeams,
  onMoveToTraspasar
}) => {
  const nextStatusCycle = (current: StageStatus): StageStatus => {
    if (current === 'To Do') return 'Doing';
    if (current === 'Doing') return 'Done';
    if (current === 'Done') return 'Standby';
    return 'To Do';
  };

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
      case 'Doing':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'Standby':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Blocked':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  // Group by Teams channel if enabled
  const renderRows = (clientList: ClientRecord[]) => {
    return clientList.map((client) => {
      // Check pre-requisite alert
      let preReqBadge = null;
      if (client.fechaLimitePreRequisito) {
        const target = parseDateSafe(client.fechaLimitePreRequisito);
        if (target) {
          const diff = getDaysDifference(target, referenceDate);
          if (diff < 0) {
            preReqBadge = (
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                <AlertCircle className="w-3 h-3 mr-1 text-rose-600 shrink-0" />
                Venció hace {Math.abs(diff)}d
              </span>
            );
          } else if (diff <= 3) {
            preReqBadge = (
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                <Clock className="w-3 h-3 mr-1 text-amber-600 shrink-0" />
                Vence en {diff}d
              </span>
            );
          }
        }
      }

      return (
        <tr 
          key={client.id}
          className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-200 group text-xs text-slate-700"
          onClick={() => onSelectClient(client)}
        >
          {/* Prioridad */}
          <td className="px-3 py-2.5 whitespace-nowrap">
            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
              client.prioridad === 'Alta' 
                ? 'bg-rose-50 text-rose-700 border-rose-300' 
                : client.prioridad === 'Media'
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {client.prioridad === 'Alta' && <Flame className="w-3 h-3 fill-rose-600 text-rose-600" />}
              <span>{client.prioridad}</span>
            </span>
          </td>

          {/* Grupo */}
          <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-800">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
              {client.grupo}
            </span>
          </td>

          {/* Compañía */}
          <td className="px-3 py-2.5 whitespace-nowrap font-bold text-slate-900">
            {client.compania}
          </td>

          {/* Cliente / Proceso */}
          <td className="px-3 py-2.5 whitespace-nowrap">
            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center space-x-1">
              <span>{client.cliente}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500" />
            </div>
            {client.lineaNegocio && (
              <span className="text-[11px] text-slate-500 block">{client.lineaNegocio}</span>
            )}
          </td>

          {/* Grupo Teams - PROMINENT */}
          <td className="px-3 py-2.5 whitespace-nowrap">
            <div className="flex items-center space-x-1 text-indigo-900 bg-indigo-50/80 px-2 py-1 rounded border border-indigo-100 max-w-[200px]" title={client.grupoTeams}>
              <Users2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate font-semibold text-[11px]">{client.grupoTeams || 'Sin asignar'}</span>
            </div>
          </td>

          {/* Pre-requisitos & Fecha Límite */}
          <td className="px-3 py-2.5 min-w-[220px]">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-semibold text-slate-800 text-[11px]">
                {client.fechaLimitePreRequisito || 'Sin fecha'}
              </span>
              {preReqBadge}
            </div>
            <p className="text-[11px] text-slate-600 truncate max-w-[220px]" title={client.preRequisitos}>
              {client.preRequisitos.split('\n')[0] || 'No definidos'}
            </p>
          </td>

          {/* Stages (Interactive status cells) */}
          {STAGES_LIST.map((stage) => {
            const status = client.etapas[stage.id] || 'To Do';
            return (
              <td 
                key={stage.id} 
                className="px-2 py-2.5 text-center whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateClientStage(client.id, stage.id, nextStatusCycle(status));
                }}
                title={`Etapa: ${stage.name} - Clic para alternar estado`}
              >
                <button
                  type="button"
                  className={`text-[10px] px-2 py-1 rounded border transition-all hover:scale-105 active:scale-95 ${getStatusBadge(status)}`}
                >
                  {status}
                </button>
              </td>
            );
          })}

          {/* Próximos pasos */}
          <td className="px-3 py-2.5 min-w-[240px]">
            <p className="text-[11px] text-slate-600 line-clamp-2 max-w-[260px]" title={client.proximosPasos}>
              {client.proximosPasos || '-'}
            </p>
          </td>

          {/* Acciones */}
          <td className="px-3 py-2.5 text-center whitespace-nowrap">
            {onMoveToTraspasar && client.origenTraspaso && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToTraspasar(client.id);
                }}
                className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-slate-500 hover:text-amber-600 transition"
                title="Devolver a la pestaña anterior"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="w-full bg-white overflow-x-auto shadow-xs border border-slate-200">
      <table className="min-w-[2100px] w-full divide-y divide-slate-200 text-left border-collapse">
        <thead className="bg-slate-900 text-slate-200 text-xs uppercase tracking-wider font-semibold sticky top-0 z-10 shadow-xs">
          <tr>
            <th className="px-3 py-3 w-28">Prioridad</th>
            <th className="px-3 py-3 w-28">Grupo</th>
            <th className="px-3 py-3 w-32">Compañía</th>
            <th className="px-3 py-3 w-48">Cliente / Proceso</th>
            <th className="px-3 py-3 w-52">Grupo Teams</th>
            <th className="px-3 py-3 w-60">Pre-requisitos & Límite</th>
            {STAGES_LIST.map((stage) => (
              <th key={stage.id} className="px-2 py-3 text-center min-w-[125px]" title={stage.name}>
                {stage.shortName}
              </th>
            ))}
            <th className="px-3 py-3 w-64">Próximos Pasos</th>
            <th className="px-3 py-3 w-24 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {clients.length === 0 ? (
            <tr>
              <td colSpan={18} className="text-center py-12 text-slate-400 text-sm">
                No se encontraron clientes con los filtros aplicados.
              </td>
            </tr>
          ) : groupByTeams ? (
            // Render clustered by Teams
            (() => {
              const grouped: Record<string, ClientRecord[]> = {};
              clients.forEach(c => {
                const tg = c.grupoTeams || 'Sin Grupo de Teams Asignado';
                if (!grouped[tg]) grouped[tg] = [];
                grouped[tg].push(c);
              });

              return Object.entries(grouped).map(([teamsGroup, groupClients]) => (
                <React.Fragment key={teamsGroup}>
                  <tr className="bg-indigo-50/70 border-y border-indigo-200">
                    <td colSpan={18} className="px-4 py-2 font-bold text-xs text-indigo-950">
                      <div className="flex items-center space-x-2">
                        <Users2 className="w-4 h-4 text-indigo-600" />
                        <span>{teamsGroup}</span>
                        <span className="bg-indigo-200/80 text-indigo-800 text-[11px] px-2 py-0.5 rounded-full">
                          {groupClients.length} {groupClients.length === 1 ? 'cliente' : 'clientes'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {renderRows(groupClients)}
                </React.Fragment>
              ));
            })()
          ) : (
            renderRows(clients)
          )}
        </tbody>
      </table>
    </div>
  );
};
