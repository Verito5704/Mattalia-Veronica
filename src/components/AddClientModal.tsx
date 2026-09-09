import React, { useState } from 'react';
import { ClientRecord, FolderChecklist, StageStatus } from '../types';
import { X, PlusCircle } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (newClient: ClientRecord) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  if (!isOpen) return null;

  const [cliente, setCliente] = useState('');
  const [compania, setCompania] = useState('Solvo');
  const [grupo, setGrupo] = useState('Grupo 1 A');
  const [prioridad, setPrioridad] = useState<'Alta' | 'Media' | 'Baja'>('Alta');
  const [lineaNegocio, setLineaNegocio] = useState('');
  const [canalAtencion, setCanalAtencion] = useState('Voz');
  const [grupoTeams, setGrupoTeams] = useState('');
  const [fechaLimitePreRequisito, setFechaLimitePreRequisito] = useState('11-sept');
  const [goLiveFin, setGoLiveFin] = useState('21-sept');
  const [proximosPasos, setProximosPasos] = useState('');
  const [preRequisitos, setPreRequisitos] = useState('Whitelist\nUsuarios\nInstalación Widget\nConfigurar permisos');
  const [informadoPor, setInformadoPor] = useState('Lugar: Teams\nResponsable: Alex');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim()) return;

    const newRecord: ClientRecord = {
      id: `cli-${Date.now()}`,
      cliente: cliente.trim(),
      compania,
      grupo,
      prioridad,
      lineaNegocio: lineaNegocio.trim() || 'General',
      canalAtencion: canalAtencion.trim() || 'Voz',
      modoCaptura: 'Si',
      tipoCuenta: 'Cuenta Nueva',
      decision: 'Despliegue - Grupo 1',
      estado: 'Sin implementar',
      observaciones: 'Cliente incorporado para despliegue',
      grupoTeams: grupoTeams.trim() || `CalibrAIte - ${cliente.trim()}`,
      diagnostico: 'Iniciando trazabilidad de pre-requisitos',
      estadoCarpeta: 'Carpeta en preparación',
      folderChecklist: {
        audios: 'no_hay',
        scorecard: 'pendiente',
        evaluacionManual: 'no_hay',
        usuarios: 'no_lista',
        detalles: 'Insumos pendientes de entrega'
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
      preRequisitos,
      informadoPor,
      fechaLimitePreRequisito,
      goLiveInicio: fechaLimitePreRequisito,
      goLiveFin,
      proximosPasos: proximosPasos || 'Coordinar entrega de scorecard y audios muestra',
      diasSeguimiento: 'L, M, M, J, V'
    };

    onAddClient(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">Agregar Nuevo Cliente al Despliegue</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Cliente / Servicio *</label>
              <input
                required
                type="text"
                placeholder="Ej. 10_New Client Account"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Compañía</label>
              <select
                value={compania}
                onChange={(e) => setCompania(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Solvo">Solvo</option>
                <option value="Apex">Apex</option>
                <option value="BeCall">BeCall</option>
                <option value="TBPO">TBPO</option>
                <option value="Onesource">Onesource</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grupo</label>
              <select
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Grupo 1 A">Grupo 1 A</option>
                <option value="Grupo 1 B">Grupo 1 B</option>
                <option value="Grupo 1">Grupo 1</option>
                <option value="Prueba">Prueba</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Canal Atención</label>
              <input
                type="text"
                value={canalAtencion}
                onChange={(e) => setCanalAtencion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Línea de Negocio / Responsable Cliente</label>
            <input
              type="text"
              placeholder="Ej. Andres Posada, Gus Perez, Operaciones..."
              value={lineaNegocio}
              onChange={(e) => setLineaNegocio(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Límite Pre-Requisito</label>
              <input
                type="text"
                placeholder="11-sept"
                value={fechaLimitePreRequisito}
                onChange={(e) => setFechaLimitePreRequisito(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Go-Live Objetivo</label>
              <input
                type="text"
                placeholder="21-sept"
                value={goLiveFin}
                onChange={(e) => setGoLiveFin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Grupo en Teams</label>
            <input
              type="text"
              placeholder="Ej. CalibrAIte Suite - Nombre de Canal"
              value={grupoTeams}
              onChange={(e) => setGrupoTeams(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Próximos Pasos Iniciales</label>
            <textarea
              rows={2}
              placeholder="Ej. Kickoff realizado, solicitar carpeta de audios y scorecard..."
              value={proximosPasos}
              onChange={(e) => setProximosPasos(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-sm"
            >
              Agregar a la Matriz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
