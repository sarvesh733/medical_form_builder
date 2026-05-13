// import React, { useEffect, useState } from 'react';
// import { motion, Reorder } from 'framer-motion';
// import { useStore } from '../store';
// import { Plus, Trash2, GripVertical, Settings2, Database, Layers, RotateCcw, ChevronDown } from 'lucide-react';
// import { clsx, type ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';
// import FieldRenderer from './FieldRenderer';

// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// type CanvasProps = {
//   isLocked?: boolean;
//   isReadOnlyData?: boolean;
// };

// const Canvas: React.FC<CanvasProps> = ({ isLocked = false, isReadOnlyData = false }) => {
//   const { activeTemplate, addSection, removeSection, updateTemplate, reorderSections, formValues, clearFormValues } = useStore();
//   const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set());

//   useEffect(() => {
//     if (!activeTemplate) {
//       setExpandedSectionIds(new Set());
//       return;
//     }

//     if (!isLocked) {
//       setExpandedSectionIds(new Set(activeTemplate.sections.map((section) => section.id)));
//       return;
//     }

//     // In locked/form mode, start minimized by default.
//     setExpandedSectionIds(new Set());
//   }, [activeTemplate?.id, isLocked]);

//   const isFieldVisible = (field: any) => {
//     if (!field.conditional) return true;
//     const { fieldId, operator, value } = field.conditional;
//     const targetValue = formValues[fieldId];

//     if (operator === 'equals') return targetValue === value;
//     if (operator === 'not_equals') return targetValue !== value;
//     if (operator === 'contains') {
//       if (Array.isArray(targetValue)) return targetValue.includes(value);
//       if (typeof targetValue === 'string') return targetValue.includes(value);
//       return false;
//     }
//     if (operator === 'truthy') return !!targetValue;
//     if (operator === 'greater_than') return Number(targetValue) > Number(value);
//     if (operator === 'less_than') return Number(targetValue) < Number(value);
//     return true;
//   };

//   if (!activeTemplate) {
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.05)_0%,transparent_70%)]">
//         <div className="w-20 h-20 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
//            <Plus size={40} className="text-white/20" />
//         </div>
//         <p className="text-sm font-bold tracking-widest uppercase opacity-30">Select Scan Protocol to Initialize</p>
//       </div>
//     );
//   }

//   return (
//     <div className="canvas-content px-4 py-8 sm:px-6 md:px-8 md:py-10 lg:px-10 lg:py-12 max-w-5xl mx-auto min-h-full pb-24 md:pb-28 lg:pb-32">
//       {/* Template Header Area */}
//       <motion.div 
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="mb-8 md:mb-10 lg:mb-12 p-5 sm:p-6 md:p-7 lg:p-8 rounded-[1.5rem] md:rounded-[1.75rem] glass relative overflow-hidden group border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/40 shadow-lg"
//       >
//         <div className="absolute -right-20 -top-20 w-80 h-80 bg-medical-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-medical-primary/10 transition-all duration-700" />

//         <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
//           <div className="space-y-3 md:space-y-4 lg:space-y-5 min-w-0">
//             <div className="flex items-center gap-3 md:gap-4 lg:gap-5 min-w-0">
//               <div className="w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-[1rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-medical-primary shadow-sm shrink-0">
//                 <Database size={26} />
//               </div>
//               <div className="min-w-0">
//                 <div className="flex items-center gap-2 mb-1">
//                    <div className="w-2 h-2 rounded-full bg-medical-neon animate-pulse" />
//                    <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.22em] text-medical-primary uppercase">Draft Schema 2.4</span>
//                 </div>
//                  <h1 className="text-3xl sm:text-4xl md:text-[2.4rem] lg:text-[2.8rem] font-semibold text-slate-800 dark:text-slate-100 tracking-tight uppercase leading-[1.02] max-w-4xl">
//                    {activeTemplate.name}
//                 </h1>
//               </div>
//             </div>

