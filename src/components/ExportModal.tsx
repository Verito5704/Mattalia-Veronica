import React, { useState } from 'react';
import { ClientRecord, STAGES_LIST } from '../types';
import { X, Download, Copy, Check, FileSpreadsheet } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientRecord[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clients,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Generate CSV compatible with Excel
  const generateCSV = (): string => {
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
      c.cliente,
      c.lineaNegocio,
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

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const handleDownloadCSV = () => {
    const csvContent = '\uFEFF' + generateCSV(); // Add BOM for Excel UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trazabilidad_implementacion_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = () => {
    const csvContent = generateCSV();
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Exportar Datos a Excel / CSV</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600">
          <p>
            Exporta todos los datos actualizados de la pestaña <strong>Implementación</strong> con las columnas originales del Excel:
          </p>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1 font-mono">
            <div>• Clientes totales: <strong>{clients.length}</strong></div>
            <div>• Formato: CSV compatible con Microsoft Excel (UTF-8 con BOM)</div>
            <div>• Incluye: Prioridad, Grupo, Compañía, Cliente, Diagnóstico, Carpetas, 10 Etapas, Pre-requisitos, Fechas y Próximos pasos.</div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadCSV}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo CSV</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar CSV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
