import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MedicalTemplate, TemplateStore, TemplateSection, TemplateField } from './types';
import { DEFAULT_SCHEMAS } from './schemas';

export const useStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: Object.values(DEFAULT_SCHEMAS) as MedicalTemplate[],
      activeTemplate: null,
      selectedFieldId: null,
      activeSectionId: null,
      darkMode: false,

      setDarkMode: (val: boolean) => {
        set({ darkMode: val });
        if (val) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setTemplates: (templates: MedicalTemplate[]) => set({ templates }),
      setActiveTemplate: (id: string | null) => set((state: TemplateStore) => ({ 
        activeTemplate: state.templates.find(t => t.id === id) || null,
        activeSectionId: null,
        selectedFieldId: null
      })),
      
      updateTemplate: (template: MedicalTemplate) => set((state: TemplateStore) => ({
        templates: state.templates.map(t => t.id === template.id ? template : t),
        activeTemplate: state.activeTemplate?.id === template.id ? template : state.activeTemplate
      })),

      addField: (sectionId: string, field: TemplateField) => set((state: TemplateStore) => {
        if (!state.activeTemplate) return state;
        const updatedSections = state.activeTemplate.sections.map(section => {
          if (section.id === sectionId) {
            return { ...section, fields: [...section.fields, field] };
          }
          return section;
        });
        const updatedTemplate = { ...state.activeTemplate, sections: updatedSections };
        return {
          templates: state.templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t),
          activeTemplate: updatedTemplate
        };
      }),

      updateField: (sectionId: string, fieldId: string, updates: Partial<TemplateField>) => set((state: TemplateStore) => {
        if (!state.activeTemplate) return state;
        const updatedSections = state.activeTemplate.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              fields: section.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
            };
          }
          return section;
        });
        const updatedTemplate = { ...state.activeTemplate, sections: updatedSections };
        return {
          templates: state.templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t),
          activeTemplate: updatedTemplate
        };
      }),

      removeField: (sectionId: string, fieldId: string) => set((state: TemplateStore) => {
        if (!state.activeTemplate) return state;
        const updatedSections = state.activeTemplate.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              fields: section.fields.filter(f => f.id !== fieldId)
            };
          }
          return section;
        });
        const updatedTemplate = { ...state.activeTemplate, sections: updatedSections };
        return {
          templates: state.templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t),
          activeTemplate: updatedTemplate
        };
      }),

      addSection: (section: TemplateSection) => set((state: TemplateStore) => {
        if (!state.activeTemplate) return state;
        const updatedTemplate = {
          ...state.activeTemplate,
          sections: [...state.activeTemplate.sections, section]
        };
        return {
          templates: state.templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t),
          activeTemplate: updatedTemplate
        };
      }),

      removeSection: (sectionId: string) => set((state: TemplateStore) => {
        if (!state.activeTemplate) return state;
        const updatedTemplate = {
          ...state.activeTemplate,
          sections: state.activeTemplate.sections.filter(s => s.id !== sectionId)
        };
        return {
          templates: state.templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t),
          activeTemplate: updatedTemplate
        };
      }),

      reorderSections: (sections: TemplateSection[]) => set((state: TemplateStore) => {
        if (!state.activeTemplate) return state;
        const updatedTemplate = {
          ...state.activeTemplate,
          sections
        };
        return {
          templates: state.templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t),
          activeTemplate: updatedTemplate
        };
      }),

      setActiveSection: (id: string | null) => set({ activeSectionId: id }),
      setSelectedField: (sectionId: string | null, fieldId: string | null) => set({ 
        activeSectionId: sectionId, 
        selectedFieldId: fieldId 
      }),
      formValues: {},
      setFieldValue: (id: string, value: any) => set((state: TemplateStore) => ({
        formValues: { ...state.formValues, [id]: value }
      })),
      clearFormValues: () => set({ formValues: {} })
    }),
    {
      name: 'medical-template-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
