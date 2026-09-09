import React, { useState, useMemo } from 'react';
import { ClientAToJRecord, ClientRecord } from '../types';
import { 
  Plus, 
  Download, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Filter, 
  RefreshCw,
  X,
  FileSpreadsheet,
  ArrowRightLeft,
  Sparkles,
  ChevronDown,
  ClipboardPaste,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ColumnsAToJSheetProps {
  type: 'traspasar' | 'nuevos';
  records: ClientAToJRecord[];
  matrixClients: ClientRecord[];
  onSaveRecords: (records: ClientAToJRecord[]) => void;
  onUpdateSingleRecord: (record: ClientAToJRecord) => void;
  onAddRecord: (record: ClientAToJRecord) => void;
  onDeleteRecord: (id: string) => void;
  onMoveToMatrix: (id: string) => void;
}

// Robust TSV/CSV Parser for spreadsheet paste with Header Auto-Mapping
function parseSpreadsheetPaste(rawText: string, prefix: string): ClientAToJRecord[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const results: ClientAToJRecord[] = [];
  
  // Detect separator: check first non-empty line
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  let sep = '\t';
  if (tabCount >= 2) {
    sep = '\t';
  } else if (semicolonCount >= 2) {
    sep = ';';
  } else if (commaCount >= 2) {
    sep = ',';
  }

  // Parse a line respecting quotes
  const parseLine = (line: string): string[] => {
    if (sep === '\t') {
      return line.split('\t').map(c => c.trim().replace(/^["']|["']$/g, ''));
    }
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === sep && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const rawHeaders = parseLine(firstLine).map(c => c.toLowerCase().trim());
  let hasHeaders = false;

  // Header column index mappings
  let colGrupo = -1;
  let colBpo = -1;
  let colPais = -1;
  let colCliente = -1;
  let colLinea = -1;
  let colGoLive = -1;
  let colParalelo = -1;
  let colCanal = -1;
  let colPrioridad = -1;
  let colModoCaptura = -1;
  let colTipoCuenta = -1;
  let colDecision = -1;
  let colEstado = -1;

  rawHeaders.forEach((h, idx) => {
    // Check more specific compound headers first
    if (h.includes('linea') || h.includes('línea') || h.includes('negocio')) { 
      colLinea = idx; 
      hasHeaders = true; 
    }
    else if (h.includes('prioridad')) { colPrioridad = idx; hasHeaders = true; }
    else if (h === 'grupo' || h.startsWith('grupo')) { colGrupo = idx; hasHeaders = true; }
    else if (h.includes('bpo') || h.includes('compañía') || h.includes('compania') || h.includes('empresa')) { colBpo = idx; hasHeaders = true; }
    else if (h.includes('pais') || h.includes('país')) { colPais = idx; hasHeaders = true; }
    else if (h.includes('cliente') || h.includes('proceso') || h.includes('cuenta')) { colCliente = idx; hasHeaders = true; }
    else if (h.includes('go-live') || h.includes('golive') || h.includes('live')) { colGoLive = idx; hasHeaders = true; }
    else if (h.includes('paralelo')) { colParalelo = idx; hasHeaders = true; }
    else if (h.includes('canal')) { colCanal = idx; hasHeaders = true; }
    else if (h.includes('captura')) { colModoCaptura = idx; hasHeaders = true; }
    else if (h.includes('tipo')) { colTipoCuenta = idx; hasHeaders = true; }
    else if (h.includes('decision') || h.includes('decisión')) { colDecision = idx; hasHeaders = true; }
    else if (h.includes('estado')) { colEstado = idx; hasHeaders = true; }
  });

  const startIndex = hasHeaders ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length < 2 || !cells.some(c => c.length > 0)) continue;

    let grupo = 'Grupo 1';
    let compania = 'Apex';
    let pais = '';
    let cliente = '';
    let lineaNegocio = '';
    let goLiveCompleto = '';
    let paralelo = '';
    let canalAtencion = 'Voz';
    let prioridad = 'Media';
    let modoCaptura = 'TBD';
    let tipoCuenta = prefix === 'traspasar' ? 'En Calibraite V1 - OnGoing' : 'Cuenta Nueva';
    let decision = prefix === 'traspasar' ? 'Migrar Grupo 1' : 'Despliegue - Grupo 1';
    let estado = 'Sin implementar';
    let observaciones = '';

    if (hasHeaders) {
      if (colGrupo !== -1 && cells[colGrupo]) grupo = cells[colGrupo];
      if (colBpo !== -1 && cells[colBpo]) compania = cells[colBpo];
      if (colPais !== -1 && cells[colPais]) pais = cells[colPais];
      if (colCliente !== -1 && cells[colCliente]) cliente = cells[colCliente];
      if (colLinea !== -1 && cells[colLinea]) lineaNegocio = cells[colLinea];
      if (colGoLive !== -1 && cells[colGoLive]) goLiveCompleto = cells[colGoLive];
      if (colParalelo !== -1 && cells[colParalelo]) paralelo = cells[colParalelo];
      if (colCanal !== -1 && cells[colCanal]) canalAtencion = cells[colCanal];
      if (colPrioridad !== -1 && cells[colPrioridad]) prioridad = cells[colPrioridad];
      if (colModoCaptura !== -1 && cells[colModoCaptura]) modoCaptura = cells[colModoCaptura];
      if (colTipoCuenta !== -1 && cells[colTipoCuenta]) tipoCuenta = cells[colTipoCuenta];
      if (colDecision !== -1 && cells[colDecision]) decision = cells[colDecision];
      if (colEstado !== -1 && cells[colEstado]) estado = cells[colEstado];
    } else {
      if (prefix === 'traspasar') {
        // Formato exacto de 8 columnas para traspasos:
        // Col 0: Grupo
        // Col 1: Indique el BPO
        // Col 2: Pais
        // Col 3: Indique el cliente
        // Col 4: Indique la linea de negocio del Cliente
        // Col 5: Go-Live completo
        // Col 6: Paralelo
        // Col 7: Canal de atencion
        grupo = cells[0] || 'Grupo 1';
        compania = cells[1] || 'Apex';
        pais = cells[2] || '';
        cliente = cells[3] || cells[0] || `Cliente ${i + 1}`;
        lineaNegocio = cells[4] || '';
        goLiveCompleto = cells[5] || '';
        paralelo = cells[6] || '';
        canalAtencion = cells[7] || 'Voz';
      } else {
        // Standard A-J layout:
        prioridad = cells[0] || 'Media';
        grupo = cells[1] || 'Grupo 1';
        compania = cells[2] || 'Apex';
        cliente = cells[3] || cells[0] || `Cliente ${i + 1}`;
        lineaNegocio = cells[4] || '';
        canalAtencion = cells[5] || 'Voz';
        modoCaptura = cells[6] || 'TBD';
        tipoCuenta = cells[7] || 'Cuenta Nueva';
        decision = cells[8] || 'Despliegue - Grupo 1';
        estado = cells[9] || 'Sin implementar';
        observaciones = cells[10] || '';
      }
    }

    // Sanitize prioridad
    if (!['Alta', 'Media', 'Baja'].includes(prioridad)) {
      if (prioridad.toLowerCase().includes('alta')) prioridad = 'Alta';
      else if (prioridad.toLowerCase().includes('baja')) prioridad = 'Baja';
      else if (prioridad.toLowerCase().includes('media')) prioridad = 'Media';
      else prioridad = 'Media';
    }

    if (cliente && cliente.trim().length > 0) {
      results.push({
        id: `${prefix}_paste_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        prioridad,
        grupo: grupo || 'Grupo 1',
        compania: compania || 'Apex',
        pais: pais || '',
        cliente: cliente.trim(),
        lineaNegocio: lineaNegocio || '',
        goLiveCompleto: goLiveCompleto || '',
        paralelo: paralelo || '',
        canalAtencion: canalAtencion || 'Voz',
        modoCaptura,
        tipoCuenta,
        decision,
        estado,
        observaciones
      });
    }
  }

  return results;
}

export const ColumnsAToJSheet: React.FC<ColumnsAToJSheetProps> = ({
  type,
  records,
  matrixClients,
  onSaveRecords,
  onUpdateSingleRecord,
  onAddRecord,
  onDeleteRecord,
  onMoveToMatrix
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>('todos');
  const [selectedCompania, setSelectedCompania] = useState<string>('todas');
  const [selectedPais, setSelectedPais] = useState<string>('todos');
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClientAToJRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedForImport, setSelectedForImport] = useState<string[]>([]);

  // Paste from Excel modal states
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteRawText, setPasteRawText] = useState('');
  const [parsedPasteRecords, setParsedPasteRecords] = useState<ClientAToJRecord[]>([]);

  const title = type === 'traspasar' ? 'Clientes a traspasar' : 'Clientes nuevos';
  const subtitle = type === 'traspasar'
    ? 'Registro de clientes a traspasar con sus 8 columnas: Grupo, Indique el BPO, Pais, Indique el cliente, Indique la linea de negocio del Cliente, Go-Live completo, Paralelo y Canal de atencion.'
    : 'Registro de clientes y procesos nuevos para despliegue de calidad. Columnas A a J.';
  const badgeLabel = type === 'traspasar' ? 'Traspasos' : 'Cuentas Nuevas';

  // Available companies for filter
  const companias = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.compania) set.add(r.compania);
    });
    return Array.from(set);
  }, [records]);

  // Available countries for filter (traspasos)
  const paises = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.pais && r.pais.trim()) set.add(r.pais.trim());
    });
    return Array.from(set);
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = 
        !searchTerm ||
        r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.compania.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.grupo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.pais && r.pais.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.canalAtencion && r.canalAtencion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.lineaNegocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.estado && r.estado.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPrioridad = 
        type === 'traspasar' || selectedPrioridad === 'todos' || r.prioridad === selectedPrioridad;

      const matchCompania = 
        selectedCompania === 'todas' || r.compania === selectedCompania;

      const matchPais = 
        type !== 'traspasar' || selectedPais === 'todos' || r.pais === selectedPais;

      return matchSearch && matchPrioridad && matchCompania && matchPais;
    });
  }, [records, searchTerm, selectedPrioridad, selectedCompania, selectedPais, type]);

  // Open add new record modal
  const handleOpenAddModal = () => {
    if (type === 'traspasar') {
      setEditingRecord({
        id: `manual_traspaso_${Date.now()}`,
        prioridad: 'Media',
        grupo: 'Grupo 1',
        compania: 'Apex',
        pais: 'Argentina',
        cliente: '',
        lineaNegocio: '',
        goLiveCompleto: '',
        paralelo: '',
        canalAtencion: 'Voz',
        modoCaptura: 'TBD',
        tipoCuenta: 'En Calibraite V1 - OnGoing',
        decision: 'Migrar Grupo 1',
        estado: 'Sin migrar',
        observaciones: ''
      });
    } else {
      setEditingRecord({
        id: `manual_${Date.now()}`,
        prioridad: 'Media',
        grupo: 'Grupo 1',
        compania: 'Apex',
        pais: '',
        cliente: '',
        lineaNegocio: '',
        canalAtencion: 'Voz',
        modoCaptura: 'TBD',
        tipoCuenta: 'Cuenta Nueva',
        decision: 'Despliegue - Grupo 1',
        estado: 'Sin implementar',
        observaciones: ''
      });
    }
    setIsEditModalOpen(true);
  };

  // Open edit record modal
  const handleOpenEditModal = (rec: ClientAToJRecord) => {
    setEditingRecord({ ...rec });
    setIsEditModalOpen(true);
  };

  // Save modal record
  const handleSaveModalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editingRecord.cliente.trim()) return;

    const exists = records.some(r => r.id === editingRecord.id);
    if (exists) {
      onUpdateSingleRecord(editingRecord);
    } else {
      onAddRecord(editingRecord);
    }
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  // Open import modal
  const handleOpenImportModal = () => {
    // Preselect based on type
    const initialSelected: string[] = [];
    matrixClients.forEach(mc => {
      if (type === 'traspasar') {
        if (mc.tipoCuenta.toLowerCase().includes('calibraite') || mc.decision.toLowerCase().includes('migrar')) {
          initialSelected.push(mc.id);
        }
      } else {
        if (mc.tipoCuenta === 'Cuenta Nueva' && !mc.decision.toLowerCase().includes('migrar')) {
          initialSelected.push(mc.id);
        }
      }
    });
    setSelectedForImport(initialSelected.length > 0 ? initialSelected : matrixClients.map(c => c.id));
    setIsImportModalOpen(true);
  };

  // Execute import from matrix
  const handleExecuteImport = () => {
    const selectedClients = matrixClients.filter(c => selectedForImport.includes(c.id));
    
    // Map client records to ClientAToJRecord
    const newItems: ClientAToJRecord[] = selectedClients.map(c => ({
      id: `${type}_${c.id}`,
      prioridad: c.prioridad,
      grupo: c.grupo,
      compania: c.compania,
      pais: c.pais || (c.compania === 'Apex' ? 'Argentina' : c.compania === 'BeCall' ? 'España' : c.compania === 'Solvo' ? 'Colombia' : ''),
      cliente: c.cliente,
      lineaNegocio: c.lineaNegocio,
      goLiveCompleto: c.goLiveCompleto || c.goLiveInicio || '',
      paralelo: c.paralelo || '',
      canalAtencion: c.canalAtencion,
      modoCaptura: c.modoCaptura,
      tipoCuenta: c.tipoCuenta,
      decision: c.decision,
      estado: c.estado,
      observaciones: c.observaciones
    }));

    // Merge or replace: if list is empty, replace; else append non-duplicates by client name
    const existingNames = new Set(records.map(r => r.cliente.toLowerCase()));
    const toAppend = newItems.filter(item => !existingNames.has(item.cliente.toLowerCase()));
    
    onSaveRecords([...records, ...toAppend]);
    setIsImportModalOpen(false);
  };

  // Paste from Excel handlers
  const handleOpenPasteModal = () => {
    setPasteRawText('');
    setParsedPasteRecords([]);
    setIsPasteModalOpen(true);
  };

  const handlePasteChange = (text: string) => {
    setPasteRawText(text);
    if (text.trim()) {
      const parsed = parseSpreadsheetPaste(text, type);
      setParsedPasteRecords(parsed);
    } else {
      setParsedPasteRecords([]);
    }
  };

  const handleApplyPaste = (mode: 'replace' | 'append') => {
    if (parsedPasteRecords.length === 0) return;
    if (mode === 'replace') {
      onSaveRecords(parsedPasteRecords);
    } else {
      onSaveRecords([...records, ...parsedPasteRecords]);
    }
    setIsPasteModalOpen(false);
    setPasteRawText('');
    setParsedPasteRecords([]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let headers: string[];
    let rows: string[][];

    if (type === 'traspasar') {
      headers = [
        'Grupo',
        'Indique el BPO',
        'Pais',
        'Indique el cliente',
        'Indique la linea de negocio del Cliente',
        'Go-Live completo',
        'Paralelo',
        'Canal de atencion'
      ];
      rows = filteredRecords.map(r => [
        `"${(r.grupo || '').replace(/"/g, '""')}"`,
        `"${(r.compania || '').replace(/"/g, '""')}"`,
        `"${(r.pais || '').replace(/"/g, '""')}"`,
        `"${(r.cliente || '').replace(/"/g, '""')}"`,
        `"${(r.lineaNegocio || '').replace(/"/g, '""')}"`,
        `"${(r.goLiveCompleto || '').replace(/"/g, '""')}"`,
        `"${(r.paralelo || '').replace(/"/g, '""')}"`,
        `"${(r.canalAtencion || '').replace(/"/g, '""')}"`
      ]);
    } else {
      headers = [
        'Prioridad (A)',
        'Grupo (B)',
        'Compañía (C)',
        'Cliente / Proceso (D)',
        'Línea de Negocio (E)',
        'Canal de Atención (F)',
        'Modo Captura (G)',
        'Tipo de Cuenta (H)',
        'Decisión (I)',
        'Estado (J)',
        'Observaciones'
      ];
      rows = filteredRecords.map(r => [
        `"${r.prioridad}"`,
        `"${r.grupo}"`,
        `"${r.compania}"`,
        `"${r.cliente.replace(/"/g, '""')}"`,
        `"${(r.lineaNegocio || '').replace(/"/g, '""')}"`,
        `"${r.canalAtencion || ''}"`,
        `"${r.modoCaptura || ''}"`,
        `"${r.tipoCuenta || ''}"`,
        `"${r.decision || ''}"`,
        `"${r.estado || ''}"`,
        `"${(r.observaciones || '').replace(/"/g, '""')}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type === 'traspasar' ? 'clientes_a_traspasar' : 'clientes_nuevos'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {badgeLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              {type === 'traspasar' ? '8 Columnas de Traspaso' : 'Columnas A hasta J'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {subtitle} Puedes completar los datos manualmente, pegar desde Excel o copiar registros de la matriz.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenPasteModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs"
            title="Copiar celdas en Excel / Google Sheets y pegarlas aquí directamente"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>📋 Pegar desde Excel</span>
          </button>

          <button
            onClick={handleOpenImportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition shadow-2xs"
            title="Seleccionar y copiar clientes que ya existen en la Matriz Despliegue hacia esta pestaña"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Traer desde Matriz</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
            title="Añadir un nuevo cliente manualmente"
          >
            <Plus className="w-4 h-4" />
            <span>+ Añadir Cliente</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-2xs"
            title="Exportar a archivo Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={type === 'traspasar' ? "Buscar por cliente, BPO, país, línea..." : "Buscar por cliente, compañía, línea..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto text-xs">
          {/* Prioridad filter (for Nuevos) or País filter (for Traspasos) */}
          {type === 'traspasar' ? (
            paises.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">País:</span>
                <select
                  value={selectedPais}
                  onChange={(e) => setSelectedPais(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="todos">Todos ({paises.length})</option>
                  {paises.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Prioridad:</span>
              <select
                value={selectedPrioridad}
                onChange={(e) => setSelectedPrioridad(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="todos">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          )}

          {/* Compañía / BPO filter */}
          {companias.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">{type === 'traspasar' ? 'BPO:' : 'Compañía:'}</span>
              <select
                value={selectedCompania}
                onChange={(e) => setSelectedCompania(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="todas">Todas ({companias.length})</option>
                {companias.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
          )}

          <span className="text-slate-400 text-xs font-medium ml-2">
            Mostrando <strong>{filteredRecords.length}</strong> de {records.length}
          </span>
        </div>
      </div>

      {/* The Excel-style Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1300px] w-full divide-y divide-slate-200 text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-slate-200 font-semibold tracking-wider">
              {type === 'traspasar' ? (
                /* Specific 8 columns for Clientes a traspasar */
                <tr>
                  <th className="px-3 py-3 w-12 text-center text-slate-400">#</th>
                  <th className="px-3 py-3 w-32">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">1</span>
                      <span>Grupo</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-36">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">2</span>
                      <span>Indique el BPO</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-28 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">3</span>
                      <span>Pais</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-60">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">4</span>
                      <span>Indique el cliente</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-56">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">5</span>
                      <span>Indique la linea de negocio del Cliente</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-36 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">6</span>
                      <span>Go-Live completo</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-32 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">7</span>
                      <span>Paralelo</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-36 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">8</span>
                      <span>Canal de atencion</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-24 text-center">Acciones</th>
                </tr>
              ) : (
                /* Standard Columns A to J for Clientes nuevos */
                <tr>
                  <th className="px-3 py-3 w-12 text-center text-slate-400">#</th>
                  <th className="px-3 py-3 w-28" title="Columna A: Prioridad">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">A</span>
                      <span>Prioridad</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-28" title="Columna B: Grupo">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">B</span>
                      <span>Grupo</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-32" title="Columna C: Compañía">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">C</span>
                      <span>Compañía</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-56" title="Columna D: Cliente / Proceso">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">D</span>
                      <span>Cliente / Proceso</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-52" title="Columna E: Línea de Negocio">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">E</span>
                      <span>Línea de Negocio</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-28 text-center" title="Columna F: Canal de Atención">
                    <div className="flex items-center justify-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">F</span>
                      <span>Canal</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-32 text-center" title="Columna G: Modo Captura">
                    <div className="flex items-center justify-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">G</span>
                      <span>Modo Captura</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-48" title="Columna H: Tipo de Cuenta">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">H</span>
                      <span>Tipo de Cuenta</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-40" title="Columna I: Decisión">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">I</span>
                      <span>Decisión</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-36" title="Columna J: Estado">
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">J</span>
                      <span>Estado</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 w-24 text-center">Acciones</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={type === 'traspasar' ? 10 : 12} className="text-center py-12 text-slate-500">
                    <p className="font-semibold text-sm">No hay registros en esta pestaña.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Copia las columnas desde tu Excel o usa los botones para añadir clientes.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={handleOpenPasteModal}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>📋 Pegar desde Excel</span>
                      </button>
                      <button
                        onClick={handleOpenAddModal}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition"
                      >
                        + Añadir Cliente Manual
                      </button>
                      <button
                        onClick={handleOpenImportModal}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold text-xs border border-indigo-200 transition"
                      >
                        Traer desde Matriz
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr 
                    key={record.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Index */}
                    <td className="px-3 py-3 text-center text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>

                    {type === 'traspasar' ? (
                      /* 8 Columnas exactas de Traspasos */
                      <>
                        {/* Col 1: Grupo */}
                        <td className="px-3 py-2">
                          <span className="font-semibold text-slate-800">{record.grupo || '-'}</span>
                        </td>

                        {/* Col 2: Indique el BPO */}
                        <td className="px-3 py-2">
                          <span className="font-medium text-slate-700">{record.compania || '-'}</span>
                        </td>

                        {/* Col 3: Pais */}
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {record.pais || '-'}
                          </span>
                        </td>

                        {/* Col 4: Indique el cliente */}
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleOpenEditModal(record)}
                            className="font-bold text-left text-slate-900 hover:text-indigo-600 transition"
                            title="Haz clic para editar esta fila"
                          >
                            {record.cliente}
                          </button>
                        </td>

                        {/* Col 5: Indique la linea de negocio del Cliente */}
                        <td className="px-3 py-2 text-slate-600">
                          {record.lineaNegocio || '-'}
                        </td>

                        {/* Col 6: Go-Live completo */}
                        <td className="px-3 py-2 text-center text-slate-700 font-medium">
                          {record.goLiveCompleto || '-'}
                        </td>

                        {/* Col 7: Paralelo */}
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            record.paralelo?.toLowerCase().includes('si') || record.paralelo?.toLowerCase().includes('sí')
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : record.paralelo?.toLowerCase().includes('no')
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'text-slate-600'
                          }`}>
                            {record.paralelo || '-'}
                          </span>
                        </td>

                        {/* Col 8: Canal de atencion */}
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-150">
                            {record.canalAtencion || '-'}
                          </span>
                        </td>
                      </>
                    ) : (
                      /* Standard A to J columns for Clientes Nuevos */
                      <>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              record.prioridad === 'Alta' ? 'bg-rose-500' :
                              record.prioridad === 'Media' ? 'bg-amber-400' :
                              'bg-emerald-400'
                            }`} />
                            <span className={`font-semibold ${
                              record.prioridad === 'Alta' ? 'text-rose-700' :
                              record.prioridad === 'Media' ? 'text-amber-700' :
                              'text-emerald-700'
                            }`}>{record.prioridad}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-medium text-slate-700">{record.grupo}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-medium text-slate-700">{record.compania}</span>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleOpenEditModal(record)}
                            className="font-bold text-left text-slate-900 hover:text-indigo-600 transition"
                            title="Haz clic para editar esta fila"
                          >
                            {record.cliente}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {record.lineaNegocio || '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {record.canalAtencion || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-slate-600">{record.modoCaptura || '-'}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-slate-600">{record.tipoCuenta || '-'}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-slate-600 font-medium">{record.decision || '-'}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            record.estado === 'Completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            record.estado === 'En curso' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            record.estado === 'Pausado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {record.estado || 'Sin implementar'}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onMoveToMatrix(record.id)}
                          className="p-1 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition"
                          title="Enviar a Matriz"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(record)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                          title="Editar fila"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {records.some(r => r.id === editingRecord.id) ? 'Editar Cliente' : 'Añadir Cliente'}
                </h3>
                <p className="text-xs text-slate-500">
                  {type === 'traspasar' 
                    ? 'Completa los 8 campos solicitados para clientes a traspasar.'
                    : 'Completa los campos correspondientes a las columnas A hasta J.'}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalRecord} className="p-5 space-y-4 text-xs">
              {type === 'traspasar' ? (
                /* Formulario de 8 campos para Traspasos */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Grupo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. Grupo
                    </label>
                    <input
                      type="text"
                      value={editingRecord.grupo}
                      onChange={(e) => setEditingRecord({ ...editingRecord, grupo: e.target.value })}
                      placeholder="Ej. Grupo 1, Grupo 1 A, Grupo 2"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* 2. Indique el BPO */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. Indique el BPO
                    </label>
                    <input
                      type="text"
                      value={editingRecord.compania}
                      onChange={(e) => setEditingRecord({ ...editingRecord, compania: e.target.value })}
                      placeholder="Ej. Apex, BeCall, Solvo, TBPO, Onesource"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* 3. Pais */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      3. Pais
                    </label>
                    <input
                      type="text"
                      value={editingRecord.pais || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, pais: e.target.value })}
                      placeholder="Ej. Argentina, España, Colombia, Chile, México"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* 4. Indique el cliente */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      4. Indique el cliente
                    </label>
                    <input
                      type="text"
                      value={editingRecord.cliente}
                      onChange={(e) => setEditingRecord({ ...editingRecord, cliente: e.target.value })}
                      placeholder="Nombre del cliente o proceso"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* 5. Indique la linea de negocio del Cliente */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      5. Indique la linea de negocio del Cliente
                    </label>
                    <input
                      type="text"
                      value={editingRecord.lineaNegocio}
                      onChange={(e) => setEditingRecord({ ...editingRecord, lineaNegocio: e.target.value })}
                      placeholder="Ej. Ventas, Atención al Cliente, Retención, Soporte Técnico"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* 6. Go-Live completo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      6. Go-Live completo
                    </label>
                    <input
                      type="text"
                      value={editingRecord.goLiveCompleto || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, goLiveCompleto: e.target.value })}
                      placeholder="Ej. 15/03/2025 o Fecha Go-Live"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* 7. Paralelo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      7. Paralelo
                    </label>
                    <input
                      type="text"
                      value={editingRecord.paralelo || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, paralelo: e.target.value })}
                      placeholder="Ej. Si, No, 2 semanas"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* 8. Canal de atencion */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      8. Canal de atencion
                    </label>
                    <input
                      type="text"
                      value={editingRecord.canalAtencion}
                      onChange={(e) => setEditingRecord({ ...editingRecord, canalAtencion: e.target.value })}
                      placeholder="Ej. Voz, Chat, WhatsApp, Omnicanal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Observaciones */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Observaciones adicionales
                    </label>
                    <textarea
                      rows={2}
                      value={editingRecord.observaciones || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, observaciones: e.target.value })}
                      placeholder="Notas o comentarios sobre el traspaso..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                /* Formulario de 10 columnas A a J para Clientes Nuevos */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Col A: Prioridad */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna A: Prioridad
                    </label>
                    <select
                      value={editingRecord.prioridad}
                      onChange={(e) => setEditingRecord({ ...editingRecord, prioridad: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>

                  {/* Col B: Grupo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna B: Grupo
                    </label>
                    <input
                      type="text"
                      value={editingRecord.grupo}
                      onChange={(e) => setEditingRecord({ ...editingRecord, grupo: e.target.value })}
                      placeholder="Ej. Grupo 1, Grupo 1 A, Prueba"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Col C: Compañía */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna C: Compañía
                    </label>
                    <input
                      type="text"
                      value={editingRecord.compania}
                      onChange={(e) => setEditingRecord({ ...editingRecord, compania: e.target.value })}
                      placeholder="Ej. BeCall, Apex, Solvo, TBPO, Onesource"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Col D: Cliente / Proceso */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna D: Cliente / Proceso
                    </label>
                    <input
                      type="text"
                      value={editingRecord.cliente}
                      onChange={(e) => setEditingRecord({ ...editingRecord, cliente: e.target.value })}
                      placeholder="Nombre del proceso o cliente"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Col E: Línea de Negocio */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna E: Línea de Negocio / Contacto
                    </label>
                    <input
                      type="text"
                      value={editingRecord.lineaNegocio}
                      onChange={(e) => setEditingRecord({ ...editingRecord, lineaNegocio: e.target.value })}
                      placeholder="Ej. Sales, CX, Atención Clientes"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Col F: Canal de Atención */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna F: Canal de Atención
                    </label>
                    <input
                      type="text"
                      value={editingRecord.canalAtencion}
                      onChange={(e) => setEditingRecord({ ...editingRecord, canalAtencion: e.target.value })}
                      placeholder="Ej. Voz, Chat, Omnicanal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Col G: Modo Captura */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna G: Modo Captura
                    </label>
                    <select
                      value={editingRecord.modoCaptura}
                      onChange={(e) => setEditingRecord({ ...editingRecord, modoCaptura: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="TBD">TBD</option>
                      <option value="Si">Si</option>
                      <option value="No">No</option>
                      <option value="Manual enviado">Manual enviado</option>
                    </select>
                  </div>

                  {/* Col H: Tipo de Cuenta */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna H: Tipo de Cuenta
                    </label>
                    <input
                      type="text"
                      value={editingRecord.tipoCuenta}
                      onChange={(e) => setEditingRecord({ ...editingRecord, tipoCuenta: e.target.value })}
                      placeholder="Ej. Cuenta Nueva, En Calibraite V1 - OnGoing"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Col I: Decisión */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna I: Decisión
                    </label>
                    <input
                      type="text"
                      value={editingRecord.decision}
                      onChange={(e) => setEditingRecord({ ...editingRecord, decision: e.target.value })}
                      placeholder="Ej. Despliegue - Grupo 1, Migrar Grupo 1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Col J: Estado */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Columna J: Estado
                    </label>
                    <input
                      type="text"
                      value={editingRecord.estado}
                      onChange={(e) => setEditingRecord({ ...editingRecord, estado: e.target.value })}
                      placeholder="Ej. Sin implementar, Pruebas CSuite, Sin migrar, En curso"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Observaciones */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Observaciones adicionales
                    </label>
                    <textarea
                      rows={2}
                      value={editingRecord.observaciones || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, observaciones: e.target.value })}
                      placeholder="Notas o comentarios relevantes..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-xs"
                >
                  Guardar Fila
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import from Matrix Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Copiar registros desde la Matriz Actual
                </h3>
                <p className="text-xs text-slate-500">
                  Selecciona qué clientes de la matriz actual deseas importar a esta pestaña (Columnas A a J).
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <button
                  onClick={() => setSelectedForImport(matrixClients.map(c => c.id))}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Seleccionar todos ({matrixClients.length})
                </button>
                <button
                  onClick={() => setSelectedForImport([])}
                  className="text-slate-500 font-medium hover:underline"
                >
                  Deseleccionar todos
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {matrixClients.map(client => {
                  const isChecked = selectedForImport.includes(client.id);
                  return (
                    <label 
                      key={client.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
                        isChecked 
                          ? 'bg-indigo-50/70 border-indigo-300' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedForImport([...selectedForImport, client.id]);
                            } else {
                              setSelectedForImport(selectedForImport.filter(id => id !== client.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{client.cliente}</p>
                          <p className="text-[11px] text-slate-500">
                            {client.compania} • {client.grupo} • {client.tipoCuenta}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {client.prioridad}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  <strong>{selectedForImport.length}</strong> clientes seleccionados
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    disabled={selectedForImport.length === 0}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition shadow-xs"
                  >
                    Importar a esta Pestaña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paste from Excel / CSV Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ClipboardPaste className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pegar datos desde Excel / Google Sheets
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pega directamente las columnas A hasta la J copiadas desde tu hoja
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Instructions */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  ¿Cómo copiar desde tu hoja de cálculo?
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[11px] leading-relaxed">
                  <li>En tu Excel o Google Sheets, ve a la pestaña <strong>{type === 'traspasar' ? 'Cliente calibraite anterior' : title}</strong>.</li>
                  <li>
                    {type === 'traspasar' 
                      ? 'Tus 8 columnas (Grupo, BPO, País, Cliente, Línea de negocio, Go-Live, Paralelo, Canal) se ordenan de forma 100% automática.' 
                      : 'Selecciona las filas que deseas o presiona Ctrl + A.'}
                  </li>
                  <li>Copia con <strong>Ctrl + C</strong>, luego haz clic en el cuadro inferior y presiona <strong>Ctrl + V</strong>.</li>
                </ol>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contenido copiado (pega aquí con Ctrl + V):
                </label>
                <textarea
                  rows={5}
                  value={pasteRawText}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  placeholder="Pega aquí el contenido copiado desde tu Excel o Sheets (las columnas separadas por tabulaciones o comas se detectarán automáticamente)..."
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-emerald-500 transition shadow-inner"
                />
              </div>

              {/* Detected records preview */}
              {pasteRawText.trim() && (
                <div>
                  {parsedPasteRecords.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ¡Se detectaron <strong>{parsedPasteRecords.length}</strong> clientes listos para importar!
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100/70 border border-emerald-300">
                          {type === 'traspasar' ? '8 Columnas reconocidas' : 'Columnas A a J reconocidas'}
                        </span>
                      </div>

                      {/* Mini preview table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead className="bg-slate-100 text-slate-600 sticky top-0 font-semibold">
                            {type === 'traspasar' ? (
                              <tr>
                                <th className="px-2.5 py-1.5">#</th>
                                <th className="px-2.5 py-1.5">Grupo</th>
                                <th className="px-2.5 py-1.5">BPO</th>
                                <th className="px-2.5 py-1.5">País</th>
                                <th className="px-2.5 py-1.5">Cliente</th>
                                <th className="px-2.5 py-1.5">Línea de Negocio</th>
                                <th className="px-2.5 py-1.5">Go-Live</th>
                                <th className="px-2.5 py-1.5">Paralelo</th>
                                <th className="px-2.5 py-1.5">Canal</th>
                              </tr>
                            ) : (
                              <tr>
                                <th className="px-2.5 py-1.5">#</th>
                                <th className="px-2.5 py-1.5">Prioridad</th>
                                <th className="px-2.5 py-1.5">Compañía</th>
                                <th className="px-2.5 py-1.5">Cliente / Proceso</th>
                                <th className="px-2.5 py-1.5">Tipo Cuenta</th>
                                <th className="px-2.5 py-1.5">Estado</th>
                              </tr>
                            )}
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {parsedPasteRecords.slice(0, 8).map((r, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-2.5 py-1.5 text-slate-400 font-mono">{idx + 1}</td>
                                {type === 'traspasar' ? (
                                  <>
                                    <td className="px-2.5 py-1.5 font-bold text-slate-700">{r.grupo}</td>
                                    <td className="px-2.5 py-1.5 font-semibold text-slate-800">{r.compania}</td>
                                    <td className="px-2.5 py-1.5 text-slate-600">{r.pais || '—'}</td>
                                    <td className="px-2.5 py-1.5 font-medium text-slate-900 truncate max-w-[150px]">{r.cliente}</td>
                                    <td className="px-2.5 py-1.5 text-slate-500 truncate max-w-[120px]">{r.lineaNegocio || '—'}</td>
                                    <td className="px-2.5 py-1.5 text-slate-600">{r.goLiveCompleto || '—'}</td>
                                    <td className="px-2.5 py-1.5 text-slate-600">{r.paralelo || '—'}</td>
                                    <td className="px-2.5 py-1.5 text-slate-600">{r.canalAtencion || 'Voz'}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-2.5 py-1.5 font-bold text-slate-700">{r.prioridad}</td>
                                    <td className="px-2.5 py-1.5 font-semibold text-slate-800">{r.compania}</td>
                                    <td className="px-2.5 py-1.5 font-medium text-slate-900 truncate max-w-[150px]">{r.cliente}</td>
                                    <td className="px-2.5 py-1.5 text-slate-500 truncate max-w-[120px]">{r.tipoCuenta}</td>
                                    <td className="px-2.5 py-1.5 text-slate-600">{r.estado}</td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedPasteRecords.length > 8 && (
                        <p className="text-[11px] text-slate-400 text-center italic">
                          ... y {parsedPasteRecords.length - 8} filas más
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        No se detectaron filas válidas con los nombres de clientes. Asegúrate de copiar filas que contengan datos en las columnas.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                {parsedPasteRecords.length > 0 
                  ? `${parsedPasteRecords.length} filas listas` 
                  : 'Esperando datos copiados...'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsPasteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
                >
                  Cancelar
                </button>

                {parsedPasteRecords.length > 0 && records.length > 0 && (
                  <button
                    onClick={() => handleApplyPaste('append')}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition shadow-2xs"
                  >
                    Agregar a existentes (+{parsedPasteRecords.length})
                  </button>
                )}

                <button
                  onClick={() => handleApplyPaste('replace')}
                  disabled={parsedPasteRecords.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold transition shadow-xs"
                >
                  {records.length === 0 
                    ? `Importar ${parsedPasteRecords.length} Registros` 
                    : `Reemplazar todo con ${parsedPasteRecords.length} Registros`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