//             <div className="flex flex-wrap items-center gap-2 md:gap-3">
//               <div className="px-4 py-2 rounded-full bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center gap-2.5 transition-all">
//                   <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">Protocol</span>
//                   <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">{activeTemplate.scanType}</span>
//               </div>
//               <div className="px-4 py-2 rounded-full bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center gap-2.5">
//                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">Build</span>
//                   <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200">v{activeTemplate.version}</span>
//               </div>
//             </div>
//           </div>

//           {!isLocked && (
//             <div className="flex flex-col gap-3 lg:items-end">
//               <div className="flex justify-end">
//                 <button 
//                   onClick={clearFormValues}
//                   title="Reset All Inputs"
//                   className="w-12 h-12 md:w-14 md:h-14 glass glass-hover rounded-[1rem] flex items-center justify-center text-slate-500 hover:text-medical-primary border border-slate-200 dark:border-white/10 transition-all shadow-sm"
//                 >
//                   <RotateCcw size={18} />
//                 </button>
//               </div>
//               <div className="flex gap-3">
//                 <button className="flex-1 h-12 md:h-14 glass glass-hover rounded-[1rem] flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all shadow-sm">
//                   <Settings2 size={20} />
//                 </button>
//                 <button className="flex-1 h-12 md:h-14 glass glass-hover rounded-[1rem] flex items-center justify-center text-slate-600 hover:text-rose-500 border border-slate-200 dark:border-white/5 shadow-sm transition-all">
//                   <Trash2 size={20} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </motion.div>

//       {/* Sections List */}
//       <Reorder.Group 
//         axis="y" 
//         values={activeTemplate.sections} 
//         onReorder={isLocked ? () => {} : reorderSections}
//         className="space-y-5 md:space-y-6 lg:space-y-8"
//       >
//         {activeTemplate.sections.map((section, idx) => {
//           const isActive = useStore.getState().activeSectionId === section.id;
//           const isExpanded = !isLocked || expandedSectionIds.has(section.id);

//           return (
//             <Reorder.Item 
//               key={section.id}
//               value={section}
//               initial={{ opacity: 0, x: -30 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: idx * 0.1 }}
//               dragListener={!isLocked}
//               className={cn(
//                 "group relative",
//                 section.fields.length > 0 && section.fields.filter(isFieldVisible).length === 0 && "hidden"
//               )}
//               onClick={() => {
//                 useStore.getState().setActiveSection(section.id);
//                 if (isLocked) {
//                   setExpandedSectionIds((prev) => {
//                     const next = new Set(prev);
//                     if (next.has(section.id)) {
//                       next.delete(section.id);
//                     } else {
//                       next.add(section.id);
//                     }
//                     return next;
//                   });
//                 }
//               }}
//             >
//               {/* Section Controls */}
//               {!isLocked && (
//                 <div className="absolute -left-16 top-0 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
//                   <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-medical-primary cursor-grab active:cursor-grabbing border border-slate-200 dark:border-white/5 shadow-xl transition-colors">
//                     <GripVertical size={20} />
//                   </div>
//                   <button 
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeSection(section.id);
//                     }}
//                     className="w-10 h-10 glass glass-hover rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 border border-slate-200 dark:border-white/5 shadow-xl"
//                   >
//                     <Trash2 size={20} />
//                   </button>
//                 </div>
//               )}

