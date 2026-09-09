import React, { useState } from 'react';
import { AppAlert } from '../utils/alertUtils';
import { ClientRecord } from '../types';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  PauseCircle, 
  FolderX, 
  CheckCircle2, 
  ExternalLink,
  Users2,
  Calendar
} from 'lucide-react';

interface AlertsCenterProps {
  alerts: AppAlert[];
  clients: ClientRecord[];
  onSelectClientById: (clientId: string) => void;
  referenceDateStr: string;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({
  alerts,
  clients,
  onSelectClientById,
  referenceDateStr
}) => {
  const [filterType, setFilterType] = useState<string>('todos');

  const urgentAlerts = alerts.filter(a => a.tipo === 'urgente');
  const upcomingAlerts = alerts.filter(a => a.tipo === 'proxima');
  const stageDelayAlerts = alerts.filter(a => a.tipo === 'retraso_etapa');
  const folderAlerts = alerts.filter(a => a.tipo === 'carpeta_incompleta');

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'todos') return true;
    return a.tipo === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Centro de Alertas, SLA & Notificaciones</h2>
          </div>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Control de desvíos en tiempo real: alertas activadas a 3 días del vencimiento de pre-requisitos, fechas sobrepasadas y cuellos de botella en etapas.
          </p>
        </div>

        <div className="bg-slate-800/80 rounded-xl px-4 py-3 border border-slate-700/80 text-xs flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fecha de corte activa</span>
            <span className="font-bold text-white text-sm">{referenceDateStr}</span>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Vencidos */}
        <div 
          onClick={() => setFilterType('urgente')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'urgente' 
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-md' 
              : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Vencidos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{urgentAlerts.length}</span>
            <span className="text-xs text-rose-600 font-semibold">Pre-requisitos vencidos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requieren escalamiento inmediato</p>
        </div>

        {/* Próximos a vencer */}
        <div 
          onClick={() => setFilterType('proxima')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'proxima' 
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-md' 
              : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Por Vencer (≤ 3d)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{upcomingAlerts.length}</span>
            <span className="text-xs text-amber-600 font-semibold">A vencer pronto</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dar seguimiento en canal Teams</p>
        </div>

        {/* Retrasos de Etapa / Standby */}
        <div 
          onClick={() => setFilterType('retraso_etapa')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'retraso_etapa' 
              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20 shadow-md' 
              : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Retrasos / Standby</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <PauseCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{stageDelayAlerts.length}</span>
            <span className="text-xs text-indigo-600 font-semibold">Procesos frenados</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Exceden SLA estimado de etapa</p>
        </div>

        {/* Carpetas Incompletas */}
        <div 
          onClick={() => setFilterType('carpeta_incompleta')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterType === 'carpeta_incompleta' 
              ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-500/20 shadow-md' 
              : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-violet-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Carpetas Incompletas</span>
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
              <FolderX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{folderAlerts.length}</span>
            <span className="text-xs text-violet-600 font-semibold">Audios / Rúbricas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Impiden testing de calidad</p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setFilterType('todos')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'todos' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todas las Alertas ({alerts.length})
        </button>

        <button
          onClick={() => setFilterType('urgente')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'urgente' 
              ? 'bg-rose-600 text-white shadow-xs' 
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          Pre-requisitos Vencidos ({urgentAlerts.length})
        </button>

        <button
          onClick={() => setFilterType('proxima')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'proxima' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          Por Vencer en ≤ 3 días ({upcomingAlerts.length})
        </button>

        <button
          onClick={() => setFilterType('retraso_etapa')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'retraso_etapa' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          Retrasos de Etapa ({stageDelayAlerts.length})
        </button>

        <button
          onClick={() => setFilterType('carpeta_incompleta')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterType === 'carpeta_incompleta' 
              ? 'bg-violet-600 text-white shadow-xs' 
              : 'text-violet-700 hover:bg-violet-50'
          }`}
        >
          Carpetas & Audios ({folderAlerts.length})
        </button>
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No hay alertas en esta categoría</h3>
            <p className="text-xs text-slate-500 mt-1">Todos los pre-requisitos y carpetas se encuentran en regla.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isUrgent = alert.tipo === 'urgente';
            const isUpcoming = alert.tipo === 'proxima';
            const isDelay = alert.tipo === 'retraso_etapa';

            return (
              <div
                key={alert.id}
                onClick={() => onSelectClientById(alert.clientId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUrgent 
                    ? 'bg-rose-50/70 border-rose-300 hover:bg-rose-50' 
                    : isUpcoming
                    ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
                    : isDelay
                    ? 'bg-indigo-50/70 border-indigo-200 hover:bg-indigo-50'
                    : 'bg-violet-50/70 border-violet-200 hover:bg-violet-50'
                }`}
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {/* Badge Alert Type */}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 ${
                      isUrgent 
                        ? 'bg-rose-600 text-white' 
                        : isUpcoming
                        ? 'bg-amber-600 text-white'
                        : isDelay
                        ? 'bg-indigo-600 text-white'
                        : 'bg-violet-600 text-white'
                    }`}>
                      {isUrgent && <AlertCircle className="w-3 h-3" />}
                      {isUpcoming && <Clock className="w-3 h-3" />}
                      <span>{alert.titulo}</span>
                    </span>

                    {/* Company and Client */}
                    <span className="font-extrabold text-sm text-slate-900">
                      {alert.clientName}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-300">
                      {alert.compania}
                    </span>
                    <span className="text-xs text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                      {alert.grupo}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {alert.descripcion}
                  </p>

                  {/* Teams Channel tag */}
                  <div className="flex items-center space-x-1.5 text-xs text-indigo-900 pt-0.5">
                    <Users2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-[11px]">Canal Teams:</span>
                    <span className="text-slate-600 text-[11px] truncate max-w-md">{alert.grupoTeams}</span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClientById(alert.clientId);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs transition-colors"
                  >
                    <span>Ver Tarea & Cliente</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
