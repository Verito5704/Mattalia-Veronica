import React from 'react';
import { 
  BarChart3, 
  Table2, 
  Bell, 
  Plus, 
  Download, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRightLeft,
  UserPlus,
  Map
} from 'lucide-react';
import { ViewMode } from '../types';
import { AppAlert } from '../utils/alertUtils';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  alerts: AppAlert[];
  onOpenAlertsModal: () => void;
  onOpenNewClientModal: () => void;
  onExportCSV: () => void;
  referenceDateStr: string;
  onChangeReferenceDate: (dateStr: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  alerts,
  onOpenAlertsModal,
  onOpenNewClientModal,
  onExportCSV,
  referenceDateStr,
  onChangeReferenceDate
}) => {
  const urgentCount = alerts.filter(a => a.tipo === 'urgente').length;
  const upcomingCount = alerts.filter(a => a.tipo === 'proxima').length;
  const totalAlerts = alerts.length;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  Trazabilidad
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Plataforma de Calidad
                </span>
              </div>
            </div>
          </div>

          {/* View Mode Navigation Switcher */}
          <div className="flex items-center flex-nowrap overflow-x-auto gap-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/60 shadow-inner hide-scrollbar">
            <button
              id="nav-view-matriz"
              onClick={() => onViewChange('matriz')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                currentView === 'matriz'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Prioritarios</span>
            </button>

            <button
              id="nav-view-traspasar"
              onClick={() => onViewChange('traspasar')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                currentView === 'traspasar'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Traspasos</span>
            </button>

            <button
              id="nav-view-nuevos"
              onClick={() => onViewChange('nuevos')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                currentView === 'nuevos'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nuevos</span>
            </button>

            <button
              id="nav-view-roadmap"
              onClick={() => onViewChange('roadmap')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                currentView === 'roadmap'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-purple-400" />
              <span>Roadmap</span>
            </button>

            <div className="w-[1px] h-5 bg-slate-600 mx-0.5 shrink-0"></div>

            <button
              id="nav-view-metricas"
              onClick={() => onViewChange('metricas')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                currentView === 'metricas' || currentView === 'pipeline'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Métricas</span>
            </button>

            <button
              id="nav-view-alertas"
              onClick={() => onViewChange('alertas')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border relative whitespace-nowrap ${
                currentView === 'alertas'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Alertas</span>
              {totalAlerts > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                  {totalAlerts}
                </span>
              )}
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Reference Date Indicator */}
            <div className="hidden lg:flex items-center bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 space-x-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Fecha base:</span>
              <input
                type="date"
                value={referenceDateStr}
                onChange={(e) => onChangeReferenceDate(e.target.value)}
                className="bg-slate-900 text-white text-xs border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                title="Fecha de referencia para cálculo de alertas (Pre-requisitos <= 3 días)"
              />
            </div>

            {/* Alerts Quick Bell Button */}
            <button
              id="btn-quick-alerts"
              onClick={onOpenAlertsModal}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={`Ver ${totalAlerts} alertas activas`}
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                  {urgentCount > 0 ? urgentCount : upcomingCount}
                </span>
              )}
            </button>

            {/* Export CSV */}
            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              title="Descargar matriz actualizada en CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar</span>
            </button>

            {/* New Client Button */}
            <button
              id="btn-new-client"
              onClick={onOpenNewClientModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
