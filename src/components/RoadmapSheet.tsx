import React, { useState, useMemo, useRef } from 'react';
import { RoadmapRecord } from '../types';
import { 
  Plus, Trash2, Search, ClipboardPaste, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, X, AlertCircle, Edit2, Check, Download,
  Filter, Layers, Clock, ArrowRight, Eye, CalendarCheck
} from 'lucide-react';
import { parseDateSafe } from '../utils/alertUtils';

interface RoadmapSheetProps {
  records: RoadmapRecord[];
  referenceDate: Date;
  onSaveRecords: (records: RoadmapRecord[]) => void;
  onUpdateSingleRecord: (record: RoadmapRecord) => void;
  onAddRecord: (record: RoadmapRecord) => void;
  onDeleteRecord: (id: string) => void;
}

// Parse DD/MM/YYYY, DD/M/YYYY, YYYY-MM-DD safely
function parseDateRobust(dStr: string | undefined | null): Date | null {
  if (!dStr) return null;
  const d = dStr.trim();
  if (!d) return null;

  // DD/MM/YYYY or DD-MM-YYYY
  const partsSlash = d.split('/');
  if (partsSlash.length === 3) {
    const day = parseInt(partsSlash[0], 10);
    const month = parseInt(partsSlash[1], 10) - 1;
    let year = parseInt(partsSlash[2].split(' ')[0], 10);
    if (year < 100) year += 2000;
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  const partsDash = d.split('-');
  if (partsDash.length === 3) {
    if (partsDash[0].length === 4) {
      // YYYY-MM-DD
      const year = parseInt(partsDash[0], 10);
      const month = parseInt(partsDash[1], 10) - 1;
      const day = parseInt(partsDash[2].split(' ')[0], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    } else {
      // DD-MM-YYYY
      const day = parseInt(partsDash[0], 10);
      const month = parseInt(partsDash[1], 10) - 1;
      let year = parseInt(partsDash[2].split(' ')[0], 10);
      if (year < 100) year += 2000;
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  }

  const fallback = new Date(d);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function formatDateDDMMYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function formatDateStandard(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const DAY_NAMES_ES = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SÁ'];

export const RoadmapSheet: React.FC<RoadmapSheetProps> = ({
  records,
  referenceDate,
  onSaveRecords,
  onUpdateSingleRecord,
  onAddRecord,
  onDeleteRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RoadmapRecord | null>(null);

  // Timeline window offset in workdays (for navigation)
  const [startWorkdayOffset, setStartWorkdayOffset] = useState(0);

  // Timeline base anchor date: 7 de Septiembre 2026 (first Monday of the spreadsheet)
  const baseTimelineDate = useMemo(() => {
    // Find earliest start date from records, or default to Sept 7, 2026
    let earliest = new Date(2026, 8, 7); // 7 Sept 2026 (Lunes)
    records.forEach(r => {
      const d = parseDateRobust(r.fechaInicio || r.fechaCompromiso);
      if (d && d < earliest) earliest = d;
    });
    // Adjust to Monday of that week
    const day = earliest.getDay();
    const diff = earliest.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(earliest);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [records]);

  // Generate 25 working days (Monday to Friday, 5 full weeks) from base date + offset
  const timelineDays = useMemo(() => {
    const days: { date: Date; dateStr: string; dayName: string; isToday: boolean; key: string }[] = [];
    const current = new Date(baseTimelineDate);
    current.setDate(current.getDate() + startWorkdayOffset * 7); // offset by weeks

    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);

    let count = 0;
    while (count < 25) {
      const dayOfWeek = current.getDay();
      // Only Monday (1) through Friday (5) - strictly weekdays matching user screenshot!
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateCopy = new Date(current);
        dateCopy.setHours(0, 0, 0, 0);
        days.push({
          date: dateCopy,
          dateStr: formatDateDDMMYY(dateCopy),
          dayName: DAY_NAMES_ES[dayOfWeek],
          isToday: dateCopy.getTime() === ref.getTime(),
          key: dateCopy.toISOString().split('T')[0]
        });
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [baseTimelineDate, startWorkdayOffset, referenceDate]);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.categoria?.trim()) set.add(r.categoria.trim());
    });
    return Array.from(set);
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.features.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.categoria && r.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'todos' || 
        (r.categoria || 'Sin Categoría') === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [records, searchTerm, selectedCategory]);

  // Alerts calculation
  const roadmapAlerts = useMemo(() => {
    const alerts = {
      vencidas: [] as { record: RoadmapRecord; days: number }[],
      estaSemana: [] as { record: RoadmapRecord; days: number }[],
      proximas: [] as { record: RoadmapRecord; days: number }[]
    };
    
    records.forEach(r => {
      const parsedCompromiso = parseDateRobust(r.fechaCompromiso);
      if (!parsedCompromiso || isNaN(parsedCompromiso.getTime())) return;
      
      const ref = new Date(referenceDate);
      ref.setHours(0, 0, 0, 0);
      const target = new Date(parsedCompromiso);
      target.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - ref.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0 && !r.fechaEntrega) {
        alerts.vencidas.push({ record: r, days: Math.abs(diffDays) });
      } else if (diffDays >= 0 && diffDays <= 7 && !r.fechaEntrega) {
        alerts.estaSemana.push({ record: r, days: diffDays });
      } else if (diffDays > 7 && diffDays <= 30 && !r.fechaEntrega) {
        alerts.proximas.push({ record: r, days: diffDays });
      }
    });

    alerts.vencidas.sort((a, b) => b.days - a.days);
    alerts.estaSemana.sort((a, b) => a.days - b.days);
    alerts.proximas.sort((a, b) => a.days - b.days);

    return alerts;
  }, [records, referenceDate]);

  // Check if a record is active on a specific day in the timeline
  const isRecordActiveOnDay = (record: RoadmapRecord, dayDate: Date) => {
    const targetTime = dayDate.getTime();

    const compromisoDate = parseDateRobust(record.fechaCompromiso);
    const inicioDate = parseDateRobust(record.fechaInicio);

    if (!compromisoDate && !inicioDate) return false;

    // Start date defaults to inicioDate, or same day as compromisoDate
    const start = inicioDate ? new Date(inicioDate) : new Date(compromisoDate!);
    start.setHours(0, 0, 0, 0);

    // End date defaults to compromisoDate (or fechaEntrega if provided)
    const end = compromisoDate ? new Date(compromisoDate) : new Date(inicioDate!);
    end.setHours(23, 59, 59, 999);

    return targetTime >= start.getTime() && targetTime <= end.getTime();
  };

  // Open Edit Modal
  const handleOpenEdit = (record: RoadmapRecord) => {
    setEditingRecord({ ...record });
    setIsEditModalOpen(true);
  };

  // Open New Feature Modal
  const handleOpenNew = () => {
    const newRec: RoadmapRecord = {
      id: `road_${Date.now()}`,
      prioridad: String(records.length + 1),
      categoria: categories[0] || 'Módulo CalibrAIte',
      features: '',
      descripcion: '',
      responsable: 'Silia',
      fechaInicio: '07/09/2026',
      fechaCompromiso: '11/9/2026',
      fechaEntrega: '',
      notas: ''
    };
    setEditingRecord(newRec);
    setIsEditModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editingRecord.features.trim()) return;

    const exists = records.some(r => r.id === editingRecord.id);
    if (exists) {
      onUpdateSingleRecord(editingRecord);
    } else {
      onAddRecord(editingRecord);
    }
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  // Paste from Excel
  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return;

    const lines = pasteContent.split('\n').filter(line => line.trim() !== '');
    const newRecords: RoadmapRecord[] = [];

    let startIndex = 0;
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes('prioridad') || firstLine.includes('feature') || firstLine.includes('responsable')) {
      startIndex = 1;
    }

    let currentCategory = 'Módulo CalibrAIte';

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split('\t').map(c => c.trim());
      if (cols.length === 1 && cols[0] && !cols[0].match(/^\d+$/)) {
        // Line might be a category header like "Módulo CalibrAIte"
        currentCategory = cols[0];
        continue;
      }
      if (cols.length < 2) continue;

      // Col 0: Prioridad
      // Col 1: Features
      // Col 2: Descripcion
      // Col 3: Responsable
      // Col 4: Fecha compromiso
      // Col 5: Fecha entrega
      // Col 6: Notas
      newRecords.push({
        id: `road_${Date.now()}_${i}`,
        prioridad: cols[0] || String(records.length + newRecords.length + 1),
        categoria: currentCategory,
        features: cols[1] || '',
        descripcion: cols[2] || '',
        responsable: cols[3] || '',
        fechaInicio: '',
        fechaCompromiso: cols[4] || '',
        fechaEntrega: cols[5] || '',
        notas: cols[6] || ''
      });
    }

    if (newRecords.length > 0) {
      onSaveRecords([...newRecords, ...records]);
    }
    setIsPasteModalOpen(false);
    setPasteContent('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Prioridad', 'Categoria', 'Features', 'Descripcion', 'Responsable', 'Fecha Inicio', 'Fecha Compromiso', 'Fecha Entrega', 'Notas'];
    const rows = records.map(r => [
      `"${r.prioridad || ''}"`,
      `"${r.categoria || ''}"`,
      `"${(r.features || '').replace(/"/g, '""')}"`,
      `"${(r.descripcion || '').replace(/"/g, '""')}"`,
      `"${r.responsable || ''}"`,
      `"${r.fechaInicio || ''}"`,
      `"${r.fechaCompromiso || ''}"`,
      `"${r.fechaEntrega || ''}"`,
      `"${(r.notas || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Roadmap_Features_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/70 p-4 sm:p-6 space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Title & Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B4F8A] text-white flex items-center justify-center shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Roadmap & Calendario de Features</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                {records.length} features
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cronograma de entregas con cuadrícula Gantt de días laborables (Lun - Vie).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Alerts button */}
          <button
            onClick={() => setIsAlertsDrawerOpen(!isAlertsDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              roadmapAlerts.vencidas.length > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : roadmapAlerts.estaSemana.length > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Alertas</span>
            {(roadmapAlerts.vencidas.length > 0 || roadmapAlerts.estaSemana.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Pegar Data */}
          <button
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs"
            title="Copiar celdas desde tu Excel y pegarlas directamente aquí"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>📋 Pegar desde Excel</span>
          </button>

          {/* Nuevo Feature */}
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B4F8A] hover:bg-[#153e6d] text-white text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Añadir Feature</span>
          </button>

          {/* Exportar */}
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition"
            title="Exportar CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Timeline Navigation Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search and Category filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por feature, responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B4F8A] transition text-xs"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-[#1B4F8A]"
              >
                <option value="todos">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Timeline Week Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium hidden md:inline">Ventana Calendario:</span>
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => setStartWorkdayOffset(prev => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
              title="Semana anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setStartWorkdayOffset(0)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white rounded-lg transition"
            >
              Semana Actual
            </button>
            <button
              onClick={() => setStartWorkdayOffset(prev => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
              title="Semana siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-[11px] text-slate-600 font-medium">
            <span className="w-3 h-3 rounded bg-[#711F68]" />
            <span>Período Feature</span>
          </div>
        </div>
      </div>

      {/* Main Roadmap Table & Gantt Spreadsheet Grid */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs text-slate-700 whitespace-nowrap select-none">
            {/* Table Header: Unified Deep Navy Blue Bar (#1B4F8A) matching user screenshot */}
            <thead className="sticky top-0 z-20 bg-[#1B4F8A] text-white shadow-sm">
              <tr>
                {/* Left Table Columns */}
                <th rowSpan={2} className="px-2.5 py-2 font-bold text-center border-r border-[#2C629E] w-12 sticky left-0 z-30 bg-[#1B4F8A]">
                  Prioridad
                </th>
                <th rowSpan={2} className="px-3 py-2 font-bold text-left border-r border-[#2C629E] min-w-[200px] max-w-[260px] sticky left-12 z-30 bg-[#1B4F8A]">
                  Features
                </th>
                <th rowSpan={2} className="px-3 py-2 font-bold text-left border-r border-[#2C629E] min-w-[240px] max-w-[320px]">
                  Descripcion
                </th>
                <th rowSpan={2} className="px-3 py-2 font-bold text-left border-r border-[#2C629E] w-28">
                  Responsable
                </th>
                <th rowSpan={2} className="px-3 py-2 font-bold text-center border-r border-[#2C629E] w-28">
                  Fecha compromiso
                </th>
                <th rowSpan={2} className="px-3 py-2 font-bold text-center border-r border-[#2C629E] w-28">
                  Fecha entrega
                </th>
                <th rowSpan={2} className="px-3 py-2 font-bold text-left border-r border-[#2C629E] min-w-[140px]">
                  Notas
                </th>
                <th rowSpan={2} className="px-2 py-2 font-bold text-center border-r border-[#2C629E] w-16">
                  Acciones
                </th>

                {/* Right Timeline Days Header - Row 1: LU, MA, MI, JU, VI */}
                {timelineDays.map(day => (
                  <th
                    key={`header-day-${day.key}`}
                    className={`w-9 text-center font-bold text-[11px] border-r border-[#2C629E] py-1 ${
                      day.isToday ? 'bg-[#2563EB]' : ''
                    }`}
                  >
                    {day.dayName}
                  </th>
                ))}
              </tr>

              {/* Right Timeline Dates Header - Row 2: Rotated / Vertical Dates 07/09/26 */}
              <tr>
                {timelineDays.map(day => (
                  <th
                    key={`header-date-${day.key}`}
                    className={`w-9 h-16 text-center font-mono text-[10px] font-semibold border-r border-[#2C629E] align-middle px-0.5 ${
                      day.isToday ? 'bg-[#2563EB]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span 
                        className="inline-block transform -rotate-90 whitespace-nowrap tracking-tighter"
                        title={day.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      >
                        {day.dateStr}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8 + timelineDays.length} className="text-center py-16 text-slate-400">
                    <p className="font-semibold text-sm">No hay features registrados en el roadmap.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Usa el botón "+ Añadir Feature" o "📋 Pegar desde Excel".
                    </p>
                  </td>
                </tr>
              ) : (
                (() => {
                  let lastCategory: string | null = null;
                  return filteredRecords.map((record) => {
                    const showCategoryHeader = record.categoria && record.categoria !== lastCategory;
                    if (record.categoria) lastCategory = record.categoria;

                    return (
                      <React.Fragment key={record.id}>
                        {/* Category Header row if new category (e.g. Módulo CalibrAIte in screenshot) */}
                        {showCategoryHeader && (
                          <tr className="bg-slate-100 border-y border-slate-300">
                            <td 
                              colSpan={8 + timelineDays.length} 
                              className="px-3 py-1.5 font-bold text-slate-800 tracking-wide text-xs bg-slate-100/90 sticky left-0 z-10"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-3.5 bg-[#1B4F8A] rounded-full" />
                                <span>{record.categoria}</span>
                              </div>
                            </td>
                          </tr>
                        )}

                        <tr className="hover:bg-indigo-50/25 transition-colors group">
                          {/* Col 1: Prioridad */}
                          <td className="px-2.5 py-2.5 text-center font-bold text-slate-800 border-r border-slate-200 sticky left-0 z-10 bg-white group-hover:bg-slate-50">
                            {record.prioridad}
                          </td>

                          {/* Col 2: Features */}
                          <td className="px-3 py-2.5 font-semibold text-slate-900 border-r border-slate-200 truncate max-w-[260px] sticky left-12 z-10 bg-white group-hover:bg-slate-50">
                            <button
                              onClick={() => handleOpenEdit(record)}
                              className="text-left font-bold text-slate-900 hover:text-[#1B4F8A] transition w-full truncate"
                              title="Clic para editar este feature"
                            >
                              {record.features}
                            </button>
                          </td>

                          {/* Col 3: Descripcion */}
                          <td className="px-3 py-2.5 text-slate-600 border-r border-slate-200 truncate max-w-[320px]" title={record.descripcion}>
                            {record.descripcion || '-'}
                          </td>

                          {/* Col 4: Responsable */}
                          <td className="px-3 py-2.5 font-medium text-slate-700 border-r border-slate-200">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200/80">
                              {record.responsable || '-'}
                            </span>
                          </td>

                          {/* Col 5: Fecha compromiso */}
                          <td className="px-3 py-2.5 text-center font-semibold text-amber-700 border-r border-slate-200">
                            {record.fechaCompromiso || '-'}
                          </td>

                          {/* Col 6: Fecha entrega */}
                          <td className="px-3 py-2.5 text-center font-semibold text-emerald-700 border-r border-slate-200">
                            {record.fechaEntrega || '-'}
                          </td>

                          {/* Col 7: Notas */}
                          <td className="px-3 py-2.5 text-slate-500 border-r border-slate-200 truncate max-w-[160px]" title={record.notas}>
                            {record.notas || '-'}
                          </td>

                          {/* Actions */}
                          <td className="px-2 py-2.5 text-center border-r border-slate-200 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(record)}
                                className="p-1 rounded text-slate-400 hover:text-[#1B4F8A] hover:bg-slate-100 transition"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteRecord(record.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Timeline Grid: 25 business days */}
                          {timelineDays.map((day) => {
                            const isActive = isRecordActiveOnDay(record, day.date);

                            return (
                              <td
                                key={`cell-${record.id}-${day.key}`}
                                className={`w-9 h-9 p-0 text-center border-r border-slate-200 ${
                                  day.isToday ? 'bg-blue-50/60' : ''
                                }`}
                              >
                                {isActive ? (
                                  <div 
                                    className="w-full h-7 bg-[#711F68] my-auto transition-transform hover:opacity-90 shadow-2xs"
                                    title={`${record.features} (${record.responsable}) - ${day.dayName} ${day.dateStr}`}
                                  />
                                ) : (
                                  <div className="w-full h-full hover:bg-slate-100/60 transition-colors" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Drawer / Modal */}
      {isAlertsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Alertas de Compromiso</h3>
                    <p className="text-xs text-slate-500">Próximas entregas y vencimientos</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAlertsDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* Vencidas */}
                {roadmapAlerts.vencidas.length > 0 && (
                  <div>
                    <h4 className="font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Vencidas ({roadmapAlerts.vencidas.length})
                    </h4>
                    <div className="space-y-2">
                      {roadmapAlerts.vencidas.map(a => (
                        <div key={a.record.id} className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl">
                          <p className="font-bold text-rose-950">{a.record.features}</p>
                          <div className="flex items-center justify-between mt-1 text-slate-600">
                            <span>Resp: {a.record.responsable}</span>
                            <span className="font-bold text-rose-700">Hace {a.days} día{a.days !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Esta semana */}
                {roadmapAlerts.estaSemana.length > 0 && (
                  <div>
                    <h4 className="font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Para esta semana ({roadmapAlerts.estaSemana.length})
                    </h4>
                    <div className="space-y-2">
                      {roadmapAlerts.estaSemana.map(a => (
                        <div key={a.record.id} className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                          <p className="font-bold text-amber-950">{a.record.features}</p>
                          <div className="flex items-center justify-between mt-1 text-slate-600">
                            <span>Resp: {a.record.responsable}</span>
                            <span className="font-bold text-amber-700">En {a.days} día{a.days !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Próximas */}
                {roadmapAlerts.proximas.length > 0 && (
                  <div>
                    <h4 className="font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Próximas entregas ({roadmapAlerts.proximas.length})
                    </h4>
                    <div className="space-y-2">
                      {roadmapAlerts.proximas.map(a => (
                        <div key={a.record.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <p className="font-bold text-slate-900">{a.record.features}</p>
                          <div className="flex items-center justify-between mt-1 text-slate-600">
                            <span>Resp: {a.record.responsable}</span>
                            <span className="font-medium text-slate-700">En {a.days} días ({a.record.fechaCompromiso})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {roadmapAlerts.vencidas.length === 0 && roadmapAlerts.estaSemana.length === 0 && roadmapAlerts.proximas.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                    <p className="font-semibold text-slate-600">No hay entregas pendientes o vencidas.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsAlertsDrawerOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Feature Modal */}
      {isEditModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {records.some(r => r.id === editingRecord.id) ? 'Editar Feature del Roadmap' : 'Añadir Feature al Roadmap'}
                </h3>
                <p className="text-xs text-slate-500">
                  Define el nombre, responsable y el rango de fechas para el calendario.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Categoría */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoría / Módulo
                  </label>
                  <input
                    type="text"
                    value={editingRecord.categoria || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, categoria: e.target.value })}
                    placeholder="Ej. Módulo CalibrAIte, Autonomía, Integraciones"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                  />
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Prioridad / Orden
                  </label>
                  <input
                    type="text"
                    value={editingRecord.prioridad}
                    onChange={(e) => setEditingRecord({ ...editingRecord, prioridad: e.target.value })}
                    placeholder="1, 2, 3... o Alta, Media"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                    required
                  />
                </div>

                {/* Responsable */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={editingRecord.responsable}
                    onChange={(e) => setEditingRecord({ ...editingRecord, responsable: e.target.value })}
                    placeholder="Ej. Silia, Imple, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                    required
                  />
                </div>

                {/* Features (Nombre) */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Feature / Tarea
                  </label>
                  <input
                    type="text"
                    value={editingRecord.features}
                    onChange={(e) => setEditingRecord({ ...editingRecord, features: e.target.value })}
                    placeholder="Nombre descriptivo del feature o hito"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                    required
                  />
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={editingRecord.descripcion}
                    onChange={(e) => setEditingRecord({ ...editingRecord, descripcion: e.target.value })}
                    placeholder="Detalles sobre el alcance o entrega..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                  />
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha Inicio (Gantt)
                  </label>
                  <input
                    type="text"
                    value={editingRecord.fechaInicio || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, fechaInicio: e.target.value })}
                    placeholder="DD/MM/YYYY (ej. 07/09/2026)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                  />
                </div>

                {/* Fecha Compromiso */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha Compromiso (Fin)
                  </label>
                  <input
                    type="text"
                    value={editingRecord.fechaCompromiso}
                    onChange={(e) => setEditingRecord({ ...editingRecord, fechaCompromiso: e.target.value })}
                    placeholder="DD/MM/YYYY (ej. 11/9/2026)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                    required
                  />
                </div>

                {/* Fecha Entrega */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha Entrega Real
                  </label>
                  <input
                    type="text"
                    value={editingRecord.fechaEntrega || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, fechaEntrega: e.target.value })}
                    placeholder="DD/MM/YYYY (opcional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Notas
                  </label>
                  <input
                    type="text"
                    value={editingRecord.notas || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, notas: e.target.value })}
                    placeholder="Observaciones adicionales"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1B4F8A] hover:bg-[#153e6d] text-white font-semibold shadow-xs transition"
                >
                  Guardar Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paste Data from Excel Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ClipboardPaste className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Pegar Data desde Excel / Sheets</h3>
                  <p className="text-xs text-slate-500">Copia tus celdas de Excel y pégalas directamente en el cuadro.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                Columnas esperadas (separadas por tabulación al copiar de Excel):
                <br />
                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                  Prioridad | Features | Descripcion | Responsable | Fecha compromiso | Fecha entrega | Notas
                </span>
              </p>

              <textarea
                rows={8}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Pega aquí las filas copiadas de Excel..."
                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B4F8A]"
              />

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                >
                  Procesar e Importar Filas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
