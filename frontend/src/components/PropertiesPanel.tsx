import React from 'react';
import { 
  Settings, 
  X, 
  ToggleLeft, 
  Link as LinkIcon, 
  Eye, 
  Copy, 
  Code,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PropertiesPanel: React.FC<{ className?: string }> = ({ className }) => {
  const { selectedFieldId, setSelectedField, activeTemplate, updateField } = useStore();

  // Find the selected field in the active template
  const selectedField = activeTemplate?.sections
    .flatMap(s => s.fields)
    .find(f => f.id === selectedFieldId);
  
  const sectionId = activeTemplate?.sections.find(s => 
    s.fields.some(f => f.id === selectedFieldId)
  )?.id;

  if (!selectedFieldId || !selectedField || !sectionId) {
    return (
      <div className={cn("w-80 glass border-l border-white/5 p-6 flex flex-col items-center justify-center text-center", className)}>
        <Settings size={40} className="text-slate-800 mb-4" />
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Property Inspector</h3>
        <p className="text-xs text-slate-600 mt-2">Select a field on the canvas to configure its advanced logic and properties.</p>
      </div>
    );
  }

  return (
    <aside className={cn("w-80 glass flex flex-col border-l border-white/5", className)}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
           <Settings size={16} className="text-medical-primary" />
           <h3 className="text-xs font-bold text-white uppercase tracking-widest">Field Properties</h3>
        </div>
        <button 
           onClick={() => setSelectedField(null, null)}
           className="p-1 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Basic Settings */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.2em] block mb-2">Core Identity</label>
          
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-mono">LABEL_NAME</span>
            <input 
              type="text" 
              value={selectedField.label}
              onChange={(e) => updateField(sectionId, selectedField.id, { label: e.target.value })}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:neon-border outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">INTERNAL_DATABASE_ID</span>
              <Code size={10} className="text-slate-500" />
            </div>
            <input 
              type="text" 
              value={selectedField.id}
              disabled={true} // Marked as read-only for now since it's a primary key
              className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-slate-500 font-mono italic opacity-60 cursor-not-allowed"
            />
            <p className="text-[8px] text-slate-500 italic leading-tight">System-generated unique identifier. Currently in read-only mode for schema stability.</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-mono">PLACEHOLDER</span>
            <input 
              type="text" 
              value={selectedField.placeholder || ''}
              onChange={(e) => updateField(sectionId, selectedField.id, { placeholder: e.target.value })}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:neon-border outline-none transition-all"
              placeholder="e.g. Enter notes here..."
            />
          </div>
        </div>

        {/* Options Editor (Dropdown, Radio, Checkbox Group) */}
        {['dropdown', 'radio', 'checkbox-group'].includes(selectedField.type) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.2em] block">Options Configuration</label>
              <button 
                onClick={() => {
                  const currentOptions = selectedField.options || [];
                  updateField(sectionId, selectedField.id, {
                    options: [...currentOptions, { label: 'New Option', value: 'new_option' }]
                  });
                }}
                className="text-[10px] font-black text-medical-primary hover:text-white transition-colors"
              >
                + ADD CHOICE
              </button>
            </div>
            
            <div className="space-y-2">
              {(selectedField.options || []).map((opt, idx) => (
                <div key={idx} className="flex gap-2 group/opt items-center">
                  <input 
                    type="text" 
                    value={opt.label}
                    onChange={(e) => {
                      const newOptions = [...(selectedField.options || [])];
                      newOptions[idx] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                      updateField(sectionId, selectedField.id, { options: newOptions });
                    }}
                    className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-medical-primary/50 outline-none"
                    placeholder="label"
                  />
                  <button 
                    onClick={() => {
                      const newOptions = (selectedField.options || []).filter((_, i) => i !== idx);
                      updateField(sectionId, selectedField.id, { options: newOptions });
                    }}
                    className="p-1.5 opacity-0 group-hover/opt:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(selectedField.options || []).length === 0 && (
                <div className="p-4 border border-dashed border-white/10 rounded-xl text-center">
                  <p className="text-[10px] text-slate-600 italic">No options defined yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.2em] block">Data Validation</label>
          
          <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Required Field</span>
                <span className="text-[9px] text-slate-500">Must be filled before saving</span>
             </div>
             <button 
               onClick={() => updateField(sectionId, selectedField.id, { required: !selectedField.required })}
               className={cn(
                 "w-10 h-6 rounded-full relative transition-colors duration-200",
                 selectedField.required ? "bg-medical-primary" : "bg-slate-700"
               )}
             >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200",
                  selectedField.required ? "left-5" : "left-1"
                )} />
             </button>
          </div>
        </div>

        {/* Conditional Logic */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.2em]">Flow Logic</label>
              <button className="text-[9px] font-bold text-medical-primary flex items-center gap-1 hover:underline">
                 <LinkIcon size={10} /> ADD RULE
              </button>
           </div>
           
           <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
              <div className="flex items-center gap-2 mb-3">
                 <Eye size={14} className="text-indigo-400" />
                 <span className="text-[10px] text-indigo-400 font-bold uppercase">Visibility Rule</span>
              </div>
              <p className="text-[10px] text-slate-500 italic mb-4">"Show this field only if 'OB History' is set to 'Yes'"</p>
              
              <div className="flex gap-2">
                 <div className="flex-1 bg-white/5 border border-white/10 rounded p-1.5 text-[9px] text-slate-400">OB_HISTORY</div>
                 <div className="w-8 bg-white/5 border border-white/10 rounded p-1.5 text-[9px] text-center text-slate-400">==</div>
                 <div className="flex-1 bg-white/5 border border-white/10 rounded p-1.5 text-[9px] text-slate-400 italic">TRUE</div>
              </div>
           </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-medical-primary/10 to-transparent border border-medical-primary/30 relative overflow-hidden group">
          <Sparkles className="absolute -right-2 -top-2 text-medical-primary/20 w-16 h-16 group-hover:rotate-12 transition-transform" />
          <h4 className="text-[10px] font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={12} className="text-medical-neon" />
            AI SCHEMA TOOL
          </h4>
          <p className="text-[9px] text-slate-400 leading-relaxed mb-3">
            I recommend mapping this field to the <span className="text-medical-primary">DICOM standard tag 0008,103E</span> for better interoperability.
          </p>
          <button className="w-full py-2 bg-medical-primary text-medical-dark rounded-lg text-[10px] font-bold hover:shadow-neon-glow transition-all">
            ACTIVATE MAPPING
          </button>
        </div>
      </div>

      {/* Code Export Preview */}
      <div className="p-4 border-t border-white/5 bg-black/20">
         <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-600">SCHEMA_ID: {selectedField.id}</span>
            <button className="text-slate-500 hover:text-white"><Copy size={12} /></button>
         </div>
         <div className="p-3 bg-black/40 rounded-lg border border-white/5">
            <pre className="text-[9px] font-mono text-medical-neon/70 overflow-hidden text-ellipsis">
               {JSON.stringify(selectedField, null, 2).substring(0, 100)}...
            </pre>
         </div>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
