import React from 'react';
import { AppAlert } from '../utils/alertUtils';
import { 
  X, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  PauseCircle, 
  FolderX, 
  ExternalLink,
  Users2
} from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AppAlert[];
  onSelectClientById: (clientId: string) => void;
  onGoToAlertsCenter: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectClientById,
  onGoToAlertsCenter
}) => {
  if (!isOpen) return null;

  const urgentCount = alerts.filter(a => a.tipo === 'urgente').length;
  const upcomingCount = alerts.filter(a => a.tipo === 'proxima').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Centro de Notificaciones</h2>
              <p className="text-[11px] text-slate-400">
                {alerts.length} alertas detectadas ({urgentCount} urgentes)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No hay alertas activas en este momento.
            </div>
          ) : (
            alerts.map((alert) => {
              const isUrgent = alert.tipo === 'urgente';
              const isUpcoming = alert.tipo === 'proxima';

              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    onSelectClientById(alert.clientId);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md space-y-1.5 ${
                    isUrgent
                      ? 'bg-rose-50/80 border-rose-300 hover:bg-rose-50'
                      : isUpcoming
                      ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-50'
                      : 'bg-indigo-50/80 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      isUrgent ? 'bg-rose-600 text-white' : isUpcoming ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {alert.titulo}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                      {alert.compania}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900">
                    {alert.clientName}
                  </h3>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {alert.descripcion}
                  </p>

                  <div className="flex items-center space-x-1 text-[10px] text-indigo-900 pt-1 border-t border-slate-200/60">
                    <Users2 className="w-3 h-3 text-indigo-600 shrink-0" />
                    <span className="truncate">{alert.grupoTeams}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              onGoToAlertsCenter();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Ver Centro de Alertas Completo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