//               <div className={`glass rounded-[1.5rem] overflow-hidden border transition-all duration-300 shadow-sm ${
//                 isActive 
//                   ? 'border-slate-300 ring-1 ring-slate-200 bg-slate-50/90 dark:bg-white/[0.02]' 
//                   : 'border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 bg-white/90 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.03]'
//               }`}>
//                 <div className={`px-4 py-4 sm:px-5 md:px-6 lg:px-8 border-b flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${
//                   isActive ? 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5' : 'bg-slate-50/90 dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
//                 }`}>
//                    <div className="flex items-center gap-3 flex-1 min-w-0">
//                       <div className="w-1 h-6 bg-slate-400 rounded-full" />
//                       {isLocked ? (
//                         <span className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 w-full tracking-tight uppercase leading-tight">
//                           {section.title}
//                         </span>
//                       ) : (
//                         <input 
//                             type="text" 
//                             value={section.title}
//                             className="bg-transparent border-none outline-none text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 w-full focus:text-slate-900 dark:focus:text-white transition-colors tracking-tight uppercase leading-tight"
//                             placeholder="Section Title..."
//                             onChange={(e) => {
//                               const updatedSections = activeTemplate.sections.map(s => 
//                                 s.id === section.id ? { ...s, title: e.target.value } : s
//                               );
//                               updateTemplate({ ...activeTemplate, sections: updatedSections });
//                             }}
//                         />
//                       )}
//                    </div>
//                    <div className="flex items-center gap-3 md:gap-4 lg:gap-6 self-start md:self-auto">
//                       {isLocked && (
//                         <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center">
//                           <ChevronDown
//                             size={16}
//                             className={cn(
//                               "text-slate-500 transition-transform duration-200",
//                               isExpanded ? "rotate-180" : "rotate-0"
//                             )}
//                           />
//                         </div>
//                       )}
//                       {!isLocked && (
//                         <button className="w-9 h-9 rounded-full bg-medical-primary/10 flex items-center justify-center text-medical-primary hover:bg-medical-primary hover:text-white dark:hover:text-medical-dark transition-all border border-medical-primary/20">
//                           <Plus size={16} />
//                         </button>
//                       )}
//                    </div>
//                 </div>

//                 {isExpanded && (
//                   <div className={`p-4 sm:p-5 md:p-6 lg:p-8 ${
//                     section.layout === 'clinical-table' 
//                       ? 'grid grid-cols-3 gap-x-6 gap-y-4' 
//                       : 'grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-5'
//                   } min-h-[150px] relative`}>
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,242,254,0.02)_0%,transparent_50%)] pointer-events-none" />

//                   {section.layout === 'clinical-table' && (
//                     <>
//                       <div />
//                       <div className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] text-center mb-2">B Mode Assessment</div>
//                       <div className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] text-center mb-2">Color Doppler</div>
//                     </>
//                   )}
//                   {section.fields.filter(isFieldVisible).map((field, fIdx) => {
//                     const isConditional = !!field.conditional;

//                     if (section.layout === 'clinical-table') {
//                       const isLabelCol = fIdx % 2 === 0;
//                       return (
//                         <div key={field.id} className={cn(
//                           isLabelCol ? 'col-span-2 grid grid-cols-2 gap-x-6 items-center' : 'col-span-1 items-center flex',
//                           isConditional && 'pl-4 border-l border-medical-primary/10 ml-4'
//                         )}>
//                           {isLabelCol ? (
//                             <>
//                               <span className="text-sm md:text-[15px] font-medium text-slate-600 dark:text-slate-300 uppercase tracking-[0.06em]">{field.label}</span>
//                               <FieldRenderer field={{ ...field, label: '' }} sectionId={section.id} hideIcon={true} readOnly={isReadOnlyData} />
//                             </>
//                           ) : (
//                             <FieldRenderer field={field} sectionId={section.id} hideIcon={true} readOnly={isReadOnlyData} />
//                           )}
//                         </div>
//                       );
//                     }
//                     const isFullWidth = field.type === 'dynamic-table' || field.type === 'grid-matrix' || field.type === 'textarea' || field.type === 'doppler-matrix' || field.type === 'biometry-matrix' || field.type === 'checkbox-group';

//                     return (
//                       <div key={field.id} className={cn(
//                         "transition-all duration-300",
//                         isConditional && 'pl-6 border-l border-slate-300 ml-4 mb-1',
//                         isFullWidth ? 'col-span-full w-full -mx-1' : 'h-full'
//                       )}>
//                         <FieldRenderer field={field} sectionId={section.id} readOnly={isReadOnlyData} />
//                       </div>
//                     );
//                   })}

