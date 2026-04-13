import React from 'react';
import { motion } from 'framer-motion';
import { 
  Type, 
  Trash2, 
  AlertCircle,
  ChevronDown,
  UploadCloud,
  PlayCircle,
  Crosshair,
  Eye,
  Hash,
  CheckSquare,
  Check,
  Plus
} from 'lucide-react';
import { TemplateField } from '../types';
import { useStore } from '../store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FieldRendererProps {
  field: TemplateField;
  sectionId: string;
  hideIcon?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, sectionId, hideIcon }) => {
  const { selectedFieldId, setSelectedField, removeField, formValues, setFieldValue } = useStore();
  const isSelected = selectedFieldId === field.id;

  const renderInput = () => {
    const value = formValues[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder || "Enter text..."}
            className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary/50 transition-all duration-300 placeholder:text-slate-500 dark:placeholder:text-slate-600"
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder={field.placeholder || "Enter medical notes..."}
            rows={field.rows || 1}
            className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-xl py-3 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary/50 transition-all duration-300 placeholder:text-slate-500 dark:placeholder:text-slate-600 resize-none min-h-[48px] break-words whitespace-pre-wrap"
          />
        );
      case 'dropdown':
        return (
          <div className="relative group/select">
            <select 
              value={value}
              onChange={(e) => setFieldValue(field.id, e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-medical-primary/50 appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-slate-400 bg-white dark:bg-[#030712]">{field.placeholder || "Select an option..."}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900 dark:bg-[#030712] dark:text-white">{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500 pointer-events-none group-focus-within/select:text-medical-primary transition-colors" />
          </div>
        );
      case 'file':
        return (
          <div className="w-full border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-white/[0.02] hover:bg-medical-primary/5 hover:border-medical-primary/30 transition-all cursor-pointer">
            <input type="file" className="hidden" id={`file-${field.id}`} />
            <label htmlFor={`file-${field.id}`} className="flex flex-col items-center gap-2 cursor-pointer w-full">
              <UploadCloud size={24} className="text-medical-primary opacity-50" />
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Click to upload scan image</span>
            </label>
          </div>
        );
      case 'video':
        return (
          <div className="w-full border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-white/[0.02] hover:bg-rose-500/5 hover:border-rose-500/30 transition-all cursor-pointer">
            <PlayCircle size={24} className="text-rose-500 opacity-50" />
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Dynamic video capture ready</span>
          </div>
        );
      case 'region-selector':
        return (
          <div className="w-full glass aspect-video rounded-lg flex items-center justify-center relative overflow-hidden group/region cursor-crosshair">
            <div className="absolute inset-0 bg-medical-primary/5 opacity-50 transition-opacity group-hover/region:opacity-70" />
            <div className="relative flex flex-col items-center gap-2 transition-transform group-hover/region:scale-110">
               <Crosshair size={32} className="text-medical-primary animate-pulse" />
               <span className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.2em]">Select Region</span>
            </div>
          </div>
        );
      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) => setFieldValue(field.id, e.target.value)}
              placeholder="0.00"
              className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:bg-slate-300/50 dark:focus:bg-slate-900/60 focus:border-medical-primary/50 transition-all duration-300 placeholder:text-slate-500 dark:placeholder:text-slate-600"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono opacity-30 text-slate-900 dark:text-white pointer-events-none">NUM</span>
          </div>
        );
      case 'checkbox': {
        const isChecked = !!formValues[field.id];
        return (
          <label className="flex items-center gap-3 p-1 cursor-pointer group/check">
            <div className="relative">
              <input 
                type="checkbox" 
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
            <span className="text-xs text-slate-700 dark:text-slate-400 group-hover/check:text-slate-900 dark:group-hover/check:text-white transition-colors uppercase font-bold tracking-tight">
              {field.label}
            </span>
          </label>
        );
      }
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            className="w-full bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:bg-slate-300/50 dark:focus:bg-slate-900/60 focus:border-medical-primary/50 transition-all duration-300"
          />
        );
      case 'checkbox-group':
        return (
          <div className="flex flex-wrap gap-x-6 gap-y-3 min-h-[44px] items-center">
            {field.options?.map(opt => {
              const groupValue = formValues[field.id] || [];
              const isChecked = groupValue.includes(opt.value);
              return (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group/check">
                  <div className="relative">
                    <input 
                      type="checkbox" 
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
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 group-hover/check:text-slate-900 dark:group-hover/check:text-white transition-colors uppercase tracking-tight">
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        );
      case 'radio':
        return (
          <div className="flex flex-wrap gap-8 min-h-[44px] items-center">
            {field.options?.map(opt => {
              const isChecked = value === opt.value;
              return (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group/radio">
                  <div className="relative">
                    <input 
                      type="radio" 
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
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 group-hover/radio:text-slate-900 dark:group-hover/radio:text-white transition-colors uppercase tracking-tight">
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
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/20 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10">
                    {headers.map(col => (
                      <th key={col} className="px-4 py-3 text-[10px] font-black text-medical-primary uppercase tracking-widest">{col}</th>
                    ))}
                    {tableType !== 'partner' && (
                      <th className="px-4 py-3 text-[10px] font-black text-medical-primary uppercase tracking-widest text-center w-16">Action</th>
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
                                    : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 hover:border-medical-primary"
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
                               <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                {row[cellKey] || row[col.toLowerCase()] || ''}
                               </span>
                            </td>
                          );
                        }

                        return (
                          <td key={col} className="px-1 py-1 align-top">
                            <textarea 
                              rows={1}
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
                              className="w-full bg-slate-100/30 dark:bg-white/[0.02] border-none rounded-lg p-2 text-[11px] text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-medical-primary/40 outline-none transition-all text-center placeholder:opacity-20 resize-none min-h-[38px] custom-scrollbar break-words whitespace-pre-wrap"
                            />
                          </td>
                        );
                      })}
                      {tableType !== 'partner' && (
                        <td className="px-2 py-2 text-center w-16">
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
                className="w-full py-3 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-medical-primary/10 text-[10px] font-bold text-slate-500 hover:text-medical-primary uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-t border-slate-200 dark:border-white/10"
              >
                <Plus size={14} /> Add Row
              </button>
            )}
          </div>
        );
      }
      default:
        return <div className="p-3 bg-red-500/10 text-red-500 text-[10px] rounded-lg border border-red-500/20">Unsupported: {field.type}</div>;
    }
  };

  return (
    <motion.div 
      layout
      className={cn(
        "relative group p-4 rounded-2xl flex items-center gap-4 border transition-all duration-300",
        isSelected 
          ? "bg-medical-primary/[0.04] border-medical-primary shadow-lg ring-1 ring-medical-primary/20" 
          : "bg-white/50 dark:bg-slate-900/10 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.02]"
      )}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedField(sectionId, field.id);
      }}
    >
      {!hideIcon && (
        <div className={cn(
          "p-3 rounded-xl shrink-0 transition-all duration-300 shadow-sm",
          isSelected 
            ? "bg-medical-primary text-white dark:text-medical-dark shadow-neon-glow" 
            : "bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-white/10"
        )}>
          {getTypeIcon(field.type)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {field.label && (
          <div className="flex items-center justify-between mb-1.5 px-1 underline-offset-4 decoration-medical-primary/20">
            <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider leading-tight group-hover:text-medical-primary transition-colors">
              {field.label}
            </span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
              {field.required ? 'REQUIRED' : 'OPTIONAL'}
            </span>
          </div>
        )}
        {renderInput()}
      </div>

      {/* Action Column */}
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
    </motion.div>
  );
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
    case 'textarea': return <Type size={14} />;
    case 'number': return <Hash size={14} />;
    case 'checkbox': return <CheckSquare size={14} />;
    case 'dropdown': return <ChevronDown size={14} />;
    case 'file': return <UploadCloud size={14} />;
    case 'video': return <PlayCircle size={14} />;
    case 'region-selector': return <Crosshair size={14} />;
    default: return <Type size={14} />;
  }
};

export default FieldRenderer;
