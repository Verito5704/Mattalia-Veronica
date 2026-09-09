import React, { useState, useEffect } from 'react';
import { 
  ClientRecord, 
  STAGES_LIST, 
  StageStatus,
  FolderChecklist
} from '../types';
import { parseDateSafe, getDaysDifference } from '../utils/alertUtils';
import { 
  X, 
  Building2, 
  Users2, 
  Flame, 
  AlertCircle, 
  Calendar, 
  Save, 
  Check
} from 'lucide-react';

interface ClientDetailModalProps {
  client: ClientRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClient: ClientRecord) => void;
  referenceDate: Date;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave,
  referenceDate
}) => {
  const [formData, setFormData] = useState<ClientRecord>({ ...client });
  const [activeTab, setActiveTab] = useState<'etapas' | 'prerequisitos' | 'carpetas' | 'general'>('etapas');

  useEffect(() => {
    setFormData({ ...client });
  }, [client]);

  if (!isOpen) return null;

  const handleStageStatusChange = (stageId: string, status: StageStatus) => {
    setFormData(prev => ({
      ...prev,
      etapas: {
        ...prev.etapas,
        [stageId]: status
      }
    }));
  };

  const handleFolderChecklistChange = (field: keyof FolderChecklist, value: any) => {
    setFormData(prev => ({
      ...prev,
      folderChecklist: {
        ...prev.folderChecklist,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // Pre-requisite alert calculation
  let preReqAlert = null;
  if (formData.fechaLimitePreRequisito) {
    const target = parseDateSafe(formData.fechaLimitePreRequisito);
    if (target) {
      const diff = getDaysDifference(target, referenceDate);
      if (diff < 0) {
        preReqAlert = {
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          badge: `Vencido hace ${Math.abs(diff)} días`,
          isUrgent: true
        };
      } else if (diff <= 3) {
        preReqAlert = {
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          badge: diff === 0 ? 'Vence HOY' : `Vence en ${diff} días`,
          isUrgent: false
        };
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                formData.prioridad === 'Alta' 
                  ? 'bg-rose-50 text-rose-700 border-rose-300' 
                  : formData.prioridad === 'Media'
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {formData.prioridad === 'Alta' && <Flame className="w-3 h-3 fill-rose-600 text-rose-600" />}
                <span>Prioridad {formData.prioridad}</span>
              </span>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 border border-slate-300">
                {formData.grupo}
              </span>

              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                {formData.compania}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {formData.cliente}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {formData.lineaNegocio || 'Sin línea especificada'} • {formData.tipoCuenta} • Canal {formData.canalAtencion}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teams Channel Callout Banner */}
        <div className="bg-indigo-50/90 px-6 py-2.5 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center space-x-2">
            <Users2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold">Grupo de Teams:</span>
            <span className="font-medium bg-white px-2 py-0.5 rounded border border-indigo-200">{formData.grupoTeams || 'Sin asignar'}</span>
          </div>
          {preReqAlert && (
            <span className={`font-bold px-2 py-0.5 rounded border text-[11px] flex items-center space-x-1 ${preReqAlert.color}`}>
              <AlertCircle className="w-3 h-3" />
              <span>{preReqAlert.badge}</span>
            </span>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('etapas')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'etapas' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Flujo de Etapas (9 fases)
          </button>
          <button
            onClick={() => setActiveTab('prerequisitos')}
            className={`py-3 border-b-2 transition-colors flex items-center space-x-1 ${
              activeTab === 'prerequisitos' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pre-requisitos & Fechas</span>
            {preReqAlert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('carpetas')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'carpetas' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Estado de Carpeta & Diagnóstico
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'general' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Datos Generales & Próximos Pasos
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: ETAPAS */}
          {activeTab === 'etapas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Progreso por Etapas de Implementación
                </h3>
                <span className="text-xs text-slate-500">
                  Haz clic en el estado para actualizar
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STAGES_LIST.map((stage, idx) => {
                  const currentStatus = formData.etapas[stage.id] || 'To Do';
                  return (
                    <div 
                      key={stage.id} 
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate" title={stage.name}>
                          {idx + 1}. {stage.name}
                        </span>
                      </div>

                      {/* Status Selector Pills */}
                      <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold">
                        {(['To Do', 'Doing', 'Done', 'Standby'] as StageStatus[]).map((statusOption) => (
                          <button
                            key={statusOption}
                            type="button"
                            onClick={() => handleStageStatusChange(stage.id, statusOption)}
                            className={`py-1 rounded text-center transition-all ${
                              currentStatus === statusOption
                                ? statusOption === 'Done'
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                  : statusOption === 'Doing'
                                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                                  : statusOption === 'Standby'
                                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                                  : 'bg-slate-700 text-white font-bold shadow-xs'
                                : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {statusOption}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PRE-REQUISITOS */}
          {activeTab === 'prerequisitos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pre-requisitos description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-800">
                    Pre-requisitos que debe cumplir el cliente:
                  </label>
                  <textarea
                    rows={4}
                    value={formData.preRequisitos}
                    onChange={(e) => setFormData({ ...formData, preRequisitos: e.target.value })}
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="Whitelist, Usuarios, Instalación de Widget, Cuota, etc."
                  />
                </div>

                {/* Fecha límite pre-requisito */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fecha Límite para Envío:</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fechaLimitePreRequisito}
                    onChange={(e) => setFormData({ ...formData, fechaLimitePreRequisito: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Informado por / Vía */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    ¿Quién informa y por qué vía?
                  </label>
                  <input
                    type="text"
                    value={formData.informadoPor}
                    onChange={(e) => setFormData({ ...formData, informadoPor: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                    placeholder="Lugar: Teams | Responsable: Alex | Imple: CharlyA"
                  />
                </div>

                {/* Go-Live Inicio */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Go-Live Inicio estimado:
                  </label>
                  <input
                    type="date"
                    value={formData.goLiveInicio}
                    onChange={(e) => setFormData({ ...formData, goLiveInicio: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                {/* Go-Live Fin */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Go-Live Fin / Salida a Producción:
                  </label>
                  <input
                    type="date"
                    value={formData.goLiveFin}
                    onChange={(e) => setFormData({ ...formData, goLiveFin: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CARPETAS & DIAGNÓSTICO */}
          {activeTab === 'carpetas' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-3">
                  Checklist de Documentación en Carpeta
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Audios */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Audios de Muestra:</label>
                    <select
                      value={formData.folderChecklist.audios}
                      onChange={(e) => handleFolderChecklistChange('audios', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="ok">Audios OK</option>
                      <option value="parcial">Muestra Parcial (pocas llamadas)</option>
                      <option value="vacio">Carpeta vacía</option>
                      <option value="no_hay">No hay audios disponibles</option>
                    </select>
                  </div>

                  {/* Scorecard */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Scorecard / Rúbrica:</label>
                    <select
                      value={formData.folderChecklist.scorecard}
                      onChange={(e) => handleFolderChecklistChange('scorecard', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="ok">Scorecard OK</option>
                      <option value="borrador">Scorecard Borrador</option>
                      <option value="pendiente">Pendiente de entrega</option>
                    </select>
                  </div>

                  {/* Evaluaciones Manuales */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Evaluaciones Manuales (Contraste):</label>
                    <select
                      value={formData.folderChecklist.evaluacionManual}
                      onChange={(e) => handleFolderChecklistChange('evaluacionManual', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="ok">Evaluaciones Manuales OK</option>
                      <option value="no_visualiza">No se visualiza en carpeta</option>
                      <option value="no_hay">No hay evaluaciones cargadas</option>
                    </select>
                  </div>

                  {/* Usuarios */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Lista de Usuarios & Permisos:</label>
                    <select
                      value={formData.folderChecklist.usuarios}
                      onChange={(e) => handleFolderChecklistChange('usuarios', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="ok">Lista de usuarios OK</option>
                      <option value="enviado_mail">Enviado por correo</option>
                      <option value="no_lista">No está la lista</option>
                      <option value="vacio">Vacio / Sin definir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Diagnóstico Técnico:</label>
                <input
                  type="text"
                  value={formData.diagnostico}
                  onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  placeholder="Ej: Audios, scorecard, carpeta de resultado de pruebas vacía"
                />
              </div>

              {/* Observaciones generales */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Observaciones del Cliente:</label>
                <textarea
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  placeholder="Anotaciones clave de la reunión o mesa de trabajo"
                />
              </div>
            </div>
          )}

          {/* TAB 4: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Nombre de Cliente / Proceso:</label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Compañía:</label>
                  <input
                    type="text"
                    value={formData.compania}
                    onChange={(e) => setFormData({ ...formData, compania: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Grupo:</label>
                  <select
                    value={formData.grupo}
                    onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Prueba">Prueba</option>
                    <option value="Grupo 1">Grupo 1</option>
                    <option value="Grupo 1 A">Grupo 1 A</option>
                    <option value="Grupo 1 B">Grupo 1 B</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Prioridad:</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Grupo de Teams (Canal):</label>
                  <input
                    type="text"
                    value={formData.grupoTeams}
                    onChange={(e) => setFormData({ ...formData, grupoTeams: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Tipo de Cuenta:</label>
                  <input
                    type="text"
                    value={formData.tipoCuenta}
                    onChange={(e) => setFormData({ ...formData, tipoCuenta: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

              </div>

              {/* Próximos pasos */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Próximos Pasos & Acciones Inmediatas:</label>
                <textarea
                  rows={4}
                  value={formData.proximosPasos}
                  onChange={(e) => setFormData({ ...formData, proximosPasos: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300"
                  placeholder="Detallar próximos pasos del proyecto"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>

      </div>
    </div>
  );
};
