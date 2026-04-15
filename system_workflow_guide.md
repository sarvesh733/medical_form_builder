# Mediscan Form Builder: System Workflow & Architecture Guide

This document provides a comprehensive technical overview of the Mediscan Form Builder architecture for LLM context injection.

---

## 1. Core Architecture Pattern
The system follows a **Schema-Driven UI** pattern. The entire application state is derived from a JSON-based template that defines sections, fields, and logical rules.

## 2. File Manifest & Responsibilities

### 📂 State and Types
- **`types.ts`**: Defines the fundamental building blocks: `FieldType`, `TemplateField`, `TemplateSection`, and `MedicalTemplate`. Essential for understanding the schema structure.
- **`store.ts`**: Centralized **Zustand** store. Manages:
  - `activeTemplate`: The currently loaded schema being edited.
  - `formValues`: The dynamic data entered by the clinician (Key-Value pair of Field ID -> Value).
  - Persistence logic via `localStorage`.

### 📂 Builder Components (The Editor)
- **`Sidebar.tsx`**: The "Component Toolbox." Defines the available field types (Text, Matrix, Doppler, etc.) and handles the logic for adding them to the active template.
- **`Canvas.tsx`**: The main workspace. Handles:
  - Reordering sections via `framer-motion`'s `Reorder` component.
  - Triggering the visibility logic (`isFieldVisible`) during the build phase.
  - Section-level layout management (Standard vs. Clinical Tables).
- **`FieldRenderer.tsx`**: The UI engine for fields. It contains the logic to render every `FieldType`. This is where complex components like the **Grid Matrix**, **Biometry Matrix**, and **Dynamic Tables** are implemented.
- **`PropertiesPanel.tsx`**: The Right Sidebar. Used for configuring individual field metadata (renaming labels, adding options to dropdowns, setting validation).

### 📂 Output Engine (The Printer)
- **`PrintLayout.tsx`**: A dedicated component for generating A4-compatible reports. 
  - **Crucial**: It re-implements a read-only version of the `FieldRenderer` and `Canvas` logic optimized for paper.
  - Handles **Conditional Visibility**: Skips empty sections or fields hidden by clinical rules (e.g., hiding Fetus B parameters in singleton scans).
  - Specialized Printers: Custom logic for `grid-matrix`, `doppler-matrix`, and `biometry-matrix` to ensure high-density clinical data fits on paper.

### 📂 Data & Configuration
- **`schemas.ts`**: Contains the hardcoded medical protocols (e.g., "Abdomen & Pelvis", "Early Pregnancy Scan"). These serve as the "Starting Points" for the builder.

---

## 3. Key Data Workflows

### A. The Customization Workflow
1. User selects a protocol in `App.tsx` (Dashboard).
2. `App.tsx` loads the schema from `schemas.ts` into the `activeTemplate` in `store.ts`.
3. `Canvas.tsx` maps over `activeTemplate.sections` to render the UI.
4. User selects a field; `PropertiesPanel.tsx` opens based on `selectedFieldId`.
5. User edits label/options; `updateField` in `store.ts` updates the JSON schema in real-time.

### B. The Clinical Data Entry Workflow
1. Clinician enters data into inputs rendered by `FieldRenderer.tsx`.
2. Every change triggers `setFieldValue(fieldId, value)` in `store.ts`.
3. This populates the `formValues` object.
4. **Visibility Logic**: `Canvas.tsx` and `PrintLayout.tsx` run `isFieldVisible(field)` which checks `field.conditional` against current `formValues` to show/hide dependent fields instantly.

### C. The Print Workflow
1. User clicks "Print" (triggering browser `window.print()`).
2. CSS media queries hide the Builder UI and show the `PrintLayout.tsx` component.
3. `PrintLayout` iterates through `activeTemplate.sections`.
4. It filters `visibleFields` using the logic helper.
5. It formats dates using `formatDate` (DD-MM-YYYY).
6. It renders specialized tables for matrices, supporting multi-fetus data by checking the `ep_fetus_qty` value in `formValues`.

---

## 4. Key Logic Snippets
- **Visibility**: `String(targetValue) === String(value)` (Handles various input comparisons).
- **Matrix Naming**: Dynamic cell IDs generated as `${field.id}_${variable}_f${fetusIndex}`.
- **Table Grouping**: Uses `.reduce` to group fields in pairs/trios for high-density clinical layouts in `PrintLayout.tsx`.