//                   {section.fields.length === 0 && (
//                       <div className="col-span-full py-14 border border-dashed border-slate-200 dark:border-white/5 rounded-[1.25rem] flex flex-col items-center justify-center text-slate-500 bg-white/70 dark:bg-white/[0.01] group/empty hover:border-slate-300 transition-colors">
//                         <Layers size={48} className="mb-4 opacity-10 group-hover/empty:opacity-30 transition-opacity" />
//                         <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-30">Drop Schema Components Here</p>
//                      </div>
//                   )}
//                   </div>
//                 )}
//               </div>
//             </Reorder.Item>
//           );
//         })}
//       </Reorder.Group>

//       {!isLocked && (
//         <motion.button 
//           whileHover={{ scale: 1.01 }}
//           whileTap={{ scale: 0.99 }}
//           onClick={() => addSection({ id: Math.random().toString(36).substr(2, 9), title: 'New Structural Section', fields: [] })}
//           className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-all group shadow-sm mt-10"
//         >
//           <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
//              <Plus size={22} />
//           </div>
//           <span className="text-xs font-semibold uppercase tracking-[0.24em]">Add New Section</span>
//         </motion.button>
//       )}
//     </div>
//   );
// };

// export default Canvas;














































import React, { useEffect, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useStore } from '../store';
import { Plus, Trash2, GripVertical, Settings2, Database, Layers, RotateCcw, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FieldRenderer from './FieldRenderer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CanvasProps = {
  isLocked?: boolean;
  isReadOnlyData?: boolean;
};

