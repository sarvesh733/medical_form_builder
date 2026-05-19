// import { MedicalTemplate, TemplateSection, TemplateField } from '../types';
// import { getAuthHeaders, getCurrentUser } from '../auth';
// import { DEFAULT_SCHEMAS } from '../schemas';

// const API_BASE_URL = 'http://localhost:5000';
// const DOCTOR_ID = 'D01';

// type TemplateFieldRow = {
//   field_id: string;
//   template_id: string;
//   section_id: string;
//   section_title: string;
//   field_name: string;
//   standard_key: string;
//   field_type: string;
//   is_required: boolean;
//   sort_order: number;
//   options_json?: Array<{ label: string; value: string }> | null;
//   conditional_json?: {
//     fieldId: string;
//     operator: 'equals' | 'not_equals' | 'contains' | 'truthy' | 'greater_than' | 'less_than';
//     value: unknown;
//   } | null;
// };

// type TemplateRow = {
//   template_id: string;
//   doctor_id: string;
//   scan_type: string;
//   version: number;
//   title: string | null;
//   created_at: string;
//   updated_at: string;
//   fields: TemplateFieldRow[];
// };

// const toBackendPayload = (template: MedicalTemplate) => {
//   const user = getCurrentUser();
//   const doctorId = (user?.role === 'doctor' || user?.role === 'admin') ? user.user_id : DOCTOR_ID;

//   const fields = template.sections.flatMap((section, sectionIndex) =>
//     section.fields.map((field, fieldIndex) => ({
//       section_id: section.id,
//       section_title: section.title,
//       field_name: field.label,
//       standard_key: field.id,
//       field_type: field.type,
//       is_required: Boolean(field.required),
//       sort_order: sectionIndex * 1000 + fieldIndex,
//       options: field.options || null,
//       conditional: field.conditional || null,
//     })),
//   );

//   return {
//     doctor_id: doctorId,
//     scan_type: template.scanType,
//     title: template.name,
//     fields,
//     user_id: user?.user_id,
//     role: user?.role,
//   };
// };

// const getDefaultSectionMeta = (scanType: string, sectionId: string) => {
//   const matchingSchemas = Object.values(DEFAULT_SCHEMAS).filter((schema) => schema.scanType === scanType);

//   for (const schema of matchingSchemas) {
//     const section = schema.sections?.find((item) => item.id === sectionId);
//     if (section) {
//       return section;
//     }
//   }

//   return undefined;
// };

// const fromBackendRow = (row: TemplateRow): MedicalTemplate => {
//   const sectionMap = new Map<string, TemplateSection>();

//   row.fields
//     .sort((a, b) => a.sort_order - b.sort_order)
//     .forEach((fieldRow) => {
//       if (!sectionMap.has(fieldRow.section_id)) {
//         const defaultSection = getDefaultSectionMeta(row.scan_type, fieldRow.section_id);

//         sectionMap.set(fieldRow.section_id, {
//           id: fieldRow.section_id,
//           title: fieldRow.section_title,
//           fields: [],
//           layout: defaultSection?.layout,
//           isCollapsible: defaultSection?.isCollapsible,
//         });
//       }

//       const section = sectionMap.get(fieldRow.section_id)!;
//       const defaultSection = getDefaultSectionMeta(row.scan_type, fieldRow.section_id);
//       const defaultField = defaultSection?.fields.find((item) => item.id === fieldRow.standard_key);
//       const field: TemplateField = {
//         id: fieldRow.standard_key,
//         type: fieldRow.field_type as TemplateField['type'],
//         label: fieldRow.field_name,
//         required: fieldRow.is_required,
//         placeholder: defaultField?.placeholder,
//         defaultValue: defaultField?.defaultValue,
//         columns: defaultField?.columns,
//         tableType: defaultField?.tableType,
//         rows: defaultField?.rows,
//         vessels: defaultField?.vessels,
//         variables: defaultField?.variables,
//         metadata: defaultField?.metadata,
//       };

//       // Add options if they exist in the database
//       if (fieldRow.options_json && Array.isArray(fieldRow.options_json)) {
//         field.options = fieldRow.options_json;
//       }

//       if (fieldRow.conditional_json) {
//         field.conditional = {
//           fieldId: fieldRow.conditional_json.fieldId,
//           operator: fieldRow.conditional_json.operator,
//           value: fieldRow.conditional_json.value,
//         };
//       } else if (row.scan_type === 'OB-USG-Early Pregnancy') {
//         if (fieldRow.section_id === 'ep_fetus_b') {
//           field.conditional = {
//             fieldId: 'ep_fetus_qty',
//             operator: 'greater_than',
//             value: 1,
//           };
//         }

