import React from 'react';
import { 
  Search, 
  Filter, 
  Users2, 
  Flame, 
  ArrowUpDown, 
  RotateCcw, 
  Building2,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPrioridad: string;
  onPrioridadChange: (value: string) => void;
  selectedGrupo: string;
  onGrupoChange: (value: string) => void;
  selectedCompania: string;
  onCompaniaChange: (value: string) => void;
  onlyHighPriority: boolean;
  onToggleOnlyHighPriority: () => void;
  groupByTeams: boolean;
  onToggleGroupByTeams: () => void;
  sortBy: 'prioridad' | 'nombre' | 'fechaLimite' | 'compania';
  onSortByChange: (value: 'prioridad' | 'nombre' | 'fechaLimite' | 'compania') => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
  availableGrupos: string[];
  availableCompanias: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedPrioridad,
  onPrioridadChange,
  selectedGrupo,
  onGrupoChange,
  selectedCompania,
  onCompaniaChange,
  onlyHighPriority,
  onToggleOnlyHighPriority,
  groupByTeams,
  onToggleGroupByTeams,
  sortBy,
  onSortByChange,
  onResetFilters,
  totalFiltered,
  totalAll,
  availableGrupos,
  availableCompanias
}) => {
  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedPrioridad !== 'todas' || 
    selectedGrupo !== 'todos' || 
    selectedCompania !== 'todas' || 
    onlyHighPriority;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs px-4 sm:px-6 py-3.5 transition-all">
      <div className="w-full flex flex-col gap-3">
        
        {/* Top row: Search, Quick High Priority Pill, Group by Teams toggle, and Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="filter-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cliente, compañía, grupo Teams o pre-requisito..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Highlights */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Solo Alta Prioridad Toggle */}
            <button
              id="filter-btn-high-priority"
              onClick={onToggleOnlyHighPriority}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                onlyHighPriority
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs ring-2 ring-rose-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${onlyHighPriority ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
              <span>Solo Alta Prioridad</span>
              {onlyHighPriority && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 ml-0.5 animate-pulse" />
              )}
            </button>

            {/* Agrupar por Grupo de Teams Toggle */}
            <button
              id="filter-btn-group-by-teams"
              onClick={onToggleToggle => onToggleGroupByTeams()}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                groupByTeams
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              title="Agrupar visualmente las tarjetas por el canal / grupo de Teams asignado"
            >
              <Users2 className={`w-3.5 h-3.5 ${groupByTeams ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Agrupar por Teams</span>
              {groupByTeams && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 ml-0.5" />
              )}
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                id="filter-btn-reset"
                onClick={onResetFilters}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            )}

            {/* Client count info */}
            <span className="text-xs text-slate-600 font-medium px-2 py-1 bg-slate-100 rounded-md">
              Mostrando <strong className="text-slate-900">{totalFiltered}</strong> de {totalAll} clientes
            </span>
          </div>

        </div>

        {/* Bottom row: Select dropdowns for Prioridad, Grupo, Compañía, and Ordenamiento */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center space-x-1 text-slate-400 mr-1 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Prioridad Select */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
            <span className="text-slate-500">Prioridad:</span>
            <select
              id="filter-select-prioridad"
              value={selectedPrioridad}
              onChange={(e) => onPrioridadChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          {/* Grupo Select */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
            <span className="text-slate-500">Grupo:</span>
            <select
              id="filter-select-grupo"
              value={selectedGrupo}
              onChange={(e) => onGrupoChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los grupos</option>
              {availableGrupos.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Compañía Select */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500">Compañía:</span>
            <select
              id="filter-select-compania"
              value={selectedCompania}
              onChange={(e) => onCompaniaChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas</option>
              {availableCompanias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Ordenar Por */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 ml-auto">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500">Ordenar por:</span>
            <select
              id="filter-select-sortby"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="prioridad">Prioridad (Alta primero)</option>
              <option value="fechaLimite">Fecha Límite Pre-Requisitos</option>
              <option value="nombre">Nombre de Cliente</option>
              <option value="compania">Compañía</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