const Canvas: React.FC<CanvasProps> = ({ isLocked = false, isReadOnlyData = false }) => {
  const { activeTemplate, addSection, removeSection, updateTemplate, reorderSections, formValues, clearFormValues } = useStore();
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activeTemplate) {
      setExpandedSectionIds(new Set());
      return;
    }

    if (!isLocked) {
      setExpandedSectionIds(new Set(activeTemplate.sections.map((section) => section.id)));
      return;
    }

    // In locked/form mode, start minimized by default.
    setExpandedSectionIds(new Set());
  }, [activeTemplate?.id, isLocked]);

  const isConditionalVisible = (conditional: any) => {
    if (!conditional) return true;
    const { fieldId, operator, value } = conditional;
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

  const isFieldVisible = (field: any) => isConditionalVisible(field.conditional);
  
  const isSectionVisible = (section: any) => isConditionalVisible(section.conditional);

  if (!activeTemplate) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.05)_0%,transparent_70%)]">
        <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
          <Plus size={32} className="sm:w-10 sm:h-10 text-white/20" />
        </div>
        <p className="text-xs sm:text-sm font-bold tracking-widest uppercase opacity-30">Select Scan Protocol to Initialize</p>
      </div>
    );
  }

  return (
    <div className="canvas-content w-full px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10 lg:px-8 lg:py-12 max-w-6xl mx-auto min-h-full pb-20 sm:pb-24 md:pb-28 lg:pb-32">
      {/* Template Header Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8 lg:mb-8 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[1.25rem] glass relative overflow-hidden group border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/40 shadow-lg"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-medical-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-medical-primary/10 transition-all duration-700" />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-5 md:gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 min-w-0 flex-1">
            <div className="flex items-start sm:items-center gap-3 md:gap-4 lg:gap-5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-medical-primary shadow-sm shrink-0">
                <Database size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[2.8rem] font-semibold text-slate-800 dark:text-slate-100 tracking-tight uppercase leading-tight break-words">
                  {activeTemplate.name}
                </h1>
              </div>
            </div>

          </div>

          {!isLocked && (
            <div className="flex flex-col gap-2 sm:gap-3 lg:items-end w-full sm:w-auto">
              <div className="flex justify-end">
                <button
                  onClick={clearFormValues}
                  title="Reset All Inputs"
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 glass glass-hover rounded-lg sm:rounded-xl flex items-center justify-center text-slate-500 hover:text-medical-primary border border-slate-200 dark:border-white/10 transition-all shadow-sm"
                >
                  <RotateCcw size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button className="flex-1 h-10 sm:h-12 md:h-13 lg:h-14 glass glass-hover rounded-lg sm:rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all shadow-sm">
                  <Settings2 size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
                <button className="flex-1 h-10 sm:h-12 md:h-13 lg:h-14 glass glass-hover rounded-lg sm:rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 border border-slate-200 dark:border-white/5 shadow-sm transition-all">
                  <Trash2 size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Sections List */}
      <Reorder.Group
        axis="y"
        values={activeTemplate.sections}
        onReorder={isLocked ? () => { } : reorderSections}
        className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-4 xl:space-y-5"
      >
        {activeTemplate.sections.map((section, idx) => {
          const isActive = useStore.getState().activeSectionId === section.id;
          const isExpanded = !isLocked || expandedSectionIds.has(section.id);

          // Check if section itself is hidden by conditional logic
          if (!isSectionVisible(section)) {
            return null;
          }

          return (
            <Reorder.Item
              key={section.id}
              value={section}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              dragListener={!isLocked}
              className={cn(
                "group relative",
                section.fields.length > 0 && section.fields.filter(isFieldVisible).length === 0 && "hidden"
              )}
              onClick={() => {
                useStore.getState().setActiveSection(section.id);
                if (isLocked) {
                  setExpandedSectionIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(section.id)) {
                      next.delete(section.id);
                    } else {
                      next.add(section.id);
                    }
                    return next;
                  });
                }
              }}
            >
              {/* Section Controls */}
              {!isLocked && (
                <div className="absolute -left-12 sm:-left-14 md:-left-16 top-0 flex flex-col gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 glass rounded-lg sm:rounded-xl flex items-center justify-center text-slate-400 hover:text-medical-primary cursor-grab active:cursor-grabbing border border-slate-200 dark:border-white/5 shadow-xl transition-colors">
                    <GripVertical size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(section.id);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 glass glass-hover rounded-lg sm:rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 border border-slate-200 dark:border-white/5 shadow-xl"
                  >
                    <Trash2 size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}

              <div className={`glass rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm ${isActive
                  ? 'border-slate-300 ring-1 ring-slate-200 bg-slate-50/90 dark:bg-white/[0.02]'
                  : 'border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 bg-white/90 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                }`}>
                <div className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${isActive ? 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5' : 'bg-slate-50/90 dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
                  }`}>
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-0.5 sm:w-1 h-5 sm:h-6 bg-slate-400 rounded-full shrink-0" />
                    {isLocked ? (
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 w-full tracking-tight uppercase leading-tight break-words">
                        {section.title}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={section.title}
                        className="bg-transparent border-none outline-none text-sm sm:text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100 w-full focus:text-slate-900 dark:focus:text-white transition-colors tracking-tight uppercase leading-tight"
                        placeholder="Section Title..."
                        onChange={(e) => {
                          const updatedSections = activeTemplate.sections.map(s =>
                            s.id === section.id ? { ...s, title: e.target.value } : s
                          );
                          updateTemplate({ ...activeTemplate, sections: updatedSections });
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 self-start md:self-auto">
                    {isLocked && (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                        <ChevronDown
                          size={16}
                          className={cn(
                            "text-slate-500 transition-transform duration-200",
                            isExpanded ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </div>
                    )}
                    {!isLocked && (
                      <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-medical-primary/10 flex items-center justify-center text-medical-primary hover:bg-medical-primary hover:text-white dark:hover:text-medical-dark transition-all border border-medical-primary/20 shrink-0">
                        <Plus size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className={`p-2 sm:p-3 md:p-4 ${section.layout === 'clinical-table'
                      ? 'grid grid-cols-3 gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-2 sm:gap-y-3'
                      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-2 sm:gap-y-3 md:gap-y-4'
                    } min-h-[100px] relative`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,242,254,0.02)_0%,transparent_50%)] pointer-events-none" />

                    {section.layout === 'clinical-table' && (
                      <>
                        <div />
                        <div className="text-[9px] sm:text-[10px] md:text-xs font-black text-medical-primary uppercase tracking-[0.3em] text-center pb-2 sm:pb-3">B Mode</div>
                        <div className="text-[9px] sm:text-[10px] md:text-xs font-black text-medical-primary uppercase tracking-[0.3em] text-center pb-2 sm:pb-3">Color</div>
                      </>
                    )}
                    {section.layout === 'clinical-table'
                      ? section.fields.filter(isFieldVisible).map((field, fIdx) => {
                        if (fIdx % 2 !== 0) return null;
                        const bModeField = field;
                        const colorField = section.fields[fIdx + 1];
                        const isConditional = !!bModeField.conditional;

                        return (
                          <div key={`pair-${bModeField.id}`} className="contents">
                            <div className={cn(
                              "flex items-center py-2 sm:py-2.5",
                              isConditional && 'pl-2 sm:pl-3 border-l border-medical-primary/20'
                            )}>
                              <span className="text-xs sm:text-sm md:text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.06em] whitespace-nowrap leading-tight pr-2">
                                {bModeField.label}
                              </span>
                            </div>
                            <div className="py-1">
                              <FieldRenderer field={{ ...bModeField, label: '' }} sectionId={section.id} hideIcon={true} readOnly={isReadOnlyData} />
                            </div>
                            {colorField && (
                              <div className="py-1">
                                <FieldRenderer field={{ ...colorField, label: '' }} sectionId={section.id} hideIcon={true} readOnly={isReadOnlyData} />
                              </div>
                            )}
                          </div>
                        );
                      })
                      : section.fields.filter(isFieldVisible).map((field, fIdx) => {
                        const isConditional = !!field.conditional;
                        // const isFullWidth = field.type === 'dynamic-table' || field.type === 'grid-matrix' || field.type === 'textarea' || field.type === 'doppler-matrix' || field.type === 'biometry-matrix' || field.type === 'checkbox-group';
                        // // const isFullWidth =  field.type === 'checkbox-group';
                        // return (
                        //   <div key={field.id} className={cn(
                        //     "transition-all duration-300",
                        //     isConditional && 'pl-3 sm:pl-4 md:pl-6 border-l border-slate-300 ml-2 sm:ml-4 mb-1',
                        //     // isFullWidth ? 'col-span-full w-full' : 'h-full'
                        //     isFullWidth ? '' : 'h-full'
                        //   )}>
                        //     <FieldRenderer field={field} sectionId={section.id} readOnly={isReadOnlyData} />
                        //   </div>
                        // );
                        // Define full-width types clearly
                        const FULL_WIDTH_TYPES = [
                          'dynamic-table',
                          'grid-matrix',
                          'doppler-matrix',
                          'biometry-matrix',
                          'nab-matrix',
                          'textarea',
                          'early-pregnancy-matrix',
                          'checkbox-group'
                        ];

                        const isFullWidth = FULL_WIDTH_TYPES.includes(field.type);

                        return (
                          <div
                            key={field.id}
                            className={cn(
                              "transition-all duration-300",
                              isConditional && 'pl-3 sm:pl-4 md:pl-6 border-l border-slate-300 ml-2 sm:ml-4 mb-1',
                              isFullWidth ? 'col-span-full w-full' : 'h-full'
                            )}
                          >
                            <FieldRenderer
                              field={field}
                              sectionId={section.id}
                              readOnly={isReadOnlyData}
                              canDeleteField={!isLocked}
                            />
                          </div>
                        );
                      })
                    }

                    {section.fields.length === 0 && (
                      <div className="col-span-full py-8 sm:py-10 md:py-14 border border-dashed border-slate-200 dark:border-white/5 rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-slate-500 bg-white/70 dark:bg-white/[0.01] group/empty hover:border-slate-300 transition-colors">
                        <Layers size={40} className="sm:w-12 sm:h-12 mb-2 sm:mb-4 opacity-10 group-hover/empty:opacity-30 transition-opacity" />
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] opacity-30">Drop Schema Components Here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {!isLocked && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => addSection({ id: Math.random().toString(36).substr(2, 9), title: 'New Structural Section', fields: [] })}
          className="w-full py-6 sm:py-8 md:py-10 lg:py-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-lg sm:rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-all group shadow-sm mt-6 sm:mt-8 md:mt-10"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <Plus size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.24em]">Add New Section</span>
        </motion.button>
      )}
    </div>
  );
};

export default Canvas;













