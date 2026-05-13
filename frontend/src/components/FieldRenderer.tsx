import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  AlertCircle,
  ChevronDown,
  UploadCloud,
  PlayCircle,
  Crosshair,
  Eye,
  Check,
  Plus,
  Columns,
  X
} from 'lucide-react';
import { TemplateField } from '../types';
import { useStore } from '../store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NabCell = ({ 
  cellId, 
  val, 
  readOnly, 
  onChange 
}: { 
  cellId: string; 
  val: string;
  readOnly?: boolean;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isAB = val === 'AB';
  
  if (readOnly) {
    return (
      <span className={cn(
        'inline-flex items-center justify-center w-full h-full px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider',
        isAB ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      )}>{val}</span>
    );
  }

  return (
    <div className="relative flex items-center justify-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX + rect.width / 2
            });
          }
          setOpen(p => !p);
        }}
        className={cn(
          'w-full px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-all',
          isAB
            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
        )}
      >{val}</button>
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9999]" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div 
            className="absolute z-[10000] -translate-x-1/2 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden flex flex-col min-w-[72px]"
            style={{ top: coords.top, left: coords.left }}
          >
            {['N', 'AB'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={(e) => { 
                  e.stopPropagation();
                  onChange(opt); 
                  setOpen(false); 
                }}
                className={cn(
                  'px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all text-left hover:opacity-80',
                  opt === 'AB' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                )}
              >{opt}</button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};


interface FieldRendererProps {
  field: TemplateField;
  sectionId: string;
  readOnly?: boolean;
  canDeleteField?: boolean;
  hideIcon?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, sectionId, readOnly = false, canDeleteField = false, hideIcon = false }) => {
  const { selectedFieldId, setSelectedField, removeField, formValues, setFieldValue } = useStore();
  const isSelected = selectedFieldId === field.id;

  const renderInput = () => {
    const value = formValues[field.id] || '';

    switch (field.type) {
      // case 'text':
      //   return (
      //     <input
      //       type="text"
      //       value={value}
      //       onChange={(e) => setFieldValue(field.id, e.target.value)}
      //       placeholder={field.placeholder || "Enter text..."}
      //       // className="w-full bg-white dark:bg-slate-950/40 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm md:text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/15 focus:border-medical-primary/40 transition-all duration-200"
      //       className="w-full bg-white dark:bg-slate-950/40 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm md:text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/15 focus:border-medical-primary/40 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
      //     />
      //   );
      case 'text':
        return (
          <textarea
            readOnly={readOnly}
            value={value}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder={field.placeholder || "Enter text..."}
            rows={1}
            className="w-full bg-white dark:bg-slate-950/40 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm md:text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/15 focus:border-medical-primary/40 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none min-h-[48px] break-words whitespace-pre-wrap overflow-hidden"
          />
        );
      case 'textarea':
        return (
          <textarea
            readOnly={readOnly}
            value={value}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder={field.placeholder || "Enter medical notes..."}
            rows={typeof field.rows === 'number' ? field.rows : 1}
            className="w-full bg-white dark:bg-slate-950/40 border border-slate-300/80 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm md:text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/15 focus:border-medical-primary/40 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none min-h-[48px] break-words whitespace-pre-wrap"
          />
        );
      case 'dropdown':
        return (
          <div className="relative group/select">
            <select 
              disabled={readOnly}
              value={value}
              onChange={(e) => setFieldValue(field.id, e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm md:text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/15 focus:border-medical-primary/40 appearance-none cursor-pointer disabled:cursor-default"
            >
              <option value="" disabled className="text-slate-400 bg-white dark:bg-[#030712]">{field.placeholder || "Select an option..."}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-[#030712] dark:text-white">{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none group-focus-within/select:text-medical-primary transition-colors" />
          </div>
        );
      case 'file':
        return (
          <div className="w-full border border-dashed border-slate-300 dark:border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 bg-slate-50/80 dark:bg-white/[0.02] hover:bg-medical-primary/5 hover:border-medical-primary/25 transition-all cursor-pointer">
            <input type="file" className="hidden" id={`file-${field.id}`} />
            <label htmlFor={`file-${field.id}`} className="flex flex-col items-center gap-2 cursor-pointer w-full">
              <UploadCloud size={22} className="text-medical-primary opacity-60" />
              <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase font-semibold tracking-[0.12em]">Click to upload scan image</span>
            </label>
          </div>
        );
      case 'video':
        return (
          <div className="w-full border border-dashed border-slate-300 dark:border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-2 bg-slate-50/80 dark:bg-white/[0.02] hover:bg-rose-500/5 hover:border-rose-500/25 transition-all cursor-pointer">
            <PlayCircle size={22} className="text-rose-500 opacity-60" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase font-semibold tracking-[0.12em]">Dynamic video capture ready</span>
          </div>
        );
      case 'region-selector':
        return (
          <div className="w-full glass aspect-video rounded-xl flex items-center justify-center relative overflow-hidden group/region cursor-crosshair border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/20">
            <div className="absolute inset-0 bg-medical-primary/5 opacity-40 transition-opacity group-hover/region:opacity-60" />
            <div className="relative flex flex-col items-center gap-2 transition-transform group-hover/region:scale-110">
               <Crosshair size={28} className="text-medical-primary animate-pulse" />
               <span className="text-[11px] font-semibold text-medical-primary uppercase tracking-[0.14em]">Select Region</span>
            </div>
          </div>
        );
      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              readOnly={readOnly}
              value={value}
              onChange={(e) => setFieldValue(field.id, e.target.value)}
              placeholder="0.00"
              className="w-full bg-white dark:bg-slate-950/40 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm md:text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/15 focus:border-medical-primary/40 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold opacity-60 text-slate-600 dark:text-slate-400 pointer-events-none">NUM</span>
          </div>
        );
      case 'checkbox': {
        const isChecked = !!formValues[field.id];
        return (
          <label className="flex items-center gap-3 p-1 cursor-pointer group/check">
            <div className="relative">
              <input 
                type="checkbox" 
                disabled={readOnly}
                checked={isChecked}
                onChange={() => setFieldValue(field.id, !isChecked)}
                className="sr-only" 
              />
              <div className={cn(
                "w-5 h-5 rounded-md border transition-all flex items-center justify-center shadow-sm",
                isChecked 
                  ? "bg-medical-primary border-medical-primary shadow-neon-glow" 
                  : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 group-hover/check:border-medical-primary/50"
              )}>
                <Check className={cn(
                   "w-3.5 h-3.5 transition-transform stroke-[4px]",
                   isChecked ? "text-white scale-100" : "text-transparent scale-0"
                )} />
              </div>
            </div>
            <span className="text-sm md:text-[15px] text-slate-800 dark:text-slate-100 group-hover/check:text-slate-900 dark:group-hover/check:text-white transition-colors uppercase font-semibold tracking-[0.06em]">
              {field.label}
            </span>
          </label>
        );
      }
      case 'date':
        return (
          <input
            type="date"
            readOnly={readOnly}
            value={value}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            className="w-full bg-white dark:bg-slate-950/40 border border-slate-300/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm md:text-[15px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/15 focus:border-medical-primary/40 transition-all duration-200"
          />
        );
      case 'checkbox-group':
        return (
          <div className="flex flex-wrap gap-x-5 gap-y-3 min-h-[44px] items-center">
            {field.options?.map(opt => {
              const groupValue = formValues[field.id] || [];
              const isChecked = groupValue.includes(opt.value);
              return (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group/check">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      disabled={readOnly}
                      checked={isChecked}
                      onChange={() => {
                        const newValue = isChecked 
                          ? groupValue.filter((v: string) => v !== opt.value)
                          : [...groupValue, opt.value];
                        setFieldValue(field.id, newValue);
                      }}
                      className="sr-only" 
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-md border transition-all flex items-center justify-center shadow-sm",
                      isChecked 
                        ? "bg-medical-primary border-medical-primary shadow-neon-glow" 
                        : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 group-hover/check:border-medical-primary/50"
                    )}>
                      <Check className={cn(
                         "w-3.5 h-3.5 transition-transform stroke-[4px]",
                         isChecked ? "text-white scale-100" : "text-transparent scale-0"
                      )} />
                    </div>
                  </div>
                  <span className="text-sm md:text-[15px] font-semibold text-slate-800 dark:text-slate-100 group-hover/check:text-slate-900 dark:group-hover/check:text-white transition-colors uppercase tracking-[0.06em]">
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        );
      case 'radio':
        return (
          <div className="flex flex-wrap gap-6 min-h-[44px] items-center">
            {field.options?.map(opt => {
              const isChecked = value === opt.value;
              return (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group/radio">
                  <div className="relative">
                    <input 
                      type="radio" 
                      disabled={readOnly}
                      name={field.id} 
                      value={opt.value} 
                      checked={isChecked}
                      onChange={(e) => setFieldValue(field.id, e.target.value)}
                      className="sr-only" 
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-md border transition-all flex items-center justify-center shadow-sm",
                      isChecked 
                        ? "bg-medical-primary border-medical-primary shadow-neon-glow" 
                        : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 group-hover/radio:border-medical-primary/50"
                    )}>
                      <Check className={cn(
                         "w-3.5 h-3.5 transition-transform stroke-[4px]",
                         isChecked ? "text-white scale-100" : "text-transparent scale-0"
                      )} />
                    </div>
                  </div>
                  <span className="text-sm md:text-[15px] font-semibold text-slate-800 dark:text-slate-100 group-hover/radio:text-slate-900 dark:group-hover/radio:text-white transition-colors uppercase tracking-[0.06em]">
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        );
      case 'dynamic-table': {
        const tableType = field.tableType || 'general';
        const headers = field.columns || ['Date', 'Fetus', 'G.Sac', 'CRL', 'BPD', 'HC', 'AC', 'FL'];
        
        // Initial row setup based on type
        let defaultRows: any[] = [{ id: Date.now() }];
        if (tableType === 'partner') {
          defaultRows = [
            { id: 'mother', partner: 'Mother' },
            { id: 'father', partner: 'Father' }
          ];
        } else if (tableType === 'pregnancy') {
          defaultRows = [
            { id: 1, pregnancy: '1' }
          ];
        } else if (tableType === 'investigations') {
          defaultRows = [
            { id: 1, test_marker: 'X-Ray' },
            { id: 2, test_marker: 'CT Scan / MRI' },
            { id: 3, test_marker: 'Mammogram' },
            { id: 4, test_marker: 'Blood Sugar / GTT' },
            { id: 5, test_marker: 'HBSAg' },
            { id: 6, test_marker: 'HIV' },
            { id: 7, test_marker: 'VDRL' },
            { id: 8, test_marker: 'TST' },
            { id: 9, test_marker: 'Karyotyping' },
            { id: 10, test_marker: 'Others' }
          ];
        }

        const rows = (formValues[field.id] || defaultRows) as any[];

        return (
          <div 
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/20 shadow-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/10">
                    {headers.map(col => (
                      <th key={col} className="px-4 py-3 text-[11px] md:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-[0.14em]">{col}</th>
                    ))}
                    {tableType !== 'partner' && (
                      <th className="px-4 py-3 text-[11px] md:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-[0.14em] text-center w-16">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {rows.map((row, rIdx) => (
                    <tr key={row.id || rIdx} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                      {headers.map((col, cIdx) => {
                        const cellKey = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        const isFirstCol = cIdx === 0;
                        
                        // Special handling for Yes/No checkboxes in Investigations
                        if (tableType === 'investigations' && (cellKey === 'yes' || cellKey === 'no')) {
                          const isYes = cellKey === 'yes';
                          const isSelected = row[cellKey] === true;
                          
                          return (
                            <td key={col} className="px-1 py-1 text-center w-16">
                                <button 
                                  disabled={readOnly}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newRows = [...rows];
                                    if (isYes) {
                                      newRows[rIdx] = { ...row, yes: !isSelected, no: false };
                                    } else {
                                      newRows[rIdx] = { ...row, no: !isSelected, yes: false };
                                    }
                                    setFieldValue(field.id, newRows);
                                  }}
                                  className={cn(
                                    "w-6 h-6 rounded-md border mx-auto transition-all flex items-center justify-center",
                                    isSelected 
                                      ? "bg-medical-primary border-medical-primary shadow-neon-glow" 
                                      : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 hover:border-medical-primary",
                                    readOnly && "cursor-default"
                                  )}
                                >
                                {isSelected && <Check className="text-white w-4 h-4 stroke-[4px]" />}
                              </button>
                            </td>
                          );
                        }

                        // Special handling for the first column labels in fixed tables
                        if (isFirstCol && (tableType === 'partner' || tableType === 'pregnancy' || tableType === 'investigations')) {
                          return (
                            <td key={col} className="px-4 py-3 bg-slate-50/30 dark:bg-white/[0.01]">
                                 <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-[0.04em]">
                                {row[cellKey] || row[col.toLowerCase()] || ''}
                               </span>
                            </td>
                          );
                        }

                        return (
                          <td key={col} className="px-1 py-1 align-top">
                            <textarea 
                              rows={1}
                              readOnly={readOnly}
                              placeholder="---"
                              value={row[cellKey] || ''}
                              onClick={(e) => e.stopPropagation()}
                              onInput={(e: any) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              onChange={(e) => {
                                const newRows = [...rows];
                                newRows[rIdx] = { ...row, [cellKey]: e.target.value };
                                setFieldValue(field.id, newRows);
                              }}
                              className="w-full bg-slate-100/30 dark:bg-white/[0.02] border-none rounded-lg p-2.5 text-sm md:text-base lg:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-medical-primary/40 outline-none transition-all text-center placeholder:opacity-25 resize-none min-h-[42px] custom-scrollbar break-words whitespace-pre-wrap"
                            />
                          </td>
                        );
                      })}
                      {tableType !== 'partner' && (
                        <td className="px-2 py-2 text-center w-16">
                          {!readOnly && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newRows = rows.filter((_, i) => i !== rIdx);
                                setFieldValue(field.id, newRows);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tableType !== 'partner' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const newRowBody: any = { id: Date.now() };
                  if (tableType === 'pregnancy') {
                    newRowBody.pregnancy = (rows.length + 1).toString();
                  }
                  setFieldValue(field.id, [...rows, newRowBody]);
                }}
                className="w-full py-2.5 bg-slate-50/80 dark:bg-white/[0.02] hover:bg-medical-primary/10 text-[11px] md:text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-medical-primary uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all border-t border-slate-200 dark:border-white/10"
              >
                {!readOnly && (
                  <>
                    <Plus size={14} /> Add Row
                  </>
                )}
                {readOnly && <span className="opacity-40">View Only</span>}
              </button>
            )}
          </div>
        );
      }
      case 'grid-matrix': {
        const headers = field.columns || ['Header 1', 'Header 2'];
        const rows = (formValues[field.id] || [{ id: Date.now() }]) as any[];
        const { updateField } = useStore.getState();

        return (
          <div 
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/20 shadow-sm overflow-hidden group/grid"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-white/[0.05] border-b border-slate-200 dark:border-white/10">
                    {headers.map((col, cIdx) => (
                      <th key={cIdx} className="px-4 py-3 relative group/header">
                        <input 
                          type="text"
                          value={col}
                          onChange={(e) => {
                            const newHeaders = [...headers];
                            newHeaders[cIdx] = e.target.value;
                            updateField(sectionId, field.id, { columns: newHeaders });
                          }}
                          className="bg-transparent border-none text-[11px] md:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-[0.14em] w-full focus:ring-0 outline-none hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 transition-all"
                        />
                        {headers.length > 1 && (
                          <button 
                            onClick={() => {
                              const newHeaders = headers.filter((_, i) => i !== cIdx);
                              updateField(sectionId, field.id, { columns: newHeaders });
                            }}
                            className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover/header:opacity-100 transition-all scale-75"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </th>
                    ))}
                    <th className="w-12 px-2 text-center border-l border-slate-200 dark:border-white/10">
                      <button 
                        onClick={() => {
                          const newHeaders = [...headers, `Header ${headers.length + 1}`];
                          updateField(sectionId, field.id, { columns: newHeaders });
                        }}
                        className="p-1.5 rounded-lg bg-medical-primary/10 text-medical-primary hover:bg-medical-primary hover:text-white transition-all shadow-sm"
                        title="Add Column"
                      >
                        <Columns size={12} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {rows.map((row, rIdx) => (
                    <tr key={row.id || rIdx} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group/row">
                      {headers.map((col, cIdx) => {
                        const cellKey = `col_${cIdx}`;
                        return (
                          <td key={cIdx} className="px-1 py-1 align-top">
                            <textarea 
                              rows={1}
                              readOnly={readOnly}
                              placeholder="..."
                              value={row[cellKey] || ''}
                              onInput={(e: any) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              onChange={(e) => {
                                const newRows = [...rows];
                                newRows[rIdx] = { ...row, [cellKey]: e.target.value };
                                setFieldValue(field.id, newRows);
                              }}
                              className="w-full bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-lg p-2.5 text-sm md:text-[15px] font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary/30 outline-none transition-all text-center resize-none min-h-[42px] custom-scrollbar whitespace-pre-wrap"
                            />
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center w-12 border-l border-slate-200 dark:border-white/10">
                        <button 
                          onClick={() => {
                            const newRows = rows.filter((_, i) => i !== rIdx);
                            setFieldValue(field.id, newRows);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover/row:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!readOnly && (
              <button 
                onClick={() => {
                  setFieldValue(field.id, [...rows, { id: Date.now() }]);
                }}
                className="w-full py-2.5 bg-slate-50/80 dark:bg-white/[0.02] hover:bg-medical-primary/10 text-[11px] md:text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-medical-primary uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all border-t border-slate-200 dark:border-white/10"
              >
                <Plus size={14} /> Add Row
              </button>
            )}
          </div>
        );
      }
      case 'early-pregnancy-matrix': {
        const rawQty = formValues['ep_fetus_qty'];
        const fetusQty = Math.max(1, Math.min(12, parseInt(String(rawQty || '1'))));
        const params = [
          { id: 'gs', label: 'Gestational Sac', placeholder: 'Size / Position...' },
          { id: 'ys', label: 'Yolk Sac', placeholder: 'Appearance...' },
          { id: 'crl', label: 'CRL', placeholder: 'Measurement...' },
          { id: 'hr', label: 'Heart Rate', placeholder: 'FH/rate...' },
          { id: 'lt_ov', label: 'Lt. Ovary', placeholder: 'Position...' },
          { id: 'rt_ov', label: 'Rt. Ovary', placeholder: 'Position...' }
        ];

        return (
          <div className="w-full rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-slate-950/20 shadow-sm border-dashed">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="bg-medical-primary text-white">
                    <th className="px-5 py-4 text-[11px] md:text-xs font-semibold uppercase tracking-[0.14em] border-r border-white/10">Early Pregnancy Parameters</th>
                    {Array.from({ length: fetusQty }).map((_, i) => (
                      <th key={i} className={cn(
                        "px-4 py-3 text-[11px] md:text-xs font-semibold uppercase text-center border-l border-white/10 bg-black/10",
                        i === 0 ? "text-white" : "text-white/70"
                      )}>
                        Fetus {String.fromCharCode(65 + i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {params.map((p, pIdx) => (
                    <tr key={p.id} className={cn("hover:bg-medical-primary/5 transition-colors", pIdx % 2 === 0 ? "bg-transparent" : "bg-slate-50/50 dark:bg-white/[0.01]")}>
                      <td className="px-5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-white/5 uppercase tracking-[0.04em]">{p.label}</td>
                      {Array.from({ length: fetusQty }).map((_, i) => {
                        const cellId = `${p.id}_f${i}`;
                        return (
                          <td key={i} className="px-1 py-1 border-l border-slate-200 dark:border-white/5">
                            <input 
                              type="text"
                              readOnly={readOnly}
                              placeholder={p.placeholder}
                              value={formValues[cellId] || ''}
                              onChange={(e) => setFieldValue(cellId, e.target.value)}
                              className="w-full bg-white/50 dark:bg-slate-900/40 border-none text-center text-sm md:text-base lg:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-medical-primary/30 rounded-lg transition-all py-2.5 placeholder:opacity-25"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      case 'doppler-matrix': {
        const rawQty = formValues['ep_fetus_qty'];
        const fetusQty = Math.max(1, Math.min(12, parseInt(String(rawQty || '1'))));
        const vessels = field.vessels || ['Rt. Uterine', 'Lt. Uterine', 'Umbilical', 'MCA', 'DV'];
        const metrics = ['Syst', 'Diast', 'R.I.'];
        
        return (
          <div className="w-full rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-slate-950/20 shadow-sm border-dashed">
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-full">
                  <thead>
                    <tr className="bg-slate-950 text-white">
                      <th className="px-5 py-4 text-[11px] md:text-xs font-semibold uppercase tracking-[0.14em] border-r border-white/10">Vessel Matrix</th>
                      {Array.from({ length: fetusQty }).map((_, i) => (
                        <th key={i} colSpan={3} className={cn(
                          "px-4 py-3 text-[11px] md:text-xs font-semibold uppercase text-center border-l border-white/10 bg-slate-900/90",
                          i === 0 ? "text-medical-neon" : "text-white/70"
                        )}>
                          Fetus {String.fromCharCode(65 + i)}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/5">
                      <th className="px-4 py-2 border-r border-slate-200 dark:border-white/5"></th>
                      {Array.from({ length: fetusQty }).map((_, i) => (
                        <React.Fragment key={i}>
                          {metrics.map(m => (
                            <th key={m} className="px-2 py-2 text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase text-center border-l first:border-l-0 border-slate-200 dark:border-white/5">{m}</th>
                          ))}
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {vessels.map((v, vIdx) => (
                       <tr key={v} className={cn("hover:bg-medical-primary/5 transition-colors", vIdx % 2 === 0 ? "bg-transparent" : "bg-slate-50/50 dark:bg-white/[0.01]")}>
                          <td className="px-5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-white/5 uppercase tracking-[0.04em]">{v}</td>
                          {Array.from({ length: fetusQty }).map((_, i) => (
                            <React.Fragment key={i}>
                              {metrics.map(m => {
                                const cellId = `${field.id}_${v.toLowerCase().replace(/[^a-z0-9]/g, '')}_f${i}_${m.toLowerCase()}`;
                                return (
                                  <td key={m} className="px-1 py-1 border-r border-slate-200 dark:border-white/5">
                                    <input 
                                      type="text"
                                      readOnly={readOnly}
                                      placeholder="---"
                                      value={formValues[cellId] || ''}
                                      onChange={(e) => setFieldValue(cellId, e.target.value)}
                                      className="w-full bg-white/50 dark:bg-slate-900/40 border-none text-center text-sm md:text-base lg:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-medical-primary/30 rounded-lg transition-all py-2.5 placeholder:opacity-25"
                                    />
                                  </td>
                                );
                              })}
                            </React.Fragment>
                          ))}
                       </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        );
      }
      case 'biometry-matrix': {
        const rawQty = formValues['ep_fetus_qty'];
        const fetusQty = Math.max(1, Math.min(12, parseInt(String(rawQty || '1'))));
        const variables = field.variables || ['BPD (cm)', 'OFD (cm)', 'HC (cm)', 'AC (cm)', 'TBD 1', 'TBD 2', 'TCD', 'Foot', 'Heart', 'FM'];
        
        // 1-3 fetuses: split vertically into two columns of parameters
        if (fetusQty < 4) {
          const paramRows: string[][] = [];
          for (let i = 0; i < variables.length; i += 2) {
            paramRows.push(variables.slice(i, i + 2));
          }

          const paramWidth = fetusQty === 1 ? 'w-[35%]' : fetusQty === 2 ? 'w-[26%]' : 'w-[20%]';
          const fetusWidth = fetusQty === 1 ? 'w-[15%]' : fetusQty === 2 ? 'w-[12%]' : 'w-[10%]';

          return (
            <div className="w-full rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-slate-950/20 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-medical-primary text-white">
                      <th className={cn(paramWidth, "px-2 py-2 text-[9px] font-semibold uppercase tracking-wider border-r border-white/10")}>Parameter</th>
                      {Array.from({ length: fetusQty }).map((_, i) => (
                        <th key={`l-f${i}`} className={cn(fetusWidth, "px-0.5 py-2 text-[8px] font-semibold uppercase text-center border-r border-white/10 last:border-r-0 bg-white/10")}>
                          F{String.fromCharCode(65 + i)}
                        </th>
                      ))}
                      <th className={cn(paramWidth, "px-2 py-2 text-[9px] font-semibold uppercase tracking-wider border-r border-white/10 border-l-2 border-l-medical-primary/30")}>Parameter</th>
                      {Array.from({ length: fetusQty }).map((_, i) => (
                        <th key={`r-f${i}`} className={cn(fetusWidth, "px-0.5 py-2 text-[8px] font-semibold uppercase text-center border-r border-white/10 last:border-r-0 bg-white/10")}>
                          F{String.fromCharCode(65 + i)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {paramRows.map((row, idx) => (
                      <tr key={idx} className={cn(idx % 2 !== 0 ? "bg-slate-50/50 dark:bg-white/[0.01]" : "bg-transparent")}>
                        {row.map((param, colIdx) => (
                          <React.Fragment key={param}>
                            <td className={cn(
                              "px-2 py-1.5 text-[9px] font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/5 uppercase leading-tight",
                              colIdx === 1 && "border-l-2 border-l-medical-primary/30"
                            )}>
                              {param}
                            </td>
                            {Array.from({ length: fetusQty }).map((_, i) => {
                              const cellId = `${field.id}_${param.toLowerCase().replace(/[^a-z0-9]/g, '')}_f${i}`;
                              return (
                                <td key={`f${i}`} className="px-0.5 py-0.5 border-r border-slate-200 dark:border-white/5 text-center last:border-r-0">
                                  <input 
                                    type="text"
                                    readOnly={readOnly}
                                    placeholder="--"
                                    value={formValues[cellId] || ''}
                                    onChange={(e) => setFieldValue(cellId, e.target.value)}
                                    className="w-full bg-white/50 dark:bg-slate-900/40 border-none text-center text-[10px] md:text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-medical-primary/30 rounded-md py-1 placeholder:opacity-20 transition-all"
                                  />
                                </td>
                              );
                            })}
                          </React.Fragment>
                        ))}
                        {row.length === 1 && (
                          <>
                            <td className="px-2 py-1.5 border-r border-slate-200 dark:border-white/5 border-l-2 border-l-medical-primary/30"></td>
                            {Array.from({ length: fetusQty }).map((_, i) => (
                              <td key={`empty-${i}`} className="px-0.5 py-0.5 border-r border-slate-200 dark:border-white/5 last:border-r-0"></td>
                            ))}
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // 4+ fetuses standard wide table
        return (
          <div className="w-full rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-slate-950/20 shadow-sm">
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-full">
                  <thead>
                    <tr className="bg-medical-primary text-white dark:text-medical-dark">
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] border-r border-white/10">Growth Parameters</th>
                      {Array.from({ length: fetusQty }).map((_, i) => (
                        <th key={i} className={cn(
                          "px-2 py-2 text-[10px] font-semibold uppercase text-center border-l border-white/10",
                          i === 0 ? "bg-white/10" : "bg-black/10"
                        )}>
                          Fetus {String.fromCharCode(65 + i)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {variables.map((v, vIdx) => (
                       <tr key={v} className={cn("hover:bg-medical-primary/5 transition-colors", vIdx % 2 !== 0 ? "bg-slate-50/50 dark:bg-white/[0.01]" : "bg-transparent")}>
                          <td className="px-4 py-2 bg-slate-100/30 dark:bg-white/[0.01] text-[10px] font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/5 uppercase tracking-[0.04em]">{v}</td>
                          {Array.from({ length: fetusQty }).map((_, i) => {
                            const cellId = `${field.id}_${v.toLowerCase().replace(/[^a-z0-9]/g, '')}_f${i}`;
                            return (
                              <td key={i} className="px-1 py-1 border-r border-slate-200 dark:border-white/5">
                                <input 
                                  type="text"
                                  readOnly={readOnly}
                                  placeholder="--"
                                  value={formValues[cellId] || ''}
                                  onChange={(e) => setFieldValue(cellId, e.target.value)}
                                  className="w-full bg-white/50 dark:bg-slate-900/40 border-none text-center text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-medical-primary/30 rounded-lg transition-all py-2 placeholder:opacity-20"
                                />
                              </td>
                            );
                          })}
                       </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        );
      }
      case 'nab-matrix': {
        const rawQty = formValues['ep_fetus_qty'];
        const fetusQty = Math.max(1, Math.min(12, parseInt(String(rawQty || '1'))));
        const rows: string[] = Array.isArray(field.rows)
          ? field.rows as string[]
          : [
              'LV', '4 Chamber / OT', 'Spine', 'Face', 'Ear', 'Stomach',
              'Kidneys', 'Bladder', 'Limb Survey', 'Small Bowel', 'Large Bowel', 'PAMC'
            ];

        // 1-3 fetuses: split vertically into two columns of parameters
        if (fetusQty < 4) {
          const paramRows: string[][] = [];
          for (let i = 0; i < rows.length; i += 2) {
            paramRows.push(rows.slice(i, i + 2));
          }

          const paramWidth = fetusQty === 1 ? 'w-[35%]' : fetusQty === 2 ? 'w-[26%]' : 'w-[20%]';
          const fetusWidth = fetusQty === 1 ? 'w-[15%]' : fetusQty === 2 ? 'w-[12%]' : 'w-[10%]';

          return (
            <div className="w-full rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-slate-950/20 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-medical-primary text-white">
                      <th className={cn(paramWidth, "px-2 py-2 text-[9px] font-semibold uppercase tracking-wider border-r border-white/10")}>Parameter</th>
                      {Array.from({ length: fetusQty }).map((_, i) => (
                        <th key={`l-f${i}`} className={cn(fetusWidth, "px-0.5 py-2 text-[8px] font-semibold uppercase text-center border-r border-white/10 last:border-r-0 bg-white/10")}>
                          F{String.fromCharCode(65 + i)}
                        </th>
                      ))}
                      <th className={cn(paramWidth, "px-2 py-2 text-[9px] font-semibold uppercase tracking-wider border-r border-white/10 border-l-2 border-l-medical-primary/30")}>Parameter</th>
                      {Array.from({ length: fetusQty }).map((_, i) => (
                        <th key={`r-f${i}`} className={cn(fetusWidth, "px-0.5 py-2 text-[8px] font-semibold uppercase text-center border-r border-white/10 last:border-r-0 bg-white/10")}>
                          F{String.fromCharCode(65 + i)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {paramRows.map((row, idx) => (
                      <tr key={idx} className={cn(idx % 2 !== 0 ? "bg-slate-50/50 dark:bg-white/[0.01]" : "bg-transparent")}>
                        {row.map((param, colIdx) => (
                          <React.Fragment key={param}>
                            <td className={cn(
                              "px-2 py-1.5 text-[9px] font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/5 uppercase leading-tight",
                              colIdx === 1 && "border-l-2 border-l-medical-primary/30"
                            )}>
                              {param}
                            </td>
                            {Array.from({ length: fetusQty }).map((_, i) => {
                              const cellId = `${field.id}_${param.replace(/[^a-z0-9]/gi, '').toLowerCase()}_f${i}`;
                              return (
                                <td key={`f${i}`} className="px-0.5 py-1 border-r border-slate-200 dark:border-white/5 text-center last:border-r-0">
                                  <NabCell 
                                    cellId={cellId} 
                                    val={formValues[cellId] || 'N'} 
                                    readOnly={readOnly}
                                    onChange={(val) => setFieldValue(cellId, val)}
                                  />
                                </td>
                              );
                            })}
                          </React.Fragment>
                        ))}
                        {row.length === 1 && (
                          <>
                            <td className="px-2 py-1.5 border-r border-slate-200 dark:border-white/5 border-l-2 border-l-medical-primary/30"></td>
                            {Array.from({ length: fetusQty }).map((_, i) => (
                              <td key={`empty-${i}`} className="px-0.5 py-1 border-r border-slate-200 dark:border-white/5 last:border-r-0"></td>
                            ))}
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // 4+ fetuses: standard wide table
        return (
          <div className="w-full rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-slate-950/20 shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-medical-primary text-white">
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider border-r border-white/10">Parameter</th>
                    {Array.from({ length: fetusQty }).map((_, i) => (
                      <th key={`f${i}`} className="px-2 py-2 text-[10px] font-semibold uppercase text-center border-l border-white/10 bg-white/10">
                        Fetus {String.fromCharCode(65 + i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {rows.map((rowLabel, rowIdx) => (
                    <tr key={rowLabel} className={cn("hover:bg-medical-primary/5 transition-colors", rowIdx % 2 !== 0 ? "bg-slate-50/50 dark:bg-white/[0.01]" : "bg-transparent")}>
                      <td className="px-4 py-2 bg-slate-100/30 dark:bg-white/[0.01] text-[10px] font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/5 uppercase tracking-[0.04em]">{rowLabel}</td>
                      {Array.from({ length: fetusQty }).map((_, i) => {
                        const cellId = `${field.id}_${rowLabel.replace(/[^a-z0-9]/gi, '').toLowerCase()}_f${i}`;
                        return (
                          <td key={`f${i}`} className="px-2 py-1 border-r border-slate-200 dark:border-white/5 text-center">
                            <NabCell 
                              cellId={cellId} 
                              val={formValues[cellId] || 'N'} 
                              readOnly={readOnly}
                              onChange={(val) => setFieldValue(cellId, val)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      default:

        return <div className="p-3 bg-red-500/10 text-red-500 text-[10px] rounded-lg border border-red-500/20">Unsupported: {field.type}</div>;
    }
  };

  const isWideField = ['nab-matrix', 'biometry-matrix', 'doppler-matrix', 'early-pregnancy-matrix', 'ob23-biometry', 'ob23_nab_matrix', 'checkbox-group'].includes(field.type);

  return (
    <motion.div 
      layout
      className={cn(
        "relative group rounded-xl border transition-all duration-300",
        isWideField ? "p-1.5 md:p-2 flex flex-col gap-1.5" : "p-2 md:p-3 flex items-center gap-3",
        readOnly && "cursor-default",
        isSelected 
          ? "bg-medical-primary/[0.04] border-medical-primary shadow-lg ring-1 ring-medical-primary/20" 
          : "bg-white/50 dark:bg-slate-900/10 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.02]"
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (readOnly) {
          return;
        }
        setSelectedField(sectionId, field.id);
      }}
    >
      {isWideField ? (
        <>
          {/* Wide field: label + delete on top row, table below */}
          <div className="flex items-center justify-between px-1 min-h-[24px]">
            {field.label ? (
              <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.12em] leading-tight group-hover:text-medical-primary transition-colors">
                {field.label}
              </span>
            ) : <span />}
            <div className="flex items-center gap-1">
              {field.required && <span className="text-sm font-bold leading-none text-rose-500 dark:text-rose-400">*</span>}
              {!readOnly && canDeleteField && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(sectionId, field.id);
                  }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
          <div className="w-full">
            {renderInput()}
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            {field.label && (
              <div className="flex items-center justify-between mb-1.5 px-1 underline-offset-4 decoration-medical-primary/20">
                <span className="text-xs md:text-sm lg:text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.12em] leading-tight group-hover:text-medical-primary transition-colors">
                  {field.label}
                </span>
                {field.required ? (
                  <span className="text-sm font-bold leading-none text-rose-500 dark:text-rose-400">*</span>
                ) : null}
              </div>
            )}
            <div className="w-full">
              {renderInput()}
            </div>
          </div>

          {/* Action Column */}
          {!readOnly && canDeleteField && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeField(sectionId, field.id);
                }}
                className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default FieldRenderer;
