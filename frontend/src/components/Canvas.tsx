import React, { useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useStore } from '../store';
import { Plus, Trash2, GripVertical, Settings2, Database, Layers, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FieldRenderer from './FieldRenderer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Canvas: React.FC = () => {
  const { activeTemplate, addSection, removeSection, updateTemplate, reorderSections, formValues, clearFormValues } = useStore();

  const isFieldVisible = (field: any) => {
    if (!field.conditional) return true;
    const { fieldId, operator, value } = field.conditional;
    const targetValue = formValues[fieldId];
    
    if (operator === 'equals') return targetValue === value;
    if (operator === 'not_equals') return targetValue !== value;
    if (operator === 'contains') {
      if (Array.isArray(targetValue)) return targetValue.includes(value);
      if (typeof targetValue === 'string') return targetValue.includes(value);
      return false;
    }
    if (operator === 'truthy') return !!targetValue;
    if (operator === 'greater_than') return Number(targetValue) > Number(value);
    if (operator === 'less_than') return Number(targetValue) < Number(value);
    return true;
  };

  if (!activeTemplate) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.05)_0%,transparent_70%)]">
        <div className="w-20 h-20 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
           <Plus size={40} className="text-white/20" />
        </div>
        <p className="text-sm font-bold tracking-widest uppercase opacity-30">Select Scan Protocol to Initialize</p>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-5xl mx-auto min-h-full pb-32">
      {/* Template Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 p-10 rounded-[2.5rem] glass relative overflow-hidden group border border-white/10"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-medical-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-medical-primary/20 transition-all duration-700" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-medical-primary/20 to-medical-accent/20 border border-medical-primary/40 flex items-center justify-center text-medical-primary shadow-2xl shadow-medical-primary/20 group-hover:neon-border transition-all">
                <Database size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-medical-neon animate-pulse" />
                   <span className="text-[11px] font-black tracking-[0.4em] text-medical-primary uppercase">Draft Schema 2.4</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic drop-shadow-2xl">
                   {activeTemplate.name}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-5 py-2 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-md flex items-center gap-3 group/chip hover:border-medical-primary/50 transition-all">
                 <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Protocol:</span>
                 <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest group-chip-hover:text-medical-primary">{activeTemplate.scanType}</span>
              </div>
              <div className="px-5 py-2 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-md flex items-center gap-3">
                 <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Build</span>
                 <span className="text-[11px] font-mono text-medical-primary font-bold tracking-widest">v{activeTemplate.version}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
             <div className="flex gap-2">
               <button 
                 onClick={() => {
                   alert('Protocol Arrangement Saved Successfully!');
                 }}
                 className="flex-1 h-14 px-6 bg-medical-primary text-white dark:text-medical-dark rounded-[1.25rem] flex items-center justify-center gap-2 font-black text-xs tracking-[0.2em] shadow-neon-glow hover:scale-105 transition-all uppercase"
               >
                 <Database size={18} />
                 SAVE
               </button>
               <button 
                 onClick={clearFormValues}
                 title="Reset All Inputs"
                 className="w-14 h-14 glass glass-hover rounded-[1.25rem] flex items-center justify-center text-slate-500 hover:text-medical-primary border border-slate-200 dark:border-white/10 transition-all shadow-xl"
               >
                 <RotateCcw size={20} />
               </button>
             </div>
             <div className="flex gap-3">
               <button className="flex-1 h-14 glass glass-hover rounded-[1.25rem] flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all shadow-2xl">
                 <Settings2 size={24} />
               </button>
               <button className="flex-1 h-14 glass glass-hover rounded-[1.25rem] flex items-center justify-center text-slate-600 hover:text-rose-500 border border-slate-200 dark:border-white/5 shadow-xl transition-all">
                 <Trash2 size={24} />
               </button>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Sections List */}
      <Reorder.Group 
        axis="y" 
        values={activeTemplate.sections} 
        onReorder={reorderSections}
        className="space-y-12"
      >
        {activeTemplate.sections.map((section, idx) => {
          const isActive = useStore.getState().activeSectionId === section.id;
          
          return (
            <Reorder.Item 
              key={section.id}
              value={section}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "group relative",
                section.fields.length > 0 && section.fields.filter(isFieldVisible).length === 0 && "hidden"
              )}
              onClick={() => useStore.getState().setActiveSection(section.id)}
            >
              {/* Section Controls */}
              <div className="absolute -left-16 top-0 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-medical-primary cursor-grab active:cursor-grabbing border border-slate-200 dark:border-white/5 shadow-xl transition-colors">
                  <GripVertical size={20} />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(section.id);
                  }}
                  className="w-10 h-10 glass glass-hover rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 border border-slate-200 dark:border-white/5 shadow-xl"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className={`glass rounded-[2rem] overflow-hidden border transition-all duration-500 shadow-2xl ${
                isActive 
                  ? 'border-medical-primary ring-2 ring-medical-primary/20 bg-medical-primary/[0.02]' 
                  : 'border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-100 dark:hover:bg-white/[0.02]'
              }`}>
                <div className={`px-10 py-6 border-b flex items-center justify-between ${
                  isActive ? 'bg-medical-primary/10 border-medical-primary/20' : 'bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
                }`}>
                   <div className="flex items-center gap-4 flex-1">
                      <div className="w-1 h-6 bg-medical-primary rounded-full shadow-neon-glow" />
                      <input 
                          type="text" 
                          value={section.title}
                          className="bg-transparent border-none outline-none text-lg font-black text-slate-900 dark:text-white w-full focus:text-medical-primary transition-colors tracking-tight uppercase"
                          placeholder="Section Title..."
                          onChange={(e) => {
                            const updatedSections = activeTemplate.sections.map(s => 
                              s.id === section.id ? { ...s, title: e.target.value } : s
                            );
                            updateTemplate({ ...activeTemplate, sections: updatedSections });
                          }}
                      />
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-medical-primary uppercase tracking-[0.2em]">{section.fields.length} PARAMETERS</span>
                         <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600 uppercase">SERIAL_ID: {section.id}</span>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-medical-primary/10 flex items-center justify-center text-medical-primary hover:bg-medical-primary hover:text-white dark:hover:text-medical-dark transition-all border border-medical-primary/20">
                        <Plus size={20} />
                      </button>
                   </div>
                </div>

                <div className={`p-10 ${
                  section.layout === 'clinical-table' 
                    ? 'grid grid-cols-3 gap-x-8 gap-y-4' 
                    : 'grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6'
                } min-h-[150px] relative`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,242,254,0.02)_0%,transparent_50%)] pointer-events-none" />
                  
                  {section.layout === 'clinical-table' && (
                    <>
                      <div />
                      <div className="text-[10px] font-black text-medical-primary uppercase tracking-[0.3em] text-center mb-2">B Mode Assessment</div>
                      <div className="text-[10px] font-black text-medical-primary uppercase tracking-[0.3em] text-center mb-2">Color Doppler</div>
                    </>
                  )}
                  {section.fields.filter(isFieldVisible).map((field, fIdx) => {
                    const isConditional = !!field.conditional;
                    
                    if (section.layout === 'clinical-table') {
                      const isLabelCol = fIdx % 2 === 0;
                      return (
                        <div key={field.id} className={cn(
                          isLabelCol ? 'col-span-2 grid grid-cols-2 gap-x-8 items-center' : 'col-span-1 items-center flex',
                          isConditional && 'pl-4 border-l-2 border-medical-primary/10 ml-4'
                        )}>
                          {isLabelCol ? (
                            <>
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{field.label}</span>
                              <FieldRenderer field={{ ...field, label: '' }} sectionId={section.id} hideIcon={true} />
                            </>
                          ) : (
                            <FieldRenderer field={field} sectionId={section.id} hideIcon={true} />
                          )}
                        </div>
                      );
                    }
                    const isFullWidth = field.type === 'dynamic-table' || field.type === 'grid-matrix' || field.type === 'textarea' || field.type === 'doppler-matrix' || field.type === 'biometry-matrix';
                    
                    return (
                      <div key={field.id} className={cn(
                        "transition-all duration-300",
                        isConditional && 'pl-8 border-l-2 border-medical-primary/30 ml-4 mb-2',
                        isFullWidth ? 'col-span-full w-full -mx-2' : 'h-full'
                      )}>
                        <FieldRenderer field={field} sectionId={section.id} />
                      </div>
                    );
                  })}
                  
                  {section.fields.length === 0 && (
                     <div className="col-span-full py-16 border-2 border-dashed border-white/5 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-600 bg-white/[0.01] group/empty hover:border-medical-primary/20 transition-colors">
                        <Layers size={48} className="mb-4 opacity-10 group-hover/empty:opacity-30 transition-opacity" />
                        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-30">Drop Schema Components Here</p>
                     </div>
                  )}
                </div>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      <motion.button 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => addSection({ id: Math.random().toString(36).substr(2, 9), title: 'New Structural Section', fields: [] })}
        className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-medical-primary/30 hover:bg-medical-primary/5 hover:text-medical-primary transition-all group shadow-xl mt-12"
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-medical-primary/10 transition-colors">
           <Plus size={24} />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.4em]">Initialize New Section Wrapper</span>
      </motion.button>
    </div>
  );
};

export default Canvas;
