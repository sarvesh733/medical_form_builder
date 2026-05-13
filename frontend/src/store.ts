import { create } from 'zustand';
import { MedicalTemplate, TemplateStore, TemplateSection, TemplateField } from './types';
import { fetchTemplates, saveTemplate } from './api/templates';

export const useStore = create<TemplateStore>()(
    (set, get) => ({
      templates: [],
      activeTemplate: null,
      selectedFieldId: null,
      activeSectionId: null,
      darkMode: false,

      setDarkMode: (val: boolean) => {
        set({ darkMode: val });
        localStorage.setItem('medical_builder_theme', val ? 'dark' : 'light');
        if (val) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setTemplates: (templates: MedicalTemplate[]) => set({ templates }),
      loadTemplatesFromApi: async () => {
        const templates = await fetchTemplates();
        set((state: TemplateStore) => {
          const nextActiveTemplate =
            state.activeTemplate && templates.some((t) => t.id === state.activeTemplate?.id)
              ? templates.find((t) => t.id === state.activeTemplate?.id) ?? null
              : state.activeTemplate;

          return {
            templates,
            activeTemplate: nextActiveTemplate,
          };
        });
      },
      saveActiveTemplateToApi: async (templateName?: string) => {
        const { activeTemplate, templates } = get();
        if (!activeTemplate) {
          throw new Error('No active template selected');
        }

        const templateToSave = templateName
          ? { ...activeTemplate, name: templateName }
          : activeTemplate;

        const savedTemplate = await saveTemplate(templateToSave);
        const exists = templates.some((template) => template.id === savedTemplate.id);

        set((state: TemplateStore) => ({
          templates: exists
            ? state.templates.map((template) => (template.id === savedTemplate.id ? savedTemplate : template))
            : [savedTemplate, ...state.templates.filter((template) => template.id !== activeTemplate.id)],
          activeTemplate: savedTemplate,
          formValues: {}, // Clear all form values after saving template structure
        }));
      },
      setActiveTemplate: (id: string | null) => set((state: TemplateStore) => ({ 
        activeTemplate: state.templates.find(t => t.id === id) || null,
        activeSectionId: null,
        selectedFieldId: null,
        formValues: {}, // Clear form values when switching templates
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
      setFormValues: (values: Record<string, any>) => set({
        formValues: values,
      }),
      clearFormValues: () => set({ formValues: {} })
    })
);
