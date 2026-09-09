/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ClientRecord, StageStatus, ViewMode, STAGES_LIST, ClientAToJRecord, RoadmapRecord } from './types';
import { 
  loadSavedClients, 
  saveClients, 
  resetClientsToDefault 
} from './data/initialClients';
import { generateAlerts, parseDateSafe } from './utils/alertUtils';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MetricsDashboard } from './components/MetricsDashboard';
import { TraceabilityTable } from './components/TraceabilityTable';
import { ColumnsAToJSheet } from './components/ColumnsAToJSheet';
import { RoadmapSheet } from './components/RoadmapSheet';
import { AlertsCenter } from './components/AlertsCenter';
import { AlertsDrawer } from './components/AlertsDrawer';
import { ClientDetailModal } from './components/ClientDetailModal';
import { NewClientModal } from './components/NewClientModal';
import { 
  Info, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  CalendarClock,
  Sparkles,
  BarChart3,
  ArrowRightLeft,
  UserPlus
} from 'lucide-react';

// Helper loaders for Clientes a traspasar and Clientes nuevos
const loadTraspasarRecords = (initialList: ClientRecord[]): ClientAToJRecord[] => {
  try {
    const saved = localStorage.getItem('calibraite_traspasar_records');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading traspasar records', e);
  }
  return initialList
    .filter(c => c.tipoCuenta.toLowerCase().includes('calibraite') || c.decision.toLowerCase().includes('migrar'))
    .map(c => ({
      id: `traspaso_${c.id}`,
      prioridad: c.prioridad,
      grupo: c.grupo,
      compania: c.compania,
      cliente: c.cliente,
      lineaNegocio: c.lineaNegocio,
      canalAtencion: c.canalAtencion,
      modoCaptura: c.modoCaptura,
      tipoCuenta: c.tipoCuenta,
      decision: c.decision,
      estado: c.estado,
      observaciones: c.observaciones
    }));
};

const loadNuevosRecords = (initialList: ClientRecord[]): ClientAToJRecord[] => {
  try {
    const saved = localStorage.getItem('calibraite_nuevos_records');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading nuevos records', e);
  }
  return initialList
    .filter(c => c.tipoCuenta === 'Cuenta Nueva' && !c.decision.toLowerCase().includes('migrar'))
    .map(c => ({
      id: `nuevo_${c.id}`,
      prioridad: c.prioridad,
      grupo: c.grupo,
      compania: c.compania,
      cliente: c.cliente,
      lineaNegocio: c.lineaNegocio,
      canalAtencion: c.canalAtencion,
      modoCaptura: c.modoCaptura,
      tipoCuenta: c.tipoCuenta,
      decision: c.decision,
      estado: c.estado,
      observaciones: c.observaciones
    }));
};

const INITIAL_ROADMAP_RECORDS: RoadmapRecord[] = [
  {
    id: 'road_1',
    prioridad: '1',
    categoria: 'Módulo CalibrAIte',
    features: 'Modulo de Dashboard',
    descripcion: 'Modulo con Dashboard operativos',
    responsable: 'Silia',
    fechaInicio: '07/09/2026',
    fechaCompromiso: '11/9/2026',
    fechaEntrega: '',
    notas: ''
  },
  {
    id: 'road_2',
    prioridad: '2',
    categoria: 'Módulo CalibrAIte',
    features: 'Self Service Implementación',
    descripcion: 'Modulo de autonomia para Implementaciones',
    responsable: 'Silia',
    fechaInicio: '21/09/2026',
    fechaCompromiso: '21/9/2026',
    fechaEntrega: '',
    notas: ''
  },
  {
    id: 'road_3',
    prioridad: '3',
    categoria: 'Módulo CalibrAIte',
    features: 'Implementacion 6 cliente Calibaite Grupo1A',
    descripcion: 'Primera muestra clientes',
    responsable: 'Silia',
    fechaInicio: '07/09/2026',
    fechaCompromiso: '11/9/2026',
    fechaEntrega: '',
    notas: ''
  },
  {
    id: 'road_4',
    prioridad: '4',
    categoria: 'Módulo CalibrAIte',
    features: 'Implementacion 6 cliente Calibaite Grupo1B',
    descripcion: 'Segunda muestra de clientes',
    responsable: 'Silia',
    fechaInicio: '14/09/2026',
    fechaCompromiso: '18/9/2026',
    fechaEntrega: '',
    notas: ''
  },
  {
    id: 'road_5',
    prioridad: '5',
    categoria: 'Módulo CalibrAIte',
    features: 'Capacitacion Final implementaciones SS',
    descripcion: 'Capacitacion equipo para operar',
    responsable: 'Silia',
    fechaInicio: '21/09/2026',
    fechaCompromiso: '22/9/2026',
    fechaEntrega: '',
    notas: ''
  },
  {
    id: 'road_6',
    prioridad: '6',
    categoria: 'Módulo CalibrAIte',
    features: 'Dimensionamiento de CI Imple',
    descripcion: 'Organizacion de implementaciones para clientes nuevos',
    responsable: 'Imple',
    fechaInicio: '23/09/2026',
    fechaCompromiso: '24/9/2026',
    fechaEntrega: '',
    notas: ''
  }
];

