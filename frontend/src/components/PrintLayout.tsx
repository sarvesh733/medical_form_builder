import React from 'react';
import { useStore } from '../store';
import { Activity } from 'lucide-react';

const PrintLayout: React.FC = () => {
    const { activeTemplate, formValues } = useStore();

    const isFieldVisible = (field: any) => {
        if (!field.conditional) return true;
        const { fieldId, operator, value } = field.conditional;
        const targetValue = formValues[fieldId];

        if (operator === 'equals') return String(targetValue) === String(value);
        if (operator === 'not_equals') return String(targetValue) !== String(value);
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

    const formatDate = (dateStr: string) => {
        if (!dateStr || !dateStr.includes('-')) return dateStr;
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    if (!activeTemplate) return null;

    return (
        <div id="print-area" className="hidden print:block print:bg-white min-h-screen">
            <div className="w-full max-w-[210mm] mx-auto bg-white relative">
                {/* Header Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-primary via-medical-secondary to-medical-accent" />

                {/* Header section with Mediscan branding */}
                <div className="flex justify-between items-center mb-10 pt-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.2rem] bg-white flex items-center justify-center shadow-xl shrink-0 overflow-hidden border border-slate-100">
                            <img src="/logo.png" alt="Mediscan Logo" className="w-11 h-11 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-slate-950 uppercase leading-none">
                                MEDISCAN <span className="text-medical-primary">FORM BUILDER</span>
                            </h1>
                            <div className="h-1 w-10 bg-medical-primary mt-2 rounded-full" />
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-[11px] font-black text-medical-primary uppercase tracking-widest italic">{activeTemplate.name}</div>
                    </div>
                </div>

                <div className="h-px w-full bg-slate-100 mb-10" />

                <div className="space-y-8">
                    {activeTemplate.sections.map((section) => {
                        const visibleFields = section.fields.filter(isFieldVisible);
                        if (visibleFields.length === 0) return null;

                        return (
                            <div key={section.id} className="break-inside-avoid">
                                {/* Professional Section Header */}
                                <div className="border-t-2 border-slate-950 pt-2 mb-2 flex items-center justify-between">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">{section.title}</h3>
                                    <div className="text-[9px] font-mono text-slate-400">REF_{section.id.substring(0, 4).toUpperCase()}</div>
                                </div>

                                {/* Doppler Matrix Layout */}
                                {section.layout === 'clinical-table-doppler' ? (
                                    <div className="border-[1.5px] border-slate-200 overflow-hidden">
                                        <table className="w-full text-left border-collapse table-fixed divide-y divide-slate-200 text-slate-900 border-b border-slate-200">
                                            <thead>
                                                <tr className="bg-slate-950 text-white">
                                                    <th rowSpan={2} className="w-[15%] px-3 py-2 text-[8px] font-black uppercase tracking-tight border-r border-slate-700">Vessel</th>
                                                    <th colSpan={3} className="px-3 py-1 text-[8px] font-black uppercase tracking-widest text-center border-r border-slate-700 bg-slate-900">Fetus A</th>
                                                    {formValues['ep_fetus_qty'] > 1 && (
                                                        <th colSpan={3} className="px-3 py-1 text-[8px] font-black uppercase tracking-widest text-center bg-slate-800">Fetus B</th>
                                                    )}
                                                </tr>
                                                <tr className="bg-slate-100 text-slate-600 border-t border-slate-200">
                                                    <th className="px-2 py-1 text-[7px] font-black uppercase text-center border-r border-slate-300">Syst</th>
                                                    <th className="px-2 py-1 text-[7px] font-black uppercase text-center border-r border-slate-300">Diast</th>
                                                    <th className="px-2 py-1 text-[7px] font-black uppercase text-center border-r border-slate-400">R.I.</th>
                                                    {formValues['ep_fetus_qty'] > 1 && (
                                                        <>
                                                            <th className="px-2 py-1 text-[7px] font-black uppercase text-center border-r border-slate-300">Syst</th>
                                                            <th className="px-2 py-1 text-[7px] font-black uppercase text-center border-r border-slate-300">Diast</th>
                                                            <th className="px-2 py-1 text-[7px] font-black uppercase text-center">R.I.</th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {section.fields.reduce((acc, curr, idx, arr) => {
                                                    // Group fields by 6 (since each row has 6 slots in schema)
                                                    if (idx % 6 === 0) {
                                                        acc.push(arr.slice(idx, idx + 6));
                                                    }
                                                    return acc;
                                                }, [] as any[][]).map((rowFields, rIdx) => (
                                                    <tr key={rIdx} className={rIdx % 2 !== 0 ? 'bg-slate-50/20' : ''}>
                                                        <td className="px-3 py-2 bg-slate-50/80 border-r border-slate-200 text-[8px] font-black text-slate-600 uppercase tracking-tight">
                                                            {rowFields[0].label}
                                                        </td>
                                                        <td className="px-2 py-2 border-r border-slate-200 text-[9px] font-bold text-slate-950 text-center">{formValues[rowFields[0].id] || '---'}</td>
                                                        <td className="px-2 py-2 border-r border-slate-200 text-[9px] font-bold text-slate-950 text-center">{formValues[rowFields[1].id] || '---'}</td>
                                                        <td className="px-2 py-2 border-r border-slate-400 text-[9px] font-bold text-slate-950 text-center">{formValues[rowFields[2].id] || '---'}</td>
                                                        {formValues['ep_fetus_qty'] > 1 && (
                                                            <>
                                                                <td className="px-2 py-2 border-r border-slate-200 text-[9px] font-bold text-slate-950 text-center">{formValues[rowFields[3].id] || '---'}</td>
                                                                <td className="px-2 py-2 border-r border-slate-200 text-[9px] font-bold text-slate-950 text-center">{formValues[rowFields[4].id] || '---'}</td>
                                                                <td className="px-2 py-2 text-[9px] font-bold text-slate-950 text-center">{formValues[rowFields[5].id] || '---'}</td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : section.layout === 'clinical-table' ? (
                                    <div className="border-[1.5px] border-slate-200 overflow-hidden">
                                        <table className="w-full text-left border-collapse table-fixed divide-y divide-slate-200 text-slate-900">
                                            <thead>
                                                <tr className="bg-slate-950 text-white">
                                                    <th className="w-[30%] px-4 py-2 text-[9px] font-black uppercase tracking-widest border-r border-slate-700">Parameter</th>
                                                    <th className="w-[35%] px-4 py-2 text-[9px] font-black uppercase tracking-widest border-r border-slate-700">B Mode Assessment</th>
                                                    <th className="w-[35%] px-4 py-2 text-[9px] font-black uppercase tracking-widest leading-none">Color Doppler</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {/* We process fields in pairs for clinical tables */}
                                                {section.fields.reduce((acc, curr, idx, arr) => {
                                                    if (curr.label !== '') {
                                                        const companion = arr[idx + 1];
                                                        acc.push({ label: curr.label, bValue: formValues[curr.id], cValue: companion ? formValues[companion.id] : null });
                                                    }
                                                    return acc;
                                                }, [] as any[]).map((row: any, rIdx: number) => (
                                                    <tr key={rIdx} className={rIdx % 2 !== 0 ? 'bg-slate-50/20' : ''}>
                                                        <td className="px-4 py-2 bg-slate-50/80 border-r border-slate-200 text-[9px] font-black text-slate-600 uppercase tracking-tight">
                                                            {row.label}
                                                        </td>
                                                        <td className="px-4 py-2 border-r border-slate-200 text-[10px] font-bold text-slate-950 break-words whitespace-pre-wrap leading-tight">
                                                            {row.bValue || '---'}
                                                        </td>
                                                        <td className="px-4 py-2 text-[10px] font-bold text-slate-950 break-words whitespace-pre-wrap leading-tight">
                                                            {row.cValue || '---'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="border-[1.5px] border-slate-200 divide-y divide-slate-200">
                                        {visibleFields.map((field) => {
                                            const value = formValues[field.id];
                                            if (['dynamic-table', 'grid-matrix', 'doppler-matrix', 'biometry-matrix'].includes(field.type)) return null;

                                            let displayValue = Array.isArray(value)
                                                ? value.length > 0 ? value.join(', ') : '---'
                                                : value || '---';

                                            if (field.type === 'date' && value) {
                                                displayValue = formatDate(String(value));
                                            }

                                            return (
                                                <div key={field.id} className="flex min-h-[28px] divide-x divide-slate-200">
                                                    <div className="w-[35%] bg-slate-50/80 px-4 py-2 flex items-center shrink-0">
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">{field.label || 'Note'}</label>
                                                    </div>
                                                    <div className="flex-1 px-4 py-2 text-[11px] font-bold text-slate-950 break-all whitespace-pre-wrap flex items-center leading-relaxed">
                                                        {displayValue}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Integrated Tables (Dynamic) */}
                                {visibleFields.filter(f => f.type === 'dynamic-table').map(tableField => {
                                    const rows = (formValues[tableField.id] || []) as any[];
                                    const headers = tableField.columns || [];
                                    return (
                                        <div key={tableField.id} className="mt-[-1.5px] border-[1.5px] border-slate-200 overflow-hidden break-inside-avoid shadow-sm">
                                            <table className="w-full text-left border-collapse table-fixed divide-y divide-slate-200">
                                                <thead>
                                                    <tr className="bg-slate-100">
                                                        {headers.map(header => (
                                                            <th key={header} className="px-3 py-2 text-[8px] font-black text-slate-600 uppercase tracking-widest border-r border-slate-200 last:border-r-0">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {rows.length > 0 ? rows.map((row, rIdx) => (
                                                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}>
                                                            {headers.map(header => {
                                                                const key = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                                                let val = row[key] || row[header.toLowerCase()] || '---';
                                                                if (header.toLowerCase().includes('date') && val !== '---') {
                                                                    val = formatDate(String(val));
                                                                }
                                                                return (
                                                                    <td key={header} className="px-3 py-1.5 text-[9px] font-bold text-slate-800 border-r border-slate-100 last:border-r-0">
                                                                        {val}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={headers.length} className="px-4 py-4 text-center text-[8px] font-bold text-slate-300 uppercase tracking-widest italic bg-slate-50/10">
                                                                Clinical Findings Pending
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}

                                {/* Grid / Matrix Printer */}
                                {visibleFields.filter(f => f.type === 'grid-matrix').map(gridField => {
                                    const headers = gridField.columns || ['Header 1', 'Header 2'];
                                    const rows = (formValues[gridField.id] || []) as any[];
                                    return (
                                        <div key={gridField.id} className="mt-4 break-inside-avoid mb-6">
                                            <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 px-1">
                                                {gridField.label || 'Grid Matrix'}
                                            </div>
                                            <div className="border-[1.5px] border-slate-950 overflow-hidden">
                                                <table className="w-full text-left border-collapse table-fixed divide-y divide-slate-200">
                                                    <thead>
                                                        <tr className="bg-slate-50 border-b border-slate-950">
                                                            {headers.map((header, hIdx) => (
                                                                <th key={hIdx} className="px-3 py-2 text-[8px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-200 last:border-r-0">
                                                                    {header}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        {rows.length > 0 ? rows.map((row, rIdx) => (
                                                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}>
                                                                {headers.map((_, hIdx) => {
                                                                    const key = `col_${hIdx}`;
                                                                    return (
                                                                        <td key={hIdx} className="px-3 py-2 text-[10px] font-bold text-slate-800 border-r border-slate-100 last:border-r-0 leading-tight">
                                                                            {row[key] || '---'}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={headers.length} className="px-4 py-8 text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">
                                                                    Pending Data Entry
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Biometry Matrix Printer */}
                                {visibleFields.filter(f => f.type === 'biometry-matrix').map(bioField => {
                                    const fetusQty = Math.max(1, parseInt(String(formValues['ep_fetus_qty'] || '1')));
                                    const variables = bioField.variables || [];
                                    return (
                                        <div key={bioField.id} className="mt-[-1.5px] border-[1.5px] border-slate-950 overflow-hidden break-inside-avoid shadow-sm">
                                            <table className="w-full text-left border-collapse divide-y divide-slate-200">
                                                <thead>
                                                    <tr className="bg-slate-900 text-white">
                                                        <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest border-r border-slate-700">Growth Parameters</th>
                                                        {Array.from({ length: fetusQty }).map((_, i) => (
                                                            <th key={i} className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-center border-r border-slate-700 last:border-r-0">FETUS {String.fromCharCode(65 + i)}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {variables.map((v, vIdx) => (
                                                        <tr key={v} className={vIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}>
                                                            <td className="px-3 py-1 bg-slate-50 text-[8px] font-black text-slate-600 uppercase tracking-tight border-r border-slate-200">{v}</td>
                                                            {Array.from({ length: fetusQty }).map((_, i) => {
                                                                const cellId = `${bioField.id}_${v.toLowerCase().replace(/[^a-z0-9]/g, '')}_f${i}`;
                                                                return (
                                                                    <td key={i} className="px-3 py-1 text-[10px] font-bold text-slate-950 text-center border-r border-slate-100 last:border-r-0">
                                                                        {formValues[cellId] || '---'}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}

                                {/* Doppler Matrix Printer */}
                                {visibleFields.filter(f => f.type === 'doppler-matrix').map(dopField => {
                                    const fetusQty = Math.max(1, parseInt(String(formValues['ep_fetus_qty'] || '1')));
                                    const vessels = dopField.vessels || [];
                                    const metrics = ['Syst', 'Diast', 'R.I.'];
                                    return (
                                        <div key={dopField.id} className="mt-[-1.5px] border-[1.5px] border-slate-950 overflow-hidden break-inside-avoid">
                                            <table className="w-full text-left border-collapse divide-y divide-slate-200">
                                                <thead>
                                                    <tr className="bg-slate-950 text-white">
                                                        <th rowSpan={2} className="px-3 py-2 text-[8px] font-black uppercase tracking-widest border-r border-slate-700">Hemodynamics</th>
                                                        {Array.from({ length: fetusQty }).map((_, i) => (
                                                            <th key={i} colSpan={3} className="px-3 py-1 text-[8px] font-black uppercase tracking-widest text-center border-l border-slate-700">Fetus {String.fromCharCode(65 + i)}</th>
                                                        ))}
                                                    </tr>
                                                    <tr className="bg-slate-100 border-t border-slate-200">
                                                        {Array.from({ length: fetusQty }).map((_, i) => (
                                                            <React.Fragment key={i}>
                                                                {metrics.map(m => (
                                                                    <th key={m} className="px-1 py-1 text-[7px] font-black uppercase text-center border-l border-slate-200 first:border-l-0">{m}</th>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {vessels.map((v, vIdx) => (
                                                        <tr key={v} className={vIdx % 2 !== 0 ? 'bg-slate-50/20' : ''}>
                                                            <td className="px-3 py-1.5 bg-slate-50 text-[8px] font-black text-slate-600 uppercase tracking-tight border-r border-slate-200 italic">{v}</td>
                                                            {Array.from({ length: fetusQty }).map((_, i) => (
                                                                <React.Fragment key={i}>
                                                                    {metrics.map(m => {
                                                                        const cellId = `${dopField.id}_${v.toLowerCase().replace(/[^a-z0-9]/g, '')}_f${i}_${m.toLowerCase()}`;
                                                                        return (
                                                                            <td key={m} className="px-1 py-1 text-[10px] font-bold text-slate-900 text-center border-l border-slate-100 first:border-l-0">
                                                                                {formValues[cellId] || '---'}
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
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Signature Area */}
                <div className="mt-16 pt-8 border-t border-slate-100 signature-block flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Physician Verification</span>
                            <div className="w-48 h-px bg-slate-200 mb-4" />
                            <div className="text-[12px] font-black text-slate-900 uppercase tracking-tight italic leading-none">Dr. Administrator</div>
                            <div className="text-[8px] font-bold text-medical-primary uppercase tracking-[0.1em] mt-1">Senior Consultant Diagnostic Radiologist</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #print-area, #print-area * { visibility: visible !important; }
                    #print-area { 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 100% !important; 
                        margin: 0 !important; 
                        padding: 0 !important;
                    }
                    @page { 
                        size: A4 portrait;
                        margin: 15mm; 
                    }
                    .no-print { display: none !important; }
                    .signature-block { 
                        page-break-inside: avoid !important; 
                        break-inside: avoid !important;
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintLayout;
