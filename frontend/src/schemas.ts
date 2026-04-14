import { MedicalTemplate } from './types';

export const DEFAULT_SCHEMAS: Record<string, Partial<MedicalTemplate>> = {
  'Abdomen / Pelvis': {
    name: 'Abdomen & Pelvis Workflow',
    scanType: 'Abdomen/Pelvis',
    version: '2.4.0',
    sections: [
      {
        id: 'demographics',
        title: 'Patient Demographics',
        fields: [
          { id: 'scanDate', label: 'Scan Date', type: 'date' },
          { id: 'ptsName', label: 'Patient Name', type: 'textarea', required: true },
          { id: 'husbandName', label: 'Husband / Father Name', type: 'textarea' },
          { id: 'phone', label: 'Phone Number', type: 'textarea' },
          { id: 'age', label: 'Age', type: 'number' },
          { id: 'sex', label: 'Sex', type: 'dropdown', options: [{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }] },
          { id: 'refDr', label: 'Ref Dr', type: 'textarea' }
        ]
      },
      {
        id: 'scan_selection',
        title: 'Protocol Selection',
        fields: [
          { id: 'area_abs', label: 'Abdomen', type: 'checkbox' },
          { id: 'area_pelvis', label: 'Pelvis', type: 'checkbox' },
          { id: 'area_kub', label: 'KUB', type: 'checkbox' },
          { id: 'area_adrenals', label: 'Adrenals', type: 'checkbox' },
          { id: 'area_transrectal', label: 'Transrectal', type: 'checkbox' },
          { id: 'repeat_scan', label: 'Repeat Scan', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { id: 'report_type', label: 'Report Type', type: 'dropdown', options: [{ label: 'Routine', value: 'routine' }, { label: 'Immediate', value: 'immediate' }, { label: 'Evening', value: 'evening' }] }
        ]
      },
      {
        id: 'findings',
        title: 'Organ Findings / Checklist',
        fields: [
          { id: 'find_liver', label: 'Liver', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_gb', label: 'GB', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_cd', label: 'CD', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_pancreas', label: 'Pancreas', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_spleen', label: 'Spleen', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_aorta', label: 'Aorta', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_rk', label: 'Rt Kidney', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_lk', label: 'Lt Kidney', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_bladder', label: 'Bladder', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_prostate', label: 'Prostate gland', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_transrectal', label: 'Transrectal', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_pelvis', label: 'PELVIS', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_uterus', label: 'Uterus', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_rov', label: 'R.OV', type: 'textarea', placeholder: 'Enter findings...' },
          { id: 'find_lov', label: 'L.OV', type: 'textarea', placeholder: 'Enter findings...' }
        ]
      },
      {
        id: 'history_gen',
        title: 'Symptoms, Signs & General History',
        fields: [
          { id: 'indication', label: 'Indication for scan', type: 'textarea' },
          { id: 'pain_abd', label: 'Pain In Abdomen', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { id: 'pain_site', label: 'Pain Site', type: 'textarea' },
          { id: 'radiation', label: 'Radiation', type: 'textarea' },
          { id: 'food_relation', label: 'Relation to food', type: 'textarea' }
        ]
      },
      {
        id: 'risk_factors',
        title: 'General Risk Factors',
        fields: [
          { id: 'risk_dm', label: 'Diabetes', type: 'checkbox' },
          {
            id: 'dm_type', label: 'Select Type', type: 'checkbox-group', options: [
              { label: 'DM (DIABETES MELLITUS)', value: 'dm' },
              { label: 'PRE-GESTATIONAL DIABETES', value: 'pre' },
              { label: 'GDM (GESTATIONAL DIABETES MELLITUS)', value: 'gdm' }
            ], conditional: { fieldId: 'risk_dm', operator: 'equals', value: true }
          },
          { id: 'dm_hba1c', label: 'HBA1C VALUE', type: 'number', placeholder: 'Value', conditional: { fieldId: 'risk_dm', operator: 'equals', value: true } },
          { id: 'dm_date', label: 'DATE', type: 'date', conditional: { fieldId: 'risk_dm', operator: 'equals', value: true } },
          { id: 'dm_onset', label: 'DATE OF ONSET', type: 'date', conditional: { fieldId: 'risk_dm', operator: 'equals', value: true } },
          { id: 'dm_duration', label: 'DURATION (IN WEEKS)', type: 'number', placeholder: 'Weeks', conditional: { fieldId: 'risk_dm', operator: 'equals', value: true } },
          { id: 'dm_tablets', label: 'TABLETS TAKING', type: 'textarea', placeholder: 'Name of tablets and dosage', conditional: { fieldId: 'risk_dm', operator: 'equals', value: true } },
          { id: 'risk_ht', label: 'Hypertension', type: 'checkbox' },
          {
            id: 'ht_type', label: 'Select Type', type: 'checkbox-group', options: [
              { label: 'PRE-GESTATIONAL HYPERTENSION', value: 'pre' },
              { label: 'PIH (PREGNANCY INDUCED HYPERTENSION)', value: 'pih' }
            ], conditional: { fieldId: 'risk_ht', operator: 'equals', value: true }
          },
          { id: 'ht_onset', label: 'YEAR OF ONSET', type: 'textarea', placeholder: 'YYYY', conditional: { fieldId: 'risk_ht', operator: 'equals', value: true } },
          { id: 'ht_tablets', label: 'TABLETS', type: 'textarea', placeholder: 'Medicine name', conditional: { fieldId: 'risk_ht', operator: 'equals', value: true } },
          { id: 'ht_remarks', label: 'REMARKS', type: 'textarea', placeholder: 'Additional info', conditional: { fieldId: 'risk_ht', operator: 'equals', value: true } },
          { id: 'risk_alc', label: 'Alcoholism', type: 'checkbox' },
          { id: 'risk_smoke', label: 'Smoking', type: 'checkbox' },
          { id: 'risk_fever', label: 'Fever', type: 'checkbox' },
          { id: 'hist_dm', label: 'Family h/o Diabetes', type: 'textarea' },
          { id: 'hist_ht', label: 'Family h/o Hypertension', type: 'textarea' },
          { id: 'loss_wt', label: 'Loss of appetite/weight', type: 'textarea' },
          { id: 'other_risk', label: 'Other Risk Factors', type: 'textarea' }
        ]
      },
      {
        id: 'clinical_obs',
        title: 'Clinical Observations',
        fields: [
          { id: 'bowel', label: 'Bowel Habits', type: 'textarea' },
          { id: 'micturition', label: 'Micturition', type: 'dropdown', options: [{ label: 'Normal', value: 'norm' }, { label: 'Burning', value: 'burn' }, { label: 'Frequent', value: 'freq' }] },
          { id: 'jaundice', label: 'Jaundice', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { id: 'edema', label: 'Edema', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] }
        ]
      },
      {
        id: 'med_history',
        title: 'Medical / Surgical History',
        fields: [
          { id: 'hist_surg', label: 'H/O Surgery', type: 'textarea' },
          { id: 'hist_med', label: 'Past Medical History', type: 'textarea' },
          { id: 'invest', label: 'Investigations', type: 'textarea' },
          { id: 'normal_case', label: 'Normal Case History', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] }
        ]
      },
      {
        id: 'pelvis_gyn',
        title: 'Pelvis or Gynaecology (Female Patients)',
        fields: [
          { id: 'marital', label: 'Marital Status', type: 'textarea' },
          { id: 'gyn_ind', label: 'Gyn Indication', type: 'textarea' },
          { id: 'children', label: 'No. of children', type: 'number' },
          { id: 'last_birth', label: 'Last child birth', type: 'textarea' },
          { id: 'menses', label: 'Menstrual History', type: 'dropdown', options: [{ label: 'Regular', value: 'reg' }, { label: 'Irregular', value: 'irreg' }] },
          { id: 'flow', label: 'Flow', type: 'dropdown', options: [{ label: 'Normal', value: 'norm' }, { label: 'Heavy', value: 'heavy' }, { label: 'Scanty', value: 'scant' }] },
          { id: 'lmp', label: 'LMP', type: 'date' },
          { id: 'puberty', label: 'Age of Puberty', type: 'number' },
          { id: 'menopause', label: 'Age of Menopause', type: 'number' },
          { id: 'risk_diabetes', label: 'Diabetes', type: 'textarea', placeholder: 'Severity/Duration...' },
          { id: 'risk_hypertension', label: 'Hypertension', type: 'textarea', placeholder: 'BP Control...' },
          { id: 'surg_hx', label: 'H/O Surgery', type: 'textarea' },
          { id: 'investigations', label: 'Investigations', type: 'textarea' },
          { id: 'follow_up', label: 'Follow Up (Y/N)', type: 'textarea' },
          { id: 'normal_case_hist', label: 'Normal Case History', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] }
        ]
      }
    ]
  },
  'Fetal ECO': {
    name: 'Fetal Echocardiogram Protocol',
    scanType: 'Fetal ECO',
    version: '1.2.0',
    sections: [
      {
        id: 'fetal_id',
        title: 'Reference Identification',
        fields: [
          { id: 'ptsName', label: 'Patient Name', type: 'textarea', required: true },
          { id: 'husbandName', label: 'Husband / Father Name', type: 'textarea' },
          { id: 'phone', label: 'Phone Number', type: 'textarea' },
          { id: 'uid', label: 'UID Number', type: 'textarea' },
          { id: 'scanDate', label: 'Scan date', type: 'date' }
        ]
      },
      {
        id: 'checklist',
        title: 'Technical Compliance',
        fields: [
          { id: 'penetration', label: 'Penetration', type: 'radio', options: [{ label: 'Good', value: 'good' }, { label: 'Poor', value: 'poor' }] },
          { id: 'position', label: 'Position', type: 'radio', options: [{ label: 'Good', value: 'good' }, { label: 'Poor', value: 'poor' }] },
          { id: 'situs', label: 'Situs', type: 'textarea' },
          { id: 'Heart rate', label: 'Heart Rate', type: 'number' },
          { id: 'dv', label: 'DV', type: 'textarea' }
        ]
      },
      {
        id: 'echo_survey',
        title: 'Echocardiographic Survey',
        layout: 'clinical-table',
        fields: [
          { id: '4ch_b', label: 'Four chamber', type: 'textarea', placeholder: 'B mode...' },
          { id: '4ch_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: 'pv_b', label: 'Pulmonary veins', type: 'textarea', placeholder: 'B mode...' },
          { id: 'pv_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: 'lvot_b', label: 'LVOT', type: 'textarea', placeholder: 'B mode...' },
          { id: 'lvot_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: 'rvot_b', label: 'RVOT', type: 'textarea', placeholder: 'B mode...' },
          { id: 'rvot_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: '3v_b', label: '3 Vessel View (PAS)', type: 'textarea', placeholder: 'B mode...' },
          { id: '3v_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: 'arches_b', label: 'Arches / 3VT', type: 'textarea', placeholder: 'B mode...' },
          { id: 'arches_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: 'svc_b', label: 'SVC', type: 'textarea', placeholder: 'B mode...' },
          { id: 'svc_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: 'ivc_b', label: 'IVC', type: 'textarea', placeholder: 'B mode...' },
          { id: 'ivc_c', label: '', type: 'textarea', placeholder: 'Color...' },
          { id: 'subcl_b', label: 'Rt subclavian artery', type: 'textarea', placeholder: 'B mode...' },
          { id: 'subcl_c', label: '', type: 'textarea', placeholder: 'Color...' },
          // { id: 'aortic_b', label: 'Aortic arch', type: 'textarea', placeholder: 'B mode...' },
          // { id: 'aortic_c', label: '', type: 'textarea', placeholder: 'Color...' },
          // { id: 'ductal_b', label: 'Ductal arch', type: 'textarea', placeholder: 'B mode...' },
          // { id: 'ductal_c', label: '', type: 'textarea', placeholder: 'Color...' }
        ]
      },
      {
        id: 'conclusion',
        title: 'Clinical Impression',
        fields: [
          { id: 'findings', label: 'Findings', type: 'textarea' },
          { id: 'impression', label: 'Impression', type: 'textarea' },
          { id: 'counsel', label: 'Counseling', type: 'radio', options: [{ label: 'yes', value: 'yes' }, { label: 'no', value: 'no' }] },
          { id: 'review', label: 'Review', type: 'radio', options: [{ label: 'yes', value: 'yes' }, { label: 'no', value: 'no' }] }
        ]
      }
    ]
  },
  'Medical History': {
    name: 'Medical History Aggregator',
    scanType: 'Medical History',
    version: '1.0.0',
    sections: [
      {
        id: 'mh_diabetes',
        title: 'History: Diabetes Mellitus',
        fields: [
          { id: 'diabetes', label: 'Diabetes', type: 'checkbox' },
          {
            id: 'dm_type', label: 'Select Type', type: 'checkbox-group', options: [
              { label: 'DM (DIABETES MELLITUS)', value: 'dm' },
              { label: 'PRE-GESTATIONAL DIABETES', value: 'pre' },
              { label: 'GDM (GESTATIONAL DIABETES MELLITUS)', value: 'gdm' }
            ], conditional: { fieldId: 'diabetes', operator: 'equals', value: true }
          },
          { id: 'dm_hba1c', label: 'HBA1C VALUE', type: 'number', placeholder: 'Value', conditional: { fieldId: 'diabetes', operator: 'equals', value: true } },
          { id: 'dm_date', label: 'DATE', type: 'date', conditional: { fieldId: 'diabetes', operator: 'equals', value: true } },
          { id: 'dm_onset', label: 'DATE OF ONSET', type: 'date', conditional: { fieldId: 'diabetes', operator: 'equals', value: true } },
          { id: 'dm_duration', label: 'DURATION (IN WEEKS)', type: 'number', placeholder: 'Weeks', conditional: { fieldId: 'diabetes', operator: 'equals', value: true } },
          { id: 'dm_tablets', label: 'TABLETS TAKING', type: 'textarea', placeholder: 'Name of tablets and dosage', conditional: { fieldId: 'diabetes', operator: 'equals', value: true } }
        ]
      },
      {
        id: 'mh_ht',
        title: 'History: Hypertension',
        fields: [
          { id: 'ht', label: 'HT (Hypertension)', type: 'checkbox' },
          {
            id: 'ht_type', label: 'Select Type', type: 'checkbox-group', options: [
              { label: 'PRE-GESTATIONAL HYPERTENSION', value: 'pre' },
              { label: 'PIH (PREGNANCY INDUCED HYPERTENSION)', value: 'pih' }
            ], conditional: { fieldId: 'ht', operator: 'equals', value: true }
          },
          { id: 'ht_onset', label: 'YEAR OF ONSET', type: 'textarea', placeholder: 'YYYY', conditional: { fieldId: 'ht', operator: 'equals', value: true } },
          { id: 'ht_tablets', label: 'TABLETS', type: 'textarea', placeholder: 'Medicine name', conditional: { fieldId: 'ht', operator: 'equals', value: true } },
          { id: 'ht_remarks', label: 'REMARKS', type: 'textarea', placeholder: 'Additional info', conditional: { fieldId: 'ht', operator: 'equals', value: true } }
        ]
      },
      {
        id: 'mh_thyroid',
        title: 'Medical History - Thyroid',
        fields: [
          { id: 'thyroid', label: 'THYROID', type: 'checkbox' },
          { id: 'thyroid_onset', label: 'YEAR OF ONSET', type: 'number', placeholder: 'YYYY', conditional: { fieldId: 'thyroid', operator: 'equals', value: true } },
          { id: 'thyroid_tablets', label: 'TABLETS', type: 'textarea', placeholder: 'Medicine name', conditional: { fieldId: 'thyroid', operator: 'equals', value: true } },
          { id: 'thyroid_remarks', label: 'REMARKS', type: 'textarea', placeholder: 'Additional info', conditional: { fieldId: 'thyroid', operator: 'equals', value: true } }
        ]
      },
      {
        id: 'mh_others_cond',
        title: 'Other Medical Conditions',
        fields: [
          { id: 'others_check', label: 'OTHERS', type: 'checkbox' },
          { id: 'others_details', label: '', type: 'textarea', placeholder: 'Specify other medical conditions and details', conditional: { fieldId: 'others_check', operator: 'equals', value: true } }
        ]
      },
      {
        id: 'mh_family',
        title: 'Family History / Hereditary Factors',
        fields: [
          { id: 'hist_husband', label: 'HUSBAND', type: 'checkbox' },
          { id: 'hus_dm', label: 'DIABETES', type: 'checkbox', conditional: { fieldId: 'hist_husband', operator: 'equals', value: true } },
          { id: 'hus_ht', label: 'HYPERTENSION', type: 'checkbox', conditional: { fieldId: 'hist_husband', operator: 'equals', value: true } },
          { id: 'hus_others', label: 'OTHERS', type: 'checkbox', conditional: { fieldId: 'hist_husband', operator: 'equals', value: true } },

          { id: 'hist_mother', label: 'MOTHER', type: 'checkbox' },
          { id: 'mom_dm', label: 'DIABETES', type: 'checkbox', conditional: { fieldId: 'hist_mother', operator: 'equals', value: true } },
          { id: 'mom_ht', label: 'HYPERTENSION', type: 'checkbox', conditional: { fieldId: 'hist_mother', operator: 'equals', value: true } },
          { id: 'mom_others', label: 'OTHERS', type: 'checkbox', conditional: { fieldId: 'hist_mother', operator: 'equals', value: true } },

          { id: 'hist_father', label: 'FATHER', type: 'checkbox' },
          { id: 'dad_dm', label: 'DIABETES', type: 'checkbox', conditional: { fieldId: 'hist_father', operator: 'equals', value: true } },
          { id: 'dad_ht', label: 'HYPERTENSION', type: 'checkbox', conditional: { fieldId: 'hist_father', operator: 'equals', value: true } },
          { id: 'dad_others', label: 'OTHERS', type: 'checkbox', conditional: { fieldId: 'hist_father', operator: 'equals', value: true } }
        ]
      },
      {
        id: 'mh_external',
        title: 'External Scans',
        fields: [
          { id: 'ext_scans', label: '', type: 'dynamic-table' }
        ]
      },
      {
        id: 'mh_remarks_final',
        title: 'Details & Remarks',
        fields: [
          { id: 'final_remarks', label: '', type: 'textarea', placeholder: 'Any additional details or remarks' }
        ]
      }
    ]
  }
  ,
  'OB Case History': {
    name: 'OB Case History (Full)',
    scanType: 'OB Case History',
    version: '1.2.0',
    sections: [
      {
        id: 'ob_personal',
        title: 'Patient Profile & Indications',
        fields: [
          { id: 'ptsName', label: 'Full Name', type: 'textarea', required: true },
          { id: 'husbandName', label: 'Husband / Father Name', type: 'textarea' },
          { id: 'phone', label: 'Phone Number', type: 'textarea' },
          { id: 'patientID', label: 'Patient ID', type: 'textarea' },
          { id: 'age', label: 'Age', type: 'number' },
          { id: 'dob', label: 'D.O.B.', type: 'date' },
          { id: 'gaia', label: 'Gestational Age (GA)', type: 'textarea', placeholder: 'X Wks + Y Days' },
          { id: 'indications', label: 'Indications for Scan', type: 'textarea' },
          { id: 'married_yrs', label: 'Married Years', type: 'number' },
          { id: 'married_mos', label: 'Months', type: 'number' },
          { id: 'history_personal', label: 'Personal Clinical History', type: 'textarea' }
        ]
      },
      {
        id: 'ob_consanguinity',
        title: 'Consanguinity Mapping',
        fields: [
          { id: 'consang', label: 'Consanguinity', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          {
            id: 'consang_type', label: 'Specify Degree', type: 'checkbox-group', options: [
              { label: 'Degree I', value: 'I' },
              { label: 'Degree II', value: 'II' },
              { label: 'Degree III', value: 'III' },
              { label: 'Degree IV', value: 'IV' }
            ], conditional: { fieldId: 'consang', operator: 'equals', value: 'yes' }
          }
        ]
      },
      {
        id: 'ob_menses',
        title: 'Menstrual History',
        fields: [
          { id: 'lmp', label: 'Last Menstrual Period (LMP)', type: 'date' },
          { id: 'edd', label: 'EDD (by Dates)', type: 'date' },
          { id: 'edd_scan', label: 'EDD (by Scan)', type: 'date' },
          { id: 'cycle_type', label: 'Regularity', type: 'dropdown', options: [{ label: 'Regular', value: 'reg' }, { label: 'Irregular', value: 'irreg' }] },
          { id: 'menarche', label: 'Age at Menarche', type: 'number' },
          { id: 'bleeding_pv', label: 'Bleeding PV', type: 'textarea' },
          { id: 'cycle_duration', label: 'Duration of Cycle', type: 'textarea' },
          { id: 'menses_details', label: 'Menstrual Details', type: 'textarea' }
        ]
      },
      {
        id: 'ob_partners',
        title: 'Partner Biometry (Mother/Father)',
        fields: [
          {
            id: 'partner_data',
            label: 'Biometric Matrix',
            type: 'dynamic-table',
            tableType: 'partner',
            columns: ['Partner', 'Present weight', 'Height', 'Blood Group', 'RH', 'Per Preg. Weight', 'Weight Gain', 'Anti D Given', 'Others']
          }
        ]
      },
      {
        id: 'ob_history',
        title: 'Previous Pregnancy Scoring',
        fields: [
          { id: 'gravida', label: 'Gravida', type: 'number' },
          { id: 'para', label: 'Para', type: 'number' },
          { id: 'abortion', label: 'Abortion', type: 'number' },
          { id: 'live', label: 'Live', type: 'number' },
          {
            id: 'past_pregnancy_table',
            label: 'History of Deliveries',
            type: 'dynamic-table',
            tableType: 'pregnancy',
            columns: ['Pregnancy', 'Year', 'Weeks', 'Sex', 'B. Wt (Gms)', 'Mode of Delivery', 'Pre. Preg History', 'Remarks']
          }
        ]
      },
      {
        id: 'ob_conception',
        title: 'Conception & Assisted Reproduction',
        fields: [
          { id: 'conception_mode', label: 'Conception Type', type: 'radio', options: [{ label: 'Natural', value: 'natural' }, { label: 'Assisted', value: 'assisted' }] },
          { id: 'art_date', label: 'Date of ART', type: 'date', conditional: { fieldId: 'conception_mode', operator: 'equals', value: 'assisted' } },
          {
            id: 'assisted_type', label: 'Assisted Method', type: 'checkbox-group', options: [
              { label: 'Induced', value: 'induced' },
              { label: 'IUI', value: 'iui' },
              { label: 'IVF & ET', value: 'ivf' },
              { label: 'GIFT', value: 'gift' },
              { label: 'ICSI', value: 'icsi' },
              { label: 'Others', value: 'others' }
            ], conditional: { fieldId: 'conception_mode', operator: 'equals', value: 'assisted' }
          },
          { id: 'assisted_others_detail', label: 'Specify Others', type: 'textarea', placeholder: 'Enter method details...', conditional: { fieldId: 'assisted_type', operator: 'contains', value: 'others' } },
          { id: 'art_details', label: 'Details / Remarks', type: 'textarea' }
        ]
      },
      {
        id: 'ob_med_history',
        title: 'Medical History (Present & Past Pregnancy)',
        fields: [
          // Diabetes Hub
          { id: 'dm_check', label: 'Diabetes', type: 'checkbox' },
          { id: 'dm_type', label: 'Select Type', type: 'checkbox-group', options: [{ label: 'DM', value: 'dm' }, { label: 'Pre-Gestational', value: 'pre' }, { label: 'GDM', value: 'gdm' }], conditional: { fieldId: 'dm_check', operator: 'equals', value: true } },
          { id: 'dm_hba1c', label: 'HBA1C Value', type: 'number', conditional: { fieldId: 'dm_check', operator: 'equals', value: true } },
          { id: 'dm_date', label: 'Date', type: 'date', conditional: { fieldId: 'dm_check', operator: 'equals', value: true } },
          { id: 'dm_onset', label: 'Onset Date', type: 'date', conditional: { fieldId: 'dm_check', operator: 'equals', value: true } },
          { id: 'dm_duration', label: 'Duration', type: 'textarea', conditional: { fieldId: 'dm_check', operator: 'equals', value: true } },
          { id: 'dm_status', label: 'Status', type: 'radio', options: [{ label: 'Present', value: 'pres' }, { label: 'Past', value: 'past' }], conditional: { fieldId: 'dm_check', operator: 'equals', value: true } },
          { id: 'dm_notes', label: 'Remarks', type: 'textarea', conditional: { fieldId: 'dm_check', operator: 'equals', value: true } },

          // Hypertension Hub
          { id: 'ht_check', label: 'Hypertension', type: 'checkbox' },
          { id: 'ht_type', label: 'Select Type', type: 'checkbox-group', options: [{ label: 'Pre-Gestational', value: 'pre' }, { label: 'PIH', value: 'pih' }], conditional: { fieldId: 'ht_check', operator: 'equals', value: true } },
          { id: 'ht_year', label: 'Year of Onset', type: 'number', placeholder: 'YYYY', conditional: { fieldId: 'ht_check', operator: 'equals', value: true } },
          { id: 'ht_tablets', label: 'Tablets / Dosage', type: 'textarea', conditional: { fieldId: 'ht_check', operator: 'equals', value: true } },
          { id: 'ht_status', label: 'Status', type: 'radio', options: [{ label: 'Present', value: 'pres' }, { label: 'Past', value: 'past' }], conditional: { fieldId: 'ht_check', operator: 'equals', value: true } },
          { id: 'ht_notes', label: 'Remarks', type: 'textarea', conditional: { fieldId: 'ht_check', operator: 'equals', value: true } },

          // Thyroid & Others
          { id: 'thy_check', label: 'Thyroid', type: 'checkbox' },
          { id: 'thy_year', label: 'Year of Onset', type: 'number', placeholder: 'YYYY', conditional: { fieldId: 'thy_check', operator: 'equals', value: true } },
          { id: 'thy_status', label: 'Status', type: 'radio', options: [{ label: 'Present', value: 'pres' }, { label: 'Past', value: 'past' }], conditional: { fieldId: 'thy_check', operator: 'equals', value: true } },
          { id: 'thy_notes', label: 'Medication / Remarks', type: 'textarea', conditional: { fieldId: 'thy_check', operator: 'equals', value: true } },

          { id: 'other_med_check', label: 'Other Medical Conditions', type: 'checkbox' },
          { id: 'other_med_status', label: 'Timeline', type: 'checkbox-group', options: [{ label: 'Present Pregnancy', value: 'pres' }, { label: 'Past Pregnancy', value: 'past' }], conditional: { fieldId: 'other_med_check', operator: 'equals', value: true } },
          { id: 'other_med_details', label: 'Specify Details', type: 'textarea', conditional: { fieldId: 'other_med_check', operator: 'equals', value: true } }
        ]
      },
      {
        id: 'ob_family',
        title: 'Family History (Pedigree)',
        fields: [
          { id: 'fh_husband', label: 'HUSBAND', type: 'checkbox-group', options: [{ label: 'Diabetes', value: 'dm' }, { label: 'Hypertension', value: 'ht' }, { label: 'Others', value: 'oth' }] },
          { id: 'fh_mother', label: 'MOTHER', type: 'checkbox-group', options: [{ label: 'Diabetes', value: 'dm' }, { label: 'Hypertension', value: 'ht' }, { label: 'Others', value: 'oth' }] },
          { id: 'fh_father', label: 'FATHER', type: 'checkbox-group', options: [{ label: 'Diabetes', value: 'dm' }, { label: 'Hypertension', value: 'ht' }, { label: 'Others', value: 'oth' }] },
          { id: 'fh_summary', label: 'Family Summary', type: 'textarea', placeholder: 'Consanguinity or other familial trends...' }
        ]
      },
      {
        id: 'ob_investigations',
        title: 'Clinical Investigations (External)',
        fields: [
          {
            id: 'inv_table',
            label: 'Lab Markers Matrix',
            type: 'dynamic-table',
            tableType: 'investigations',
            columns: ['Test Marker', 'Yes', 'No', 'Remarks']
          },
          { id: 'inv_detail', label: 'Additional Detail', type: 'textarea' }
        ]
      }
    ]
  },
  'OB Case History + FTS': {
    name: 'OB Case History (FTS Screening Variant)',
    scanType: 'OB Case History',
    version: '1.1.0',
    sections: [
      {
        id: 'fts_personal',
        title: 'Personal Information & FTS Context',
        fields: [
          { id: 'fts_name', label: 'NAME', type: 'textarea', required: true },
          { id: 'husbandName', label: 'HUSBAND / FATHER NAME', type: 'textarea' },
          { id: 'phone', label: 'PHONE NUMBER', type: 'textarea' },
          { id: 'fts_age', label: 'AGE', type: 'number' },
          { id: 'fts_ga', label: 'GESTATIONAL AGE (WKS)', type: 'number' },
          { id: 'fts_id', label: 'PATIENT ID', type: 'textarea' },
          { id: 'fts_indications', label: 'INDICATIONS FOR SCAN', type: 'textarea' },
          { id: 'fts_dob', label: 'D.O.B.', type: 'date' },
          { id: 'fts_married_yrs', label: 'MARRIED YEARS', type: 'number' },
          { id: 'fts_married_mos', label: 'MONTHS', type: 'number' }
        ]
      },
      {
        id: 'fts_consang',
        title: 'Consanguinity',
        fields: [
          { id: 'fts_cons_mode', label: 'Consanguinity Status', type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { id: 'fts_cons_spec', label: 'Degree', type: 'checkbox-group', options: [{ label: 'I', value: 'I' }, { label: 'II', value: 'II' }, { label: 'III', value: 'III' }, { label: 'IV', value: 'IV' }], conditional: { fieldId: 'fts_cons_mode', operator: 'equals', value: 'yes' } }
        ]
      },
      {
        id: 'fts_family',
        title: 'Family History Matrix',
        fields: [
          {
            id: 'fts_partner_table',
            label: 'Partner Matrix',
            type: 'dynamic-table',
            tableType: 'partner',
            columns: ['Partner', 'Present weight', 'Height', 'Blood Group', 'RH', 'Per Preg. Weight', 'Weight Gain', 'Anti D Given', 'Others']
          },
          { id: 'fts_family_details', label: 'Details', type: 'textarea' }
        ]
      },
      {
        id: 'fts_menses',
        title: 'Menstrual History Table',
        fields: [
          { id: 'fts_lmp', label: 'LMP', type: 'date' },
          { id: 'fts_cycle_dur', label: 'Duration of Cycle', type: 'number' },
          { id: 'fts_cycle', label: 'Regular / Irregular', type: 'radio', options: [{ label: 'Regular', value: 'regular' }, { label: 'Irregular', value: 'irregular' }] },
          { id: 'fts_menarche', label: 'Age at Menarche', type: 'number' },

        ]
      },
      {
        id: 'fts_preg_score',
        title: 'Pregnancy History Scoring',
        fields: [
          { id: 'fts_gravida', label: 'Gravida', type: 'number' },
          { id: 'fts_para', label: 'Para', type: 'number' },
          { id: 'fts_abortion', label: 'Abortion', type: 'number' },
          { id: 'fts_live', label: 'Live', type: 'number' },
          {
            id: 'fts_history_table',
            label: 'Detailed Pregnancy Record',
            type: 'dynamic-table',
            tableType: 'pregnancy',
            columns: ['Pregnancy', 'Year', 'Sex', 'B. Wt (Gms)', 'Mode of Delivery', 'Remarks']
          }
        ]
      },
      {
        id: 'fts_conception',
        title: 'Conception & ART Details',
        fields: [
          { id: 'fts_conc_type', label: 'Conception', type: 'dropdown', options: [{ label: 'Natural', value: 'natural' }, { label: 'Assisted', value: 'assisted' }] },
          { id: 'fts_art_date', label: 'Date of ART', type: 'date', conditional: { fieldId: 'fts_conc_type', operator: 'equals', value: 'assisted' } },
          {
            id: 'fts_assist_spec', label: 'Assisted Specifics', type: 'checkbox-group', options: [
              { label: 'Induced', value: 'ind' },
              { label: 'IUI', value: 'iui' },
              { label: 'IVF & ET', value: 'ivf' },
              { label: 'GIFT', value: 'gift' },
              { label: 'ICSI', value: 'icsi' },
              { label: 'Others', value: 'oth' }
            ], conditional: { fieldId: 'fts_conc_type', operator: 'equals', value: 'assisted' }
          },
          { id: 'fts_assist_others_text', label: 'Specify Others', type: 'textarea', placeholder: 'Detail the method...', conditional: { fieldId: 'fts_assist_spec', operator: 'contains', value: 'oth' } },
          { id: 'fts_details', label: 'Final Details', type: 'textarea' }
        ]
      }
    ]
  },
  '2nd and 3rd trimester OB USG': {
    name: 'Advanced 2nd/3rd Trimester Scan',
    scanType: '2nd and 3rd trimester OB USG',
    version: '2.0.0',
    sections: [
      {
        id: 'ob23_context',
        title: 'Patient & Fetal Context',
        fields: [
          { id: 'ep_fetus_qty', label: 'Number of Fetuses', type: 'number', defaultValue: 1 }
        ]
      },

      {
        id: 'ob23_biometry_matrix',
        title: 'Fetal Biometry & Growth Matrix',
        fields: [
          {
            id: 'bio_matrix',
            label: 'Growth Indicators',
            type: 'biometry-matrix',
            variables: [
              'BPD (cm)', 'OFD (cm)', 'HC (cm)', 'AC (cm)', 'FL (cm)', 'TBD 1', 'TBD 2',
              'FL/Epiphysis', 'Tibia/Epiphysis', 'Fibula/Epiphysis', 'Humerus/Epiphysis', 'Radius', 'Ulna',
              'Cerebellum (TCD)', 'Foot length', 'NT', 'Liquor', 'AFI', 'Placenta', 'Umbilical cord', 'FH / rate', 'FM'
            ]
          }
        ]
      },
      {
        id: 'ob23_anatomy',
        title: 'Organ Morphology & System Survey',
        fields: [
          {
            id: 'anatomy_check', label: 'System Review (Select Abnormalities)', type: 'checkbox-group', options: [
              { label: 'CNS', value: 'cns' }, { label: 'CVS', value: 'cvs' }, { label: 'GIT', value: 'git' }, { label: 'GUT', value: 'gut' },
              { label: 'Skeletal', value: 'skel' }, { label: 'Facial', value: 'face' }, { label: 'Hydrops', value: 'hydro' }, { label: 'Others', value: 'oth' }
            ]
          }
        ]
      },
      {
        id: 'ob23_doppler_matrix',
        title: 'Hemodynamic Doppler Matrix',
        fields: [
          {
            id: 'dop_matrix',
            label: 'Hemodynamics',
            type: 'doppler-matrix',
            vessels: ['Rt. Uterine', 'Lt. Uterine', 'Umbilical', 'MCA', 'DV']
          }
        ]
      },
      {
        id: 'ob23_prev_scans',
        title: 'Longitudinal Growth Tracking (Previous Scans)',
        fields: [
          {
            id: 'prev_scan_table',
            label: 'Historical Data',
            type: 'dynamic-table',
            columns: ['Date / Centre', 'CRL', 'BPD (cm)', 'HC (cm)', 'AC (cm)', 'FL (cm)', 'LMPAge', 'USG age', 'Remarks']
          }
        ]
      },
      {
        id: 'ob23_remarks',
        title: 'Detailed Clinical Impressions',
        fields: [
          { id: 'detailed_comments', label: 'Case Summary', type: 'textarea', rows: 6, placeholder: 'Enter detailed findings and growth analysis...' }
        ]
      }
    ]
  },
  'OB-USG-Early Pregnancy': {
    name: 'Early Pregnancy Obstetric Scan',
    scanType: 'OB-USG-Early Pregnancy',
    version: '1.0.0',
    sections: [
      {
        id: 'ep_context',
        title: 'Initial Assessment',
        fields: [
          { id: 'ep_fetus_qty', label: 'Number of Fetuses', type: 'number', placeholder: 'e.g. 1' }
        ]
      },
      {
        id: 'ep_fetus_a',
        title: 'Fetus A Parameters',
        fields: [
          { id: 'gs_a', label: 'Gestational Sac (Fetus A)', type: 'textarea', placeholder: 'Size / Position...' },
          { id: 'ys_a', label: 'Yolk Sac (Fetus A)', type: 'textarea', placeholder: 'Appearance...' },
          { id: 'crl_a', label: 'CRL (Fetus A)', type: 'textarea', placeholder: 'Measurement...' },
          { id: 'hr_a', label: 'Heart Rate (Fetus A)', type: 'textarea', placeholder: 'FH/rate...' },
          { id: 'lt_ov_a', label: 'Lt. Ovary (Position A)', type: 'textarea' },
          { id: 'rt_ov_a', label: 'Rt. Ovary (Position A)', type: 'textarea' }
        ]
      },
      {
        id: 'ep_fetus_b',
        title: 'Fetus B Parameters',
        fields: [
          { id: 'gs_b', label: 'Gestational Sac (Fetus B)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 1 } },
          { id: 'ys_b', label: 'Yolk Sac (Fetus B)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 1 } },
          { id: 'crl_b', label: 'CRL (Fetus B)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 1 } },
          { id: 'hr_b', label: 'Heart Rate (Fetus B)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 1 } },
          { id: 'lt_ov_b', label: 'Lt. Ovary (Position B)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 1 } },
          { id: 'rt_ov_b', label: 'Rt. Ovary (Position B)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 1 } }
        ]
      },
      {
        id: 'ep_fetus_c',
        title: 'Fetus C Parameters',
        fields: [
          { id: 'gs_c', label: 'Gestational Sac (Fetus C)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 2 } },
          { id: 'ys_c', label: 'Yolk Sac (Fetus C)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 2 } },
          { id: 'crl_c', label: 'CRL (Fetus C)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 2 } },
          { id: 'hr_c', label: 'Heart Rate (Fetus C)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 2 } },
          { id: 'lt_ov_c', label: 'Lt. Ovary (Position C)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 2 } },
          { id: 'rt_ov_c', label: 'Rt. Ovary (Position C)', type: 'textarea', conditional: { fieldId: 'ep_fetus_qty', operator: 'greater_than', value: 2 } }
        ]
      }
    ]
  }
};