//         if (fieldRow.section_id === 'ep_fetus_c') {
//           field.conditional = {
//             fieldId: 'ep_fetus_qty',
//             operator: 'greater_than',
//             value: 2,
//           };
//         }
//       }

//       section.fields.push(field);
//     });

//   return {
//     id: row.template_id,
//     name: row.title ?? `${row.scan_type} Template`,
//     scanType: row.scan_type as MedicalTemplate['scanType'],
//     version: String(row.version),
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//     createdBy: row.doctor_id,
//     persisted: true,
//     sections: Array.from(sectionMap.values()),
//   };
// };

// export const saveTemplate = async (template: MedicalTemplate): Promise<MedicalTemplate> => {
//   const res = await fetch(`${API_BASE_URL}/templates`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeaders(),
//     },
//     body: JSON.stringify(toBackendPayload(template)),
//   });

//   if (!res.ok) {
//     throw new Error('Failed to save template');
//   }

//   const data = (await res.json()) as TemplateRow;
//   return fromBackendRow(data);
// };

// export const fetchTemplates = async (): Promise<MedicalTemplate[]> => {
//   const user = getCurrentUser();
  
//   try {
//     // For doctors and admins, try their own user_id first
//     if (user?.role === 'doctor' || user?.role === 'admin') {
//       const res = await fetch(`${API_BASE_URL}/templates?doctor_id=${user.user_id}`, {
//         headers: {
//           ...getAuthHeaders(),
//         },
//       });

//       if (res.ok) {
//         const data = (await res.json()) as TemplateRow[];
//         if (data.length > 0) {
//           return data.map(fromBackendRow);
//         }
//       }
      
//       // Fall back to shared templates (D01) if user has none
//       const fallbackRes = await fetch(`${API_BASE_URL}/templates?doctor_id=${DOCTOR_ID}`, {
//         headers: {
//           ...getAuthHeaders(),
//         },
//       });

//       if (fallbackRes.ok) {
//         const data = (await fallbackRes.json()) as TemplateRow[];
//         return data.map(fromBackendRow);
//       }
      
//       return [];
//     }
    
//     // For receptionists and typists, fetch shared templates (D01)
//     const res = await fetch(`${API_BASE_URL}/templates?doctor_id=${DOCTOR_ID}`, {
//       headers: {
//         ...getAuthHeaders(),
//       },
//     });

//     if (res.ok) {
//       const data = (await res.json()) as TemplateRow[];
//       return data.map(fromBackendRow);
//     }
    
//     return [];
//   } catch (error) {
//     console.error('Error fetching templates:', error);
//     return [];
//   }
// };






import { MedicalTemplate, TemplateSection, TemplateField } from '../types';
import { getAuthHeaders, getCurrentUser } from '../auth';
import { DEFAULT_SCHEMAS } from '../schemas';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DOCTOR_ID = 'D01';



type TemplateFieldRow = {
  field_id: string;
  template_id: string;
  section_id: string;
  section_title: string;
  field_name: string;
  standard_key: string;
  field_type: string;
  is_required: boolean;
  sort_order: number;
  options_json?: Array<{ label: string; value: string }> | null;
  conditional_json?: {
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'truthy' | 'greater_than' | 'less_than';
    value: unknown;
  } | null;
};

type TemplateRow = {
  template_id: string;
  doctor_id: string;
  scan_type: string;
  version: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  fields: TemplateFieldRow[];
};

const toBackendPayload = (template: MedicalTemplate) => {
  const user = getCurrentUser();
  const doctorId = (user?.role === 'doctor' || user?.role === 'admin') ? user.user_id : DOCTOR_ID;

  const fields = template.sections.flatMap((section, sectionIndex) =>
    section.fields.map((field, fieldIndex) => ({
      section_id: section.id,
      section_title: section.title,
      field_name: field.label,
      standard_key: field.id,
      field_type: field.type,
      is_required: Boolean(field.required),
      sort_order: sectionIndex * 1000 + fieldIndex,
      options: field.options || null,
      conditional: field.conditional || null,
    })),
  );

  return {
    doctor_id: doctorId,
    scan_type: template.scanType,
    title: template.name,
    fields,
    user_id: user?.user_id,
    role: user?.role,
  };
};