const loadRoadmapRecords = (): RoadmapRecord[] => {
  try {
    const saved = localStorage.getItem('calibraite_roadmap_records');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading roadmap records', e);
  }
  return INITIAL_ROADMAP_RECORDS;
};

export default function App() {
  // 1. Core Data State (Matriz Excel as primary view)
  const [clients, setClients] = useState<ClientRecord[]>(() => loadSavedClients());
  const [currentView, setCurrentView] = useState<ViewMode>('matriz');

  // Sub-sheets: Clientes a traspasar and Clientes nuevos
  const [traspasarRecords, setTraspasarRecords] = useState<ClientAToJRecord[]>(() => loadTraspasarRecords(clients));
  const [nuevosRecords, setNuevosRecords] = useState<ClientAToJRecord[]>(() => loadNuevosRecords(clients));
  const [roadmapRecords, setRoadmapRecords] = useState<RoadmapRecord[]>(() => loadRoadmapRecords());
  
  // Reference date for alerts calculation (default: 8 de Septiembre 2026)
  const [referenceDateStr, setReferenceDateStr] = useState<string>('2026-09-08');
  const referenceDate = useMemo(() => {
    return parseDateSafe(referenceDateStr) || new Date(2026, 8, 8);
  }, [referenceDateStr]);

  // 2. Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrioridad, setSelectedPrioridad] = useState('todas');
  const [selectedGrupo, setSelectedGrupo] = useState('todos');
  const [selectedCompania, setSelectedCompania] = useState('todas');
  const [onlyHighPriority, setOnlyHighPriority] = useState(false);
  const [groupByTeams, setGroupByTeams] = useState(false);
  const [sortBy, setSortBy] = useState<'prioridad' | 'nombre' | 'fechaLimite' | 'compania'>('prioridad');

  // 3. Modals State
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('calibraite_traspasar_records', JSON.stringify(traspasarRecords));
    } catch (e) {
      console.error(e);
    }
  }, [traspasarRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('calibraite_nuevos_records', JSON.stringify(nuevosRecords));
    } catch (e) {
      console.error(e);
    }
  }, [nuevosRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('calibraite_roadmap_records', JSON.stringify(roadmapRecords));
    } catch (e) {
      console.error(e);
    }
  }, [roadmapRecords]);

  // Sub-sheets handlers
  const handleUpdateSingleTraspasar = (record: ClientAToJRecord) => {
    setTraspasarRecords(prev => prev.map(r => r.id === record.id ? record : r));
    showToast(`Cliente "${record.cliente}" actualizado en traspasos`);
  };

  const handleAddTraspasar = (record: ClientAToJRecord) => {
    setTraspasarRecords(prev => [record, ...prev]);
    showToast(`Cliente "${record.cliente}" agregado a traspasos`);
  };

  const handleDeleteTraspasar = (id: string) => {
    setTraspasarRecords(prev => prev.filter(r => r.id !== id));
    showToast('Fila eliminada de traspasos');
  };

  const handleUpdateSingleNuevo = (record: ClientAToJRecord) => {
    setNuevosRecords(prev => prev.map(r => r.id === record.id ? record : r));
    showToast(`Cliente nuevo "${record.cliente}" actualizado`);
  };

  const handleAddNuevo = (record: ClientAToJRecord) => {
    setNuevosRecords(prev => [record, ...prev]);
    showToast(`Cliente nuevo "${record.cliente}" agregado`);
  };

  const handleDeleteNuevo = (id: string) => {
    setNuevosRecords(prev => prev.filter(r => r.id !== id));
    showToast('Fila eliminada de clientes nuevos');
  };

  // Roadmap handlers
  const handleUpdateRoadmapRecord = (record: RoadmapRecord) => {
    setRoadmapRecords(prev => prev.map(r => r.id === record.id ? record : r));
    showToast(`Feature "${record.features}" actualizado`);
  };

  const handleAddRoadmapRecord = (record: RoadmapRecord) => {
    setRoadmapRecords(prev => [record, ...prev]);
    showToast(`Nuevo feature "${record.features}" agregado`);
  };

  const handleDeleteRoadmapRecord = (id: string) => {
    setRoadmapRecords(prev => prev.filter(r => r.id !== id));
    showToast('Feature eliminado del roadmap');
  };

  const handleMoveToMatrix = (id: string, type: 'traspasar' | 'nuevos') => {
    const sourceList = type === 'traspasar' ? traspasarRecords : nuevosRecords;
    const record = sourceList.find(r => r.id === id);
    if (!record) return;

    const exists = clients.some(c => c.id === record.id || c.cliente === record.cliente);
    if (exists) {
      showToast(`El cliente "${record.cliente}" ya existe en la matriz.`);
      return;
    }

    const newClient: ClientRecord = {
      id: record.id.replace('traspaso_', '').replace('nuevo_', '') + '_migrado',
      prioridad: (record.prioridad as any) || 'Media',
      grupo: record.grupo,
      compania: record.compania,
      pais: record.pais,
      cliente: record.cliente,
      lineaNegocio: record.lineaNegocio,
      canalAtencion: record.canalAtencion,
      modoCaptura: record.modoCaptura || 'TBD',
      tipoCuenta: record.tipoCuenta || 'Cuenta Nueva',
      decision: record.decision || '',
      estado: record.estado || 'Sin implementar',
      observaciones: record.observaciones || '',
      grupoTeams: '',
      diagnostico: '',
      estadoCarpeta: 'Pendiente',
      folderChecklist: { audios: 'vacio', scorecard: 'pendiente', evaluacionManual: 'vacio', usuarios: 'vacio' },
      etapas: {},
      preRequisitos: '',
      informadoPor: '',
      fechaLimitePreRequisito: '',
      goLiveCompleto: record.goLiveCompleto || '',
      paralelo: record.paralelo || '',
      goLiveInicio: '',
      goLiveFin: '',
      proximosPasos: '',
      origenTraspaso: type === 'traspasar',
      updatedAt: new Date().toISOString()
    };

    setClients(prev => [newClient, ...prev]);

    if (type === 'traspasar') {
      setTraspasarRecords(prev => prev.filter(r => r.id !== id));
    } else {
      setNuevosRecords(prev => prev.filter(r => r.id !== id));
    }
    showToast(`Cliente "${record.cliente}" enviado a la Matriz de Calidad`);
  };

  const handleMoveToTraspasar = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    const record: ClientAToJRecord = {
      id: client.id,
      prioridad: client.prioridad,
      grupo: client.grupo,
      compania: client.compania,
      pais: client.pais,
      cliente: client.cliente,
      lineaNegocio: client.lineaNegocio,
      canalAtencion: client.canalAtencion,
      modoCaptura: client.modoCaptura,
      tipoCuenta: client.tipoCuenta,
      decision: client.decision,
      estado: client.estado,
      observaciones: client.observaciones,
      goLiveCompleto: client.goLiveCompleto,
      paralelo: client.paralelo
    };

    if (client.origenTraspaso || client.tipoCuenta?.toLowerCase().includes('calibraite')) {
      setTraspasarRecords(prev => [record, ...prev]);
    } else {
      setNuevosRecords(prev => [record, ...prev]);
    }

    setClients(prev => prev.filter(c => c.id !== id));
    showToast(`Cliente "${client.cliente}" devuelto a la pestaña anterior`);
  };

  // Calculate Alerts
  const alerts = useMemo(() => {
    return generateAlerts(clients, referenceDate);
  }, [clients, referenceDate]);

  // Dynamic available filters
  const availableGrupos = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => {
      if (c.grupo) set.add(c.grupo);
    });
    return Array.from(set);
  }, [clients]);

  const availableCompanias = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => {
      if (c.compania) set.add(c.compania);
    });
    return Array.from(set);
  }, [clients]);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Handlers for stages & clients
  const handleUpdateClientStage = (clientId: string, stageId: string, newStatus?: StageStatus) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const nextStatus = newStatus || (
          c.etapas[stageId] === 'Done' ? 'To Do' :
          c.etapas[stageId] === 'Doing' ? 'Done' : 'Doing'
        );
        return {
          ...c,
          etapas: {
            ...c.etapas,
            [stageId]: nextStatus
          },
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    const client = clients.find(c => c.id === clientId);
    if (client) {
      showToast(`${client.cliente}: etapa actualizada a "${newStatus || 'Avanzada'}"`);
    }
  };

  const handleSelectClient = (client: ClientRecord) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const handleSelectClientById = (clientId: string) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setSelectedClient(found);
      setIsDetailModalOpen(true);
    }
  };

  const handleSaveClient = (updatedClient: ClientRecord) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
    showToast(`Guardados cambios en ${updatedClient.cliente}`);
  };

  const handleAddClient = (newClient: ClientRecord) => {
    setClients(prev => [newClient, ...prev]);
    showToast(`Cliente "${newClient.cliente}" agregado con éxito`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedPrioridad('todas');
    setSelectedGrupo('todos');
    setSelectedCompania('todas');
    setOnlyHighPriority(false);
    setGroupByTeams(false);
    setSortBy('prioridad');
  };

  const handleResetDataToOriginal = () => {
    if (confirm('¿Restablecer datos originales del Excel (pestaña Implementación)?')) {
      const original = resetClientsToDefault();
      setClients(original);
      showToast('Datos originales de la pestaña Implementación restablecidos.');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Prioridad',
      'Grupo',
      'Compañía',
      'Indique el cliente',
      'Indique la lineal de negocio del Cliente',
      'Canal de atencion',
      'Modo Captura',
      'Tipo de Cuenta',
      'Decisión',
      'Estado',
      'Observaciones',
      'Grupo Teams',
      'Diagnóstico',
      'ESTADO CARPETA',
      ...STAGES_LIST.map(s => s.name),
      'Pre-requisitos',
      'Informado por',
      'Fecha Limite Pre-Requisito',
      'Go-Live Inicio',
      'Go-Live Fin',
      'Próximos pasos'
    ];

    const rows = clients.map(c => [
      c.prioridad,
      c.grupo,
      c.compania,
      `"${c.cliente.replace(/"/g, '""')}"`,
      `"${(c.lineaNegocio || '').replace(/"/g, '""')}"`,
      c.canalAtencion,
      c.modoCaptura,
      c.tipoCuenta,
      c.decision,
      c.estado,
      `"${(c.observaciones || '').replace(/"/g, '""')}"`,
      `"${(c.grupoTeams || '').replace(/"/g, '""')}"`,
      `"${(c.diagnostico || '').replace(/"/g, '""')}"`,
      `"${(c.estadoCarpeta || '').replace(/"/g, '""')}"`,
      ...STAGES_LIST.map(s => c.etapas[s.id] || 'To Do'),
      `"${(c.preRequisitos || '').replace(/"/g, '""')}"`,
      `"${(c.informadoPor || '').replace(/"/g, '""')}"`,
      c.fechaLimitePreRequisito,
      c.goLiveInicio,
      c.goLiveFin,
      `"${(c.proximosPasos || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `implementacion_calibraite_${referenceDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV descargado para Excel');
  };

  // Filtered and Sorted Clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesClient = client.cliente.toLowerCase().includes(q);
        const matchesCompany = client.compania.toLowerCase().includes(q);
        const matchesGroup = client.grupo.toLowerCase().includes(q);
        const matchesLine = (client.lineaNegocio || '').toLowerCase().includes(q);
        const matchesTeams = (client.grupoTeams || '').toLowerCase().includes(q);
        const matchesInfo = (client.informadoPor || '').toLowerCase().includes(q);
        const matchesDiag = (client.diagnostico || '').toLowerCase().includes(q);
        const matchesSteps = (client.proximosPasos || '').toLowerCase().includes(q);

        if (!matchesClient && !matchesCompany && !matchesGroup && !matchesLine && !matchesTeams && !matchesInfo && !matchesDiag && !matchesSteps) {
          return false;
        }
      }

      // Prioridad
      if (selectedPrioridad !== 'todas' && client.prioridad !== selectedPrioridad) {
        return false;
      }
      if (onlyHighPriority && client.prioridad !== 'Alta') {
        return false;
      }

      // Grupo
      if (selectedGrupo !== 'todos' && client.grupo !== selectedGrupo) {
        return false;
      }

      // Compañía
      if (selectedCompania !== 'todas' && client.compania !== selectedCompania) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'prioridad') {
        const pOrder: Record<string, number> = { Alta: 1, Media: 2, Baja: 3 };
        return (pOrder[a.prioridad] || 4) - (pOrder[b.prioridad] || 4);
      }
      if (sortBy === 'nombre') {
        return a.cliente.localeCompare(b.cliente);
      }
      if (sortBy === 'compania') {
        return a.compania.localeCompare(b.compania);
      }
      if (sortBy === 'fechaLimite') {
        return (a.fechaLimitePreRequisito || '9999').localeCompare(b.fechaLimitePreRequisito || '9999');
      }
      return 0;
    });
  }, [clients, searchTerm, selectedPrioridad, selectedGrupo, selectedCompania, onlyHighPriority, sortBy]);

  // Executive summary counts
  const solvoGrupo1ACount = clients.filter(c => c.grupo === 'Grupo 1 A').length;
  const urgentAlertsCount = alerts.filter(a => a.tipo === 'urgente').length;
  const missingAudiosCount = alerts.filter(a => a.tipo === 'carpeta_incompleta' && a.titulo.includes('audios')).length;
  const missingManualCount = alerts.filter(a => a.tipo === 'carpeta_incompleta' && a.titulo.includes('manual')).length;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        alerts={alerts}
        onOpenAlertsModal={() => setIsAlertsDrawerOpen(true)}
        onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
        onExportCSV={handleExportCSV}
        referenceDateStr={referenceDateStr}
        onChangeReferenceDate={setReferenceDateStr}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Header Ribbon: Context & Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              {currentView === 'matriz' && 'Prioritarios'}
              {currentView === 'traspasar' && 'Clientes a Traspasar'}
              {currentView === 'nuevos' && 'Clientes Nuevos'}
              {currentView === 'metricas' && 'Métricas y Progreso'}
              {currentView === 'alertas' && 'Diagnóstico y Alertas'}
              {currentView === 'roadmap' && 'Roadmap de Producto'}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
              {currentView === 'traspasar' ? `${traspasarRecords.length} Filas` :
               currentView === 'nuevos' ? `${nuevosRecords.length} Filas` :
               currentView === 'roadmap' ? `${roadmapRecords.length} Features` :
               `${clients.length} Registros`}
            </span>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => {
                setSelectedGrupo('Grupo 1 A');
                setCurrentView('matriz');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-semibold transition shadow-sm"
              title="Filtrar clientes prioritarios Grupo 1 A (Go-Live 21 Sept)"
            >
              <CalendarClock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Solvo Grupo 1 A ({solvoGrupo1ACount})</span>
            </button>

            <button
              onClick={() => setCurrentView('metricas')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 font-semibold transition shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Métricas</span>
            </button>
          </div>
        </div>

        {/* Global Filter Bar (Matriz and Metrics views) */}
        {(currentView === 'matriz' || currentView === 'metricas' || currentView === 'pipeline') && (
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedPrioridad={selectedPrioridad}
            onPrioridadChange={setSelectedPrioridad}
            selectedGrupo={selectedGrupo}
            onGrupoChange={setSelectedGrupo}
            selectedCompania={selectedCompania}
            onCompaniaChange={setSelectedCompania}
            onlyHighPriority={onlyHighPriority}
            onToggleOnlyHighPriority={() => setOnlyHighPriority(prev => !prev)}
            groupByTeams={groupByTeams}
            onToggleGroupByTeams={() => setGroupByTeams(prev => !prev)}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            onResetFilters={handleResetFilters}
            totalFiltered={filteredClients.length}
            totalAll={clients.length}
            availableGrupos={availableGrupos}
            availableCompanias={availableCompanias}
          />
        )}

        {/* Active View */}
        {currentView === 'matriz' && (
          <TraceabilityTable
            clients={filteredClients}
            onSelectClient={handleSelectClient}
            onUpdateClientStage={handleUpdateClientStage}
            referenceDate={referenceDate}
            groupByTeams={groupByTeams}
            onMoveToTraspasar={handleMoveToTraspasar}
          />
        )}

        {currentView === 'traspasar' && (
          <ColumnsAToJSheet
            type="traspasar"
            records={traspasarRecords}
            matrixClients={clients}
            onSaveRecords={(recs) => {
              setTraspasarRecords(recs);
              showToast('Registros de traspaso actualizados');
            }}
            onUpdateSingleRecord={handleUpdateSingleTraspasar}
            onAddRecord={handleAddTraspasar}
            onDeleteRecord={handleDeleteTraspasar}
            onMoveToMatrix={(id) => handleMoveToMatrix(id, 'traspasar')}
          />
        )}

        {currentView === 'nuevos' && (
          <ColumnsAToJSheet
            type="nuevos"
            records={nuevosRecords}
            matrixClients={clients}
            onSaveRecords={(recs) => {
              setNuevosRecords(recs);
              showToast('Registros de clientes nuevos actualizados');
            }}
            onUpdateSingleRecord={handleUpdateSingleNuevo}
            onAddRecord={handleAddNuevo}
            onDeleteRecord={handleDeleteNuevo}
            onMoveToMatrix={(id) => handleMoveToMatrix(id, 'nuevos')}
          />
        )}

        {(currentView === 'metricas' || currentView === 'pipeline') && (
          <MetricsDashboard
            clients={filteredClients}
            onSelectClient={handleSelectClient}
            onUpdateClientStage={handleUpdateClientStage}
            referenceDate={referenceDate}
            groupByTeams={groupByTeams}
          />
        )}

        {currentView === 'alertas' && (
          <AlertsCenter
            alerts={alerts}
            clients={clients}
            onSelectClientById={handleSelectClientById}
            referenceDateStr={referenceDateStr}
          />
        )}

        {currentView === 'roadmap' && (
          <RoadmapSheet
            records={roadmapRecords}
            referenceDate={referenceDate}
            onSaveRecords={(recs) => {
              setRoadmapRecords(recs);
              showToast('Roadmap actualizado');
            }}
            onUpdateSingleRecord={handleUpdateRoadmapRecord}
            onAddRecord={handleAddRoadmapRecord}
            onDeleteRecord={handleDeleteRoadmapRecord}
          />
        )}
      </main>

      {/* Toast Alert Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-100">{toastMessage}</span>
        </div>
      )}

      {/* Client Detail & Edit Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedClient(null);
          }}
          onSave={handleSaveClient}
          referenceDate={referenceDate}
        />
      )}

      {/* New Client Modal */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onAddClient={handleAddClient}
      />

      {/* Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onSelectClientById={handleSelectClientById}
        onGoToAlertsCenter={() => {
          setIsAlertsDrawerOpen(false);
          setCurrentView('alertas');
        }}
      />
    </div>
  );
}
