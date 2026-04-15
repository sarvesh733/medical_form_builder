import { MedicalTemplate, TemplateSection, TemplateField } from '../types';
import { getAuthHeaders, getCurrentUser } from '../auth';

const API_BASE_URL = 'http://localhost:5000';
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
  const doctorId = user?.role === 'doctor' ? user.user_id : DOCTOR_ID;

  const fields = template.sections.flatMap((section, sectionIndex) =>
    section.fields.map((field, fieldIndex) => ({
      section_id: section.id,
      section_title: section.title,
      field_name: field.label,
      standard_key: field.id,
      field_type: field.type,
      is_required: Boolean(field.required),
      sort_order: sectionIndex * 1000 + fieldIndex,
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

const fromBackendRow = (row: TemplateRow): MedicalTemplate => {
  const sectionMap = new Map<string, TemplateSection>();

  row.fields
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((fieldRow) => {
      if (!sectionMap.has(fieldRow.section_id)) {
        sectionMap.set(fieldRow.section_id, {
          id: fieldRow.section_id,
          title: fieldRow.section_title,
          fields: [],
        });
      }

      const section = sectionMap.get(fieldRow.section_id)!;
      const field: TemplateField = {
        id: fieldRow.standard_key,
        type: fieldRow.field_type as TemplateField['type'],
        label: fieldRow.field_name,
        required: fieldRow.is_required,
      };

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

  if (!res.ok) {
    throw new Error('Failed to save template');
  }

  const data = (await res.json()) as TemplateRow;
  return fromBackendRow(data);
};

export const fetchTemplates = async (): Promise<MedicalTemplate[]> => {
  const user = getCurrentUser();
  const doctorId = user?.role === 'doctor' ? user.user_id : DOCTOR_ID;
  const res = await fetch(`${API_BASE_URL}/templates?doctor_id=${doctorId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch templates');
  }

  const data = (await res.json()) as TemplateRow[];
  return data.map(fromBackendRow);
};
