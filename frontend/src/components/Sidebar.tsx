import React from 'react';
import { 
  Type, 
  Hash, 
  ChevronDown, 
  CheckSquare, 
  CircleDot, 
  FileUp, 
  Video, 
  Map, 
  Calendar,
  Layers,
  Search,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '../store';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const fieldTypes = [
    { type: 'textarea', label: 'Short Text', icon: <Type size={16} />, color: 'text-blue-400', rows: 1 },
    { type: 'textarea', label: 'Long Notes', icon: <Layers size={16} />, color: 'text-indigo-400', rows: 4 },
    { type: 'number', label: 'Numeric Data', icon: <Hash size={16} />, color: 'text-orange-400' },
    { type: 'dropdown', label: 'Selection', icon: <ChevronDown size={16} />, color: 'text-emerald-400' },
    { type: 'checkbox-group', label: 'Multi-Select', icon: <CheckSquare size={16} />, color: 'text-green-400' },
    { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare size={16} />, color: 'text-slate-400' },
    { type: 'file', label: 'Static Image', icon: <FileUp size={16} />, color: 'text-cyan-400' },
    { type: 'video', label: 'Dynamic Video', icon: <Video size={16} />, color: 'text-rose-400' },
    { type: 'grid-matrix', label: 'Grid / Matrix', icon: <Layers size={16} />, color: 'text-purple-400' },
    { type: 'region-selector', label: 'Region Map', icon: <Map size={16} />, color: 'text-medical-primary' },
    { type: 'date', label: 'Date/Time', icon: <Calendar size={16} />, color: 'text-yellow-400' },
  ];

  return (
    <aside className={cn("w-72 glass flex flex-col border-r border-slate-200 dark:border-white/5", className)}>
      {/* Search Toolbox */}
      <div className="p-4 border-b border-slate-200 dark:border-white/5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Components Toolbox</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Search fields..."
            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs focus:neon-border outline-none transition-all text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Basic Fields */}
        <div>
          <h3 className="text-[11px] font-bold text-medical-primary/70 dark:text-medical-primary/70 uppercase tracking-widest mb-3 flex items-center justify-between">
            Standard Inputs
            <Plus size={12} className="cursor-pointer hover:text-slate-900 dark:hover:text-white" />
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {fieldTypes.slice(0, 5).map((field) => (
              <DraggableItem key={field.type} {...field} />
            ))}
          </div>
        </div>

        {/* Media & Advanced */}
        <div>
          <h3 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400/70 uppercase tracking-widest mb-3">Medical Core</h3>
          <div className="space-y-2">
            {fieldTypes.slice(5).map((field) => (
              <DraggableItem key={field.type} {...field} fullWidth />
            ))}
          </div>
        </div>

        {/* AI Suggestions Box */}
        <div className="mt-8 p-4 rounded-xl border border-medical-primary/20 bg-medical-primary/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-medical-primary/10 rounded-full blur-xl group-hover:bg-medical-primary/20 transition-all" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-medical-neon rounded-full" />
            <h4 className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">AI Assistant</h4>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
            "Based on 'Abdomen' scan, I suggest adding a 'Liver echogenicity' dropdown."
          </p>
          <button className="mt-3 w-full py-1.5 bg-medical-primary/10 border border-medical-primary/30 rounded text-[9px] font-bold text-medical-primary hover:bg-medical-primary hover:text-white dark:hover:text-medical-dark transition-all">
            APPLY SUGGESTION
          </button>
        </div>
      </div>

      {/* Reusable Blocks Tag */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
        <button className="flex items-center justify-center gap-2 w-full py-2 bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/5 transition-colors">
          <Layers size={14} className="text-medical-primary" />
          Saved Templates
        </button>
      </div>
    </aside>
  );
};

const DraggableItem: React.FC<{ type: string, label: string, icon: React.ReactNode, color: string, fullWidth?: boolean, rows?: number }> = ({ type, label, icon, color, fullWidth, rows }) => {
  const { activeTemplate, addField, activeSectionId } = useStore();

  const handleAddField = () => {
    if (!activeTemplate || activeTemplate.sections.length === 0) return;
    
    const newField: any = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `New ${label}`,
      placeholder: `Enter ${label.toLowerCase()}...`,
      required: false,
      rows: rows
    };

    // Use activeSectionId if set, otherwise fallback to first section
    const targetSectionId = activeSectionId || activeTemplate.sections[0].id;
    addField(targetSectionId, newField);
  };

  return (
    <div 
      onClick={handleAddField}
      className={cn(
        "group flex items-center p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.03] cursor-pointer active:scale-95 hover:border-medical-primary/40 hover:bg-medical-primary/10 transition-all duration-200",
        fullWidth ? "w-full gap-3" : "flex-col justify-center text-center gap-2 h-24"
      )}
    >
      <div className={cn("p-2 rounded-lg bg-slate-200 dark:bg-black/20 group-hover:scale-110 transition-transform", color)}>
        {icon}
      </div>
      <span className={cn("text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors", fullWidth ? "" : "leading-tight")}>{label}</span>
      
      {!fullWidth && (
        <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-100">
           <Plus size={10} className="text-medical-primary" />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
