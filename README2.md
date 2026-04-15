# Mediscan Form Builder Studio

Mediscan Form Builder is a state-of-the-art, schema-driven reporting engine designed for specialized medical imaging and clinical workflows. It allows clinicians to build, customize, and deploy complex diagnostic reporting templates with a focus on obstetric and radiological standards.

## 🚀 Key Features

### 🛠️ Interactive Schema Builder
- **Drag-and-Drop Toolbox**: Easily add standard inputs (Text, Number, Date, Multi-Select) and specialized medical components.
- **Real-time Canvas**: A precise, visual representation of the clinical form with instant hierarchy reordering.
- **Property Inspector**: Configure advanced field properties including validation, placeholder text, and internal database IDs.

### 📊 Advanced Medical Matrices
- **Biometry Matrix**: Specialized table for fetal growth measurements (BPD, HC, AC, FL) with automated multi-fetus scaling.
- **Doppler Matrix**: Clinical hemodynamics tracker supporting Systolic/Diastolic/R.I. measurements for Fetus A, B, and C.
- **Grid Matrix**: Dynamic n-column tables for custom clinical findings and systematic checklists.

### 📄 Professional Print Engine
- **A4 Optimized Layouts**: Hospital-grade report generation with clean typography and high-contrast clinical tables.
- **Dynamic Context Visibility**: Automatically hides empty or irrelevant sections (e.g., hiding twin parameters for singleton pregnancies).
- **Branded Headers**: Integrated institutional branding with scan-specific metadata.

### 🧠 Intelligent Logic
- **Conditional Visibility**: Show or hide fields based on clinical rules (e.g., "Show ART details only if In-Vitro Fertilization is selected").
- **AI-Enhanced Mapping**: Built-in support for mapping clinical fields to DICOM standards for interoperability.

## 💻 Tech Stack
- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS (Medical UI Theme)
- **State Management**: Zustand (Persistent Local Storage)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📂 Project Structure
- `/frontend/src/components`: Core UI components (Canvas, Sidebar, PrintLayout).
- `/frontend/src/store`: Centralized state management for templates and form data.
- `/frontend/src/schemas.ts`: Pre-defined clinical protocols (Abdomen, OB, Fetal ECO).
- `/frontend/src/types.ts`: TypeScript interfaces for the Template System.

## 🛠️ Getting Started
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Launch development server: `npm run dev`
4. Access the studio at `http://localhost:5173`

---
*© 2026 Mediscan Technologies. All rights reserved.*
