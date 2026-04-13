import React from 'react';
import { useStore } from '../store';
import { Activity } from 'lucide-react';

const PrintLayout: React.FC = () => {
    const { activeTemplate, formValues } = useStore();

    if (!activeTemplate) return null;

    return (
        <div id="print-area" className="hidden print:block print:bg-white min-h-screen">
            <div className="w-full max-w-[210mm] mx-auto bg-white relative">
                {/* Header Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-primary via-medical-secondary to-medical-accent" />

                {/* Header section with Mediscan branding */}
                <div className="flex justify-between items-center mb-10 pt-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-medical-primary to-medical-accent flex items-center justify-center text-white dark:text-medical-dark shadow-xl shrink-0">
                            <Activity size={28} strokeWidth={3} />
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
                    {activeTemplate.sections.map((section) => (
                        <div key={section.id} className="break-inside-avoid">
                            {/* Professional Section Header */}
                            <div className="border-t-2 border-slate-950 pt-2 mb-2 flex items-center justify-between">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">{section.title}</h3>
                                <div className="text-[9px] font-mono text-slate-400">REF_{section.id.substring(0, 4).toUpperCase()}</div>
                            </div>

                            {/* Data Matrix / Clinical Table Selection */}
                            {section.layout === 'clinical-table' ? (
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
                                    {section.fields.map((field) => {
                                        const value = formValues[field.id];
                                        if (field.type === 'dynamic-table') return null;

                                        const displayValue = Array.isArray(value)
                                            ? value.length > 0 ? value.join(', ') : '---'
                                            : value || '---';

                                        return (
                                            <div key={field.id} className="flex min-h-[28px] divide-x divide-slate-200">
                                                <div className="w-[35%] bg-slate-50/80 px-4 py-2 flex items-center shrink-0">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">{field.label || 'Note'}</label>
                                                </div>
                                                <div className="flex-1 px-4 py-2 text-[11px] font-bold text-slate-950 break-words whitespace-pre-wrap flex items-center leading-relaxed">
                                                    {displayValue}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Integrated Tables */}
                            {section.fields.filter(f => f.type === 'dynamic-table').map(tableField => {
                                const rows = (formValues[tableField.id] || []) as any[];
                                const headers = tableField.columns || [];
                                return (
                                    <div key={tableField.id} className="mt-[-1.5px] border-[1.5px] border-slate-200 overflow-hidden">
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
                                                            return (
                                                                <td key={header} className="px-3 py-1.5 text-[10px] font-bold text-slate-800 border-r border-slate-100 last:border-r-0">
                                                                    {row[key] || row[header.toLowerCase()] || '---'}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={headers.length} className="px-4 py-6 text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest italic bg-slate-50/10">
                                                            Pending Clinical Evaluation
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Footer Signature Area */}
                <div className="mt-12 pt-8 flex justify-between items-end break-inside-avoid">
                    <div className="space-y-3">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Physician Verification</div>
                        <div className="w-40 h-8 border-b border-slate-200" />
                        <div className="text-[11px] font-black text-slate-950 uppercase tracking-tight italic">Dr. Administrator</div>
                        <div className="text-[8px] font-bold text-medical-primary uppercase tracking-widest leading-none">Senior Consultant Diagnostic Radiologist</div>
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
                }
            `}</style>
        </div>
    );
};

export default PrintLayout;
