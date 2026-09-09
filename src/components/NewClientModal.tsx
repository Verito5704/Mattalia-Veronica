import React, { useState } from 'react';
import { ClientRecord, STAGES_LIST } from '../types';
import { X, Plus, Building2, Users2, Calendar, Flame } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (newClient: ClientRecord) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient
}) => {
  if (!isOpen) return null;

  const [cliente, setCliente] = useState('');
  const [compania, setCompania] = useState('');
  const [grupo, setGrupo] = useState('Grupo 1');
  const [prioridad, setPrioridad] = useState<'Alta' | 'Media' | 'Baja'>('Alta');
  const [lineaNegocio, setLineaNegocio] = useState('');
  const [grupoTeams, setGrupoTeams] = useState('');
  const [preRequisitos, setPreRequisitos] = useState('Whitelist\nUsuarios\nInstalación Widget');
  const [fechaLimitePreRequisito, setFechaLimitePreRequisito] = useState('2026-09-15');
  const [proximosPasos, setProximosPasos] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !compania.trim()) return;

    const initialStages: Record<string, any> = {};
    STAGES_LIST.forEach((st, idx) => {
      initialStages[st.id] = idx === 0 ? 'Doing' : 'To Do';
    });

    const newRecord: ClientRecord = {
      id: `client-${Date.now()}`,
      prioridad,
      grupo,
      compania,
      cliente,
      lineaNegocio,
      canalAtencion: 'Voz',
      modoCaptura: 'Si',
      tipoCuenta: 'Cuenta Nueva',
      decision: 'Despliegue - Grupo 1',
      estado: 'Sin implementar',
      observaciones: '',
      grupoTeams: grupoTeams || `${compania} - ${cliente}`,
      diagnostico: 'Relevamiento inicial',
      estadoCarpeta: 'Carpeta en preparación',
      folderChecklist: {
        audios: 'vacio',
        scorecard: 'pendiente',
        evaluacionManual: 'no_hay',
        usuarios: 'no_lista'
      },
      etapas: initialStages,
      preRequisitos,
      informadoPor: 'Alex',
      fechaLimitePreRequisito,
      goLiveInicio: '',
      goLiveFin: '',
      proximosPasos
    };

    onAddClient(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Agregar Nuevo Cliente</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-800">Nombre del Cliente / Proceso *</label>
              <input
                type="text"
                required
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ej: Operations Coaching Process"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Compañía *</label>
              <input
                type="text"
                required
                value={compania}
                onChange={(e) => setCompania(e.target.value)}
                placeholder="Ej: Solvo, Apex, BeCall"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="Alta">Alta Prioridad</option>
                <option value="Media">Media Prioridad</option>
                <option value="Baja">Baja Prioridad</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Grupo</label>
              <select
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="Prueba">Prueba</option>
                <option value="Grupo 1">Grupo 1</option>
                <option value="Grupo 1 A">Grupo 1 A</option>
                <option value="Grupo 1 B">Grupo 1 B</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Línea de Negocio / Contacto</label>
              <input
                type="text"
                value={lineaNegocio}
                onChange={(e) => setLineaNegocio(e.target.value)}
                placeholder="Ej: Andres Posada"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-800">Grupo de Teams (Nombre del canal)</label>
              <input
                type="text"
                value={grupoTeams}
                onChange={(e) => setGrupoTeams(e.target.value)}
                placeholder="Ej: CalibrAIte Suite - SF Solvo"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-800">Pre-requisitos requeridos</label>
              <textarea
                rows={2}
                value={preRequisitos}
                onChange={(e) => setPreRequisitos(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Fecha Límite Pre-requisitos</label>
              <input
                type="date"
                value={fechaLimitePreRequisito}
                onChange={(e) => setFechaLimitePreRequisito(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Próximos pasos inmediatos</label>
              <input
                type="text"
                value={proximosPasos}
                onChange={(e) => setProximosPasos(e.target.value)}
                placeholder="Ej: Coordinar reunión de Kickoff"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
            >
              Crear Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
