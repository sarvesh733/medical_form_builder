export type FieldType = 'text' | 'textarea' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'file' | 'video' | 'region-selector' | 'date' | 'checkbox-group' | 'dynamic-table' | 'grid-matrix' | 'doppler-matrix' | 'biometry-matrix' | 'early-pregnancy-matrix' | 'nab-matrix';

export interface FieldOption {
  label: string;
  value: string;
}

export interface ConditionalLogic {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'truthy' | 'greater_than' | 'less_than';
  value: any;
}

export interface TemplateField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  options?: FieldOption[];
  required?: boolean;
  conditional?: ConditionalLogic;
  columns?: string[];
  tableType?: 'general' | 'partner' | 'pregnancy' | 'external-scan' | 'investigations';
  rows?: number | string[];
  vessels?: string[];
  variables?: string[];
  metadata?: {
    scanType?: 'static' | 'dynamic';
    region?: string;
    category?: string;
  };
}

export interface TemplateSection {
  id: string;
  title: string;
  fields: TemplateField[];
  layout?: 'standard' | 'clinical-table' | 'clinical-table-doppler' | 'multifetal-biometry' | 'multifetal-doppler';
  isCollapsible?: boolean;
  conditional?: ConditionalLogic;
}

export interface MedicalTemplate {
  id: string;
  name: string;
  scanType: 'Abdomen/Pelvis' | 'Fetal ECO' | 'Medical History' | 'OB Case History' | '2nd and 3rd trimester OB USG' | 'OB-USG-Early Pregnancy';
  sections: TemplateSection[];
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  persisted?: boolean;
  isDefault?: boolean;
}

export type TemplateStore = {
  templates: MedicalTemplate[];
  activeTemplate: MedicalTemplate | null;
  selectedFieldId: string | null;
  activeSectionId: string | null;
  darkMode: boolean;
  setTemplates: (templates: MedicalTemplate[]) => void;
  loadTemplatesFromApi: () => Promise<void>;
  saveActiveTemplateToApi: (templateName?: string) => Promise<void>;
  setActiveTemplate: (id: string | null) => void;
  setDarkMode: (val: boolean) => void;
  updateTemplate: (template: MedicalTemplate) => void;
  addField: (sectionId: string, field: TemplateField) => void;
  updateField: (sectionId: string, fieldId: string, updates: Partial<TemplateField>) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  addSection: (section: TemplateSection) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sections: TemplateSection[]) => void;
  setActiveSection: (id: string | null) => void;
  setSelectedField: (sectionId: string | null, fieldId: string | null) => void;
  formValues: Record<string, any>;
  setFieldValue: (id: string, value: any) => void;
  setFormValues: (values: Record<string, any>) => void;
  clearFormValues: () => void;
};
