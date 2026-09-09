import React, { useState, useMemo } from 'react';
import { 
  ClientRecord, 
  STAGES_LIST, 
  StageStatus, 
  StageDefinition 
} from '../types';
import { parseDateSafe, getDaysDifference } from '../utils/alertUtils';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FolderCheck, 
  FolderX, 
  BarChart2, 
  Activity, 
  Users, 
  Building, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  Layers,
  FileCheck,
  Headphones,
  Check,
  Flame,
  Filter
} from 'lucide-react';

interface MetricsDashboardProps {
  clients: ClientRecord[];
  onSelectClient: (client: ClientRecord) => void;
  onUpdateClientStage: (clientId: string, stageId: string, newStatus: StageStatus) => void;
  referenceDate: Date;
  groupByTeams?: boolean;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  clients,
  onSelectClient,
  onUpdateClientStage,
  referenceDate,
  groupByTeams = false
}) => {
  // Filter for metrics dashboard view
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | 'completados' | 'en_curso' | 'en_espera'>('todos');
  const [stageSortOrder, setStageSortOrder] = useState<'avance' | 'nombre' | 'prioridad'>('avance');

  // The 9 core pipeline stages
  const coreStages = useMemo(() => {
    return STAGES_LIST.filter(s => s.id !== 'modoCaptura');
  }, []);

  // Calculate client progress
  const clientProgressList = useMemo(() => {
    return clients.map(client => {
      let doneCount = 0;
      let doingCount = 0;
      let standbyCount = 0;
      let blockedCount = 0;

      coreStages.forEach(stage => {
        const st = client.etapas[stage.id] || 'To Do';
        if (st === 'Done') doneCount++;
        else if (st === 'Doing') doingCount++;
        else if (st === 'Standby') standbyCount++;
        else if (st === 'Blocked') blockedCount++;
      });

      const percentage = Math.round((doneCount / coreStages.length) * 100);

      // Find active stage (the latest Doing or first non-Done stage)
      const currentActiveStage = coreStages.find(s => {
        const st = client.etapas[s.id];
        return st === 'Doing' || st === 'Standby';
      }) || coreStages.find(s => (client.etapas[s.id] || 'To Do') !== 'Done') || coreStages[coreStages.length - 1];

      return {
        client,
        doneCount,
        doingCount,
        standbyCount,
        blockedCount,
        percentage,
        activeStage: currentActiveStage
      };
    });
  }, [clients, coreStages]);

  // Filtered client progress
  const filteredClientProgress = useMemo(() => {
    return clientProgressList.filter(item => {
      if (selectedStatusFilter === 'completados') return item.percentage === 100;
      if (selectedStatusFilter === 'en_curso') return item.doingCount > 0 && item.percentage < 100;
      if (selectedStatusFilter === 'en_espera') return item.standbyCount > 0 || item.blockedCount > 0;
      return true;
    }).sort((a, b) => {
      if (stageSortOrder === 'avance') {
        return b.percentage - a.percentage;
      }
      if (stageSortOrder === 'nombre') {
        return a.client.cliente.localeCompare(b.client.cliente);
      }
      if (stageSortOrder === 'prioridad') {
        const pMap: Record<string, number> = { Alta: 1, Media: 2, Baja: 3 };
        return (pMap[a.client.prioridad] || 4) - (pMap[b.client.prioridad] || 4);
      }
      return 0;
    });
  }, [clientProgressList, selectedStatusFilter, stageSortOrder]);

  // Global KPIs
  const globalKpis = useMemo(() => {
    const totalClients = clients.length;
    if (totalClients === 0) {
      return {
        avgProgress: 0,
        completedClients: 0,
        inProgressClients: 0,
        standbyClients: 0,
        withAudiosOk: 0,
        withManualOk: 0
      };
    }

    const totalPercentage = clientProgressList.reduce((acc, c) => acc + c.percentage, 0);
    const avgProgress = Math.round(totalPercentage / totalClients);

    const completedClients = clientProgressList.filter(c => c.percentage === 100).length;
    const inProgressClients = clientProgressList.filter(c => c.doingCount > 0).length;
    const standbyClients = clientProgressList.filter(c => c.standbyCount > 0 || c.blockedCount > 0).length;

    const withAudiosOk = clients.filter(c => c.folderChecklist?.audios === 'ok').length;
    const withManualOk = clients.filter(c => c.folderChecklist?.evaluacionManual === 'ok').length;

    return {
      avgProgress,
      completedClients,
      inProgressClients,
      standbyClients,
      withAudiosOk,
      withManualOk
    };
  }, [clients, clientProgressList]);

  // Stage distribution metrics (How many clients in Done, Doing, Standby, To Do for EACH of the 9 stages)
  const stageStats = useMemo(() => {
    return coreStages.map(stage => {
      let done = 0;
      let doing = 0;
      let standby = 0;
      let toDo = 0;

      clients.forEach(c => {
        const st = c.etapas[stage.id] || 'To Do';
        if (st === 'Done') done++;
        else if (st === 'Doing') doing++;
        else if (st === 'Standby' || st === 'Blocked') standby++;
        else toDo++;
      });

      const total = clients.length || 1;
      const donePercent = Math.round((done / total) * 100);
      const doingPercent = Math.round((doing / total) * 100);
      const standbyPercent = Math.round((standby / total) * 100);
      const toDoPercent = Math.round((toDo / total) * 100);

      return {
        stage,
        done,
        doing,
        standby,
        toDo,
        donePercent,
        doingPercent,
        standbyPercent,
        toDoPercent,
        isBottleneck: standby >= 2 || (standby > 0 && doing === 0)
      };
    });
  }, [coreStages, clients]);

  // Identified bottleneck stage
  const bottleneckStage = useMemo(() => {
    let maxStandby = 0;
    let worst = null;
    stageStats.forEach(s => {
      if (s.standby > maxStandby) {
        maxStandby = s.standby;
        worst = s;
      }
    });
    return worst;
  }, [stageStats]);

  // Helper for stage status color
  const getStageStatusColors = (status: StageStatus) => {
    switch (status) {
      case 'Done':
        return {
          bg: 'bg-emerald-500',
          hoverBg: 'hover:bg-emerald-600',
          border: 'border-emerald-600',
          text: 'text-white',
          label: 'Completada',
          icon: '✓'
        };
      case 'Doing':
        return {
          bg: 'bg-indigo-600',
          hoverBg: 'hover:bg-indigo-700',
          border: 'border-indigo-700',
          text: 'text-white',
          label: 'En curso',
          icon: '⏳'
        };
      case 'Standby':
        return {
          bg: 'bg-amber-500',
          hoverBg: 'hover:bg-amber-600',
          border: 'border-amber-600',
          text: 'text-white',
          label: 'Standby / Pausa',
          icon: '⏸'
        };
      case 'Blocked':
        return {
          bg: 'bg-rose-500',
          hoverBg: 'hover:bg-rose-600',
          border: 'border-rose-600',
          text: 'text-white',
          label: 'Bloqueada',
          icon: '✕'
        };
      default:
        return {
          bg: 'bg-slate-200',
          hoverBg: 'hover:bg-slate-300',
          border: 'border-slate-300',
          text: 'text-slate-600',
          label: 'Pendiente',
          icon: '○'
        };
    }
  };

  // Next status cycle for stage toggle
  const nextStageStatus = (current: StageStatus): StageStatus => {
    if (current === 'To Do') return 'Doing';
    if (current === 'Doing') return 'Done';
    if (current === 'Done') return 'Standby';
    return 'To Do';
  };

  return (
    <div className="space-y-8">
      {/* 1. Executive KPIs Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Avance Global Promedio */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avance Global del Despliegue
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {globalKpis.avgProgress}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                promedio de 9 etapas
              </span>
            </div>
            {/* Global Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${globalKpis.avgProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Cuentas en Curso vs Finalizadas */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estado de Cuentas
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <span className="text-xl font-bold text-indigo-600">{globalKpis.inProgressClients}</span>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">En Curso</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <span className="text-xl font-bold text-emerald-600">{globalKpis.completedClients}</span>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">100% Listas</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <span className="text-xl font-bold text-amber-600">{globalKpis.standbyClients}</span>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">En Standby</p>
            </div>
          </div>
        </div>

        {/* Card 3: Salud de Carpetas y Audios */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Diagnóstico de Insumos
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <FolderCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Headphones className="w-3.5 h-3.5 text-slate-400" />
                Audios OK en carpeta:
              </span>
              <span className="font-bold text-slate-800">
                {globalKpis.withAudiosOk} / {clients.length} ({Math.round((globalKpis.withAudiosOk / (clients.length || 1)) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                Eval. manual visible:
              </span>
              <span className="font-bold text-slate-800">
                {globalKpis.withManualOk} / {clients.length} ({Math.round((globalKpis.withManualOk / (clients.length || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Etapa con Mayor Fricción / Cuello de Botella */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cuello de Botella Detectado
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {bottleneckStage && bottleneckStage.standby > 0 ? (
              <div>
                <p className="text-sm font-bold text-slate-900 truncate" title={bottleneckStage.stage.name}>
                  {bottleneckStage.stage.shortName}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <span>{bottleneckStage.standby} cuentas pausadas o en standby</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Flujo sin bloqueos críticos</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Section: Traversed Stages by Client (Colored Progress Bars) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Header of the client progression section */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recorrido de Etapas por Cliente
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                {filteredClientProgress.length} clientes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualización interactiva del progreso a través de las 9 etapas. Haz clic en cualquier etapa para cambiar su estado.
            </p>
          </div>

          {/* Controls: Quick filters & sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter pills */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs text-xs">
              <button
                onClick={() => setSelectedStatusFilter('todos')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedStatusFilter === 'todos' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({clientProgressList.length})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('en_curso')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedStatusFilter === 'en_curso' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                En Curso
              </button>
              <button
                onClick={() => setSelectedStatusFilter('en_espera')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedStatusFilter === 'en_espera' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                En Espera ({globalKpis.standbyClients})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('completados')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedStatusFilter === 'completados' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                100% Listos
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium">Ordenar:</span>
              <select
                value={stageSortOrder}
                onChange={(e) => setStageSortOrder(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 shadow-2xs focus:outline-none focus:border-indigo-500"
              >
                <option value="avance">Mayor Avance (%)</option>
                <option value="nombre">Nombre de Cliente</option>
                <option value="prioridad">Prioridad</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400 font-medium">Convención de colores:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
              <span className="font-semibold text-slate-700">Completada (Done)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">⏳</span>
              <span className="font-semibold text-slate-700">En Curso (Doing)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500 flex items-center justify-center text-white text-[9px] font-bold">⏸</span>
              <span className="font-semibold text-slate-700">En Pausa (Standby)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 flex items-center justify-center text-white text-[9px] font-bold">✕</span>
              <span className="font-semibold text-slate-700">Bloqueada (Blocked)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 flex items-center justify-center text-slate-500 text-[9px] font-bold">○</span>
              <span className="text-slate-500">Pendiente (To Do)</span>
            </div>
          </div>

          <span className="text-slate-400 italic text-[11px]">
            * Haz clic en una etapa para avanzar su estado (To Do → Doing → Done → Standby)
          </span>
        </div>

        {/* Client Rows with Stage Progress Track */}
        <div className="divide-y divide-slate-100">
          {filteredClientProgress.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-medium text-sm">No hay clientes que coincidan con el filtro seleccionado.</p>
              <button
                onClick={() => setSelectedStatusFilter('todos')}
                className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
              >
                Ver todos los clientes
              </button>
            </div>
          ) : (
            filteredClientProgress.map(({ client, doneCount, percentage, activeStage }) => {
              // Pre-requisito limit status
              const daysLeft = client.fechaLimitePreRequisito 
                ? getDaysDifference(referenceDate, parseDateSafe(client.fechaLimitePreRequisito) || new Date()) 
                : null;
              const isExpired = daysLeft !== null && daysLeft < 0;
              const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

              return (
                <div 
                  key={client.id} 
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                >
                  {/* Left: Client info & Badges */}
                  <div className="xl:w-80 shrink-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => onSelectClient(client)}
                          className="text-sm font-bold text-slate-900 hover:text-indigo-600 text-left transition flex items-center gap-1.5 group"
                        >
                          <span className="truncate">{client.cliente}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {client.compania}
                          </span>
                          <span className="text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded-md">
                            {client.grupo}
                          </span>
                          {client.grupoTeams && (
                            <span className="text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded-md truncate max-w-[130px]" title={client.grupoTeams}>
                              {client.grupoTeams}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Priority pill */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        client.prioridad === 'Alta' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : client.prioridad === 'Media'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {client.prioridad}
                      </span>
                    </div>

                    {/* Pre-requisite status */}
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      {client.fechaLimitePreRequisito && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                          isExpired 
                            ? 'bg-rose-100 text-rose-800' 
                            : isUrgent 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>Límite: {client.fechaLimitePreRequisito}</span>
                        </span>
                      )}
                      {client.goLiveFin && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                          Go-Live: {client.goLiveFin}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Traversed Stages Visual Track (9 colored bars) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {doneCount} de {coreStages.length} etapas completadas
                        </span>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {percentage}% avance
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate max-w-[240px]">
                        Activa: <strong className="text-slate-800 font-semibold">{activeStage.shortName}</strong>
                      </span>
                    </div>

                    {/* 9 Stages Visual Track (clickable interactive blocks) */}
                    <div className="grid grid-cols-9 gap-1.5">
                      {coreStages.map((stage, idx) => {
                        const status = client.etapas[stage.id] || 'To Do';
                        const col = getStageStatusColors(status);

                        return (
                          <button
                            key={stage.id}
                            onClick={() => onUpdateClientStage(client.id, stage.id, nextStageStatus(status))}
                            className={`group relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 shadow-2xs ${
                              col.bg
                            } ${col.hoverBg} ${col.border} min-h-[58px]`}
                            title={`${idx + 1}. ${stage.name}: ${col.label} (Clic para cambiar)`}
                          >
                            <span className="text-[10px] font-black opacity-80 mb-0.5">
                              #{idx + 1}
                            </span>
                            <span className={`text-xs font-bold leading-none ${col.text}`}>
                              {col.icon}
                            </span>
                            <span className="text-[9px] font-bold tracking-tight mt-1 truncate max-w-full text-center opacity-90 px-0.5">
                              {stage.shortName}
                            </span>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                              <div className="bg-slate-900 text-white text-[11px] rounded-lg py-1 px-2.5 shadow-xl whitespace-nowrap border border-slate-700">
                                <p className="font-bold">{stage.name}</p>
                                <p className="text-slate-300 text-[10px]">Estado: <span className="font-semibold text-white">{status || 'To Do'}</span></p>
                              </div>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Folder Checklist Status & Action */}
                  <div className="xl:w-56 shrink-0 flex xl:flex-col items-center xl:items-end justify-between gap-2 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                    {/* Folder Quick badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-md font-medium border ${
                        client.folderChecklist?.audios === 'ok' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`} title={`Audios: ${client.folderChecklist?.audios}`}>
                        Audios: {client.folderChecklist?.audios === 'ok' ? '✓' : '✕'}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md font-medium border ${
                        client.folderChecklist?.evaluacionManual === 'ok' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`} title={`Evaluación Manual: ${client.folderChecklist?.evaluacionManual}`}>
                        Eval: {client.folderChecklist?.evaluacionManual === 'ok' ? '✓' : 'Pend'}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectClient(client)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Lower Section: Calculated Implementation Metrics & Funnel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metric Column 1 & 2: Stage Funnel & Bottleneck Matrix */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Embudo de Recorrido por Etapa (Distribución de Clientes)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Visualización de cuántas cuentas han completado, están en curso o se encuentran frenadas en cada etapa.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {stageStats.map((stat, idx) => (
              <div key={stat.stage.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 truncate" title={stat.stage.name}>
                      {stat.stage.name}
                    </span>
                    {stat.isBottleneck && (
                      <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                        Atención / Standby
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-slate-600 shrink-0">
                    <span className="text-emerald-700">{stat.done} Listos</span>
                    <span className="text-indigo-700">{stat.doing} En curso</span>
                    {stat.standby > 0 && <span className="text-amber-700">{stat.standby} Standby</span>}
                    <span className="text-slate-400">{stat.toDo} Pendientes</span>
                  </div>
                </div>

                {/* Stacked multi-color stage progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                  {stat.donePercent > 0 && (
                    <div 
                      className="bg-emerald-500 h-full transition-all" 
                      style={{ width: `${stat.donePercent}%` }} 
                      title={`${stat.done} cuentas completadas (${stat.donePercent}%)`}
                    />
                  )}
                  {stat.doingPercent > 0 && (
                    <div 
                      className="bg-indigo-600 h-full transition-all" 
                      style={{ width: `${stat.doingPercent}%` }} 
                      title={`${stat.doing} cuentas en curso (${stat.doingPercent}%)`}
                    />
                  )}
                  {stat.standbyPercent > 0 && (
                    <div 
                      className="bg-amber-500 h-full transition-all" 
                      style={{ width: `${stat.standbyPercent}%` }} 
                      title={`${stat.standby} cuentas en standby (${stat.standbyPercent}%)`}
                    />
                  )}
                  {stat.toDoPercent > 0 && (
                    <div 
                      className="bg-slate-200 h-full transition-all" 
                      style={{ width: `${stat.toDoPercent}%` }} 
                      title={`${stat.toDo} cuentas pendientes (${stat.toDoPercent}%)`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric Column 3: Insights by Company, Group & Critical Pre-requisites */}
        <div className="space-y-6">
          {/* Cohort / Group Status (e.g. Solvo Grupo 1 A) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Avance por Grupo / Cohorte</span>
            </h4>
            <div className="mt-4 space-y-3 text-xs">
              {['Grupo 1 A', 'Grupo 1 B', 'Prueba', 'Grupo 1'].map(grp => {
                const groupClients = clients.filter(c => c.grupo === grp);
                if (groupClients.length === 0) return null;

                const groupProgress = clientProgressList.filter(c => c.client.grupo === grp);
                const avgGrp = Math.round(groupProgress.reduce((acc, c) => acc + c.percentage, 0) / groupProgress.length);

                return (
                  <div key={grp} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{grp}</span>
                      <span className="text-indigo-600">{avgGrp}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${avgGrp}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {groupClients.length} cuentas asignadas
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Companies breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Cuentas por Compañía</span>
            </h4>
            <div className="mt-4 space-y-2.5 text-xs">
              {Array.from(new Set(clients.map(c => c.compania))).map(comp => {
                const count = clients.filter(c => c.compania === comp).length;
                const percent = Math.round((count / clients.length) * 100);

                return (
                  <div key={comp} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{comp}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-700 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="font-bold text-slate-900 text-right w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