const getDefaultSectionMeta = (scanType: string, sectionId: string) => {
  const matchingSchemas = Object.entries(DEFAULT_SCHEMAS)
    .filter(([key, schema]) => schema.scanType === scanType || key === scanType)
    .map(([, schema]) => schema);

  for (const schema of matchingSchemas) {
    const section = schema.sections?.find((item) => item.id === sectionId);
    if (section) return section;
  }

  return undefined;
};

const fromBackendRow = (row: TemplateRow): MedicalTemplate => {
  const sectionMap = new Map<string, TemplateSection>();

  row.fields
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((fieldRow) => {
      if (!sectionMap.has(fieldRow.section_id)) {
        const defaultSection = getDefaultSectionMeta(row.scan_type, fieldRow.section_id);

        sectionMap.set(fieldRow.section_id, {
          id: fieldRow.section_id,
          title: fieldRow.section_title,
          fields: [],
          layout: defaultSection?.layout,
          isCollapsible: defaultSection?.isCollapsible,
        });
      }

      const section = sectionMap.get(fieldRow.section_id)!;
      const defaultSection = getDefaultSectionMeta(row.scan_type, fieldRow.section_id);
      const defaultField = defaultSection?.fields.find((item) => item.id === fieldRow.standard_key);

      // Prefer schema definition for structural properties if it's a standard field
      const field: TemplateField = {
        id: fieldRow.standard_key,
        type: (defaultField?.type || fieldRow.field_type) as TemplateField['type'],
        label: fieldRow.field_name, // Keep saved label
        required: fieldRow.is_required, // Keep saved required status
        placeholder: defaultField?.placeholder || '',
        defaultValue: defaultField?.defaultValue,
        columns: defaultField?.columns,
        tableType: defaultField?.tableType,
        rows: defaultField?.rows,
        vessels: defaultField?.vessels,
        variables: defaultField?.variables,
        metadata: defaultField?.metadata,
      };

      // Handle options: prefer schema unless schema has none and DB has some
      if (defaultField?.options) {
        field.options = defaultField.options;
      } else if (fieldRow.options_json && Array.isArray(fieldRow.options_json)) {
        field.options = fieldRow.options_json;
      }

      // Handle conditional: prefer schema if it exists for standard field
      if (defaultField?.conditional) {
        field.conditional = defaultField.conditional;
      } else if (fieldRow.conditional_json) {
        field.conditional = {
          fieldId: fieldRow.conditional_json.fieldId,
          operator: fieldRow.conditional_json.operator,
          value: fieldRow.conditional_json.value,
        };
      }

      section.fields.push(field);
    });

  return {
    id: row.template_id,
    name: row.title ?? `${row.scan_type} Template`,
    scanType: row.scan_type as MedicalTemplate['scanType'],
    version: String(row.version),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.doctor_id,
    persisted: true,
    sections: Array.from(sectionMap.values()),
  };
};

export const saveTemplate = async (template: MedicalTemplate): Promise<MedicalTemplate> => {
  const res = await fetch(`${API_BASE_URL}/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(toBackendPayload(template)),
  });

  if (!res.ok) throw new Error('Failed to save template');

  const data = (await res.json()) as TemplateRow;
  return fromBackendRow(data);
};

export const fetchTemplates = async (): Promise<MedicalTemplate[]> => {
  const user = getCurrentUser();

  try {
    if (user?.role === 'doctor' || user?.role === 'admin') {
      const res = await fetch(`${API_BASE_URL}/templates?doctor_id=${user.user_id}`, {
        headers: { ...getAuthHeaders() },
      });

      if (res.ok) {
        const data = (await res.json()) as TemplateRow[];
        if (data.length > 0) return data.map(fromBackendRow);
      }

      const fallbackRes = await fetch(`${API_BASE_URL}/templates?doctor_id=${DOCTOR_ID}`, {
        headers: { ...getAuthHeaders() },
      });

      if (fallbackRes.ok) {
        const data = (await fallbackRes.json()) as TemplateRow[];
        return data.map(fromBackendRow);
      }

      return [];
    }

    const res = await fetch(`${API_BASE_URL}/templates?doctor_id=${DOCTOR_ID}`, {
      headers: { ...getAuthHeaders() },
    });

    if (res.ok) {
      const data = (await res.json()) as TemplateRow[];
      return data.map(fromBackendRow);
    }

    return [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};