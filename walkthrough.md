# Mediview Designer: Technical Walkthrough

This document outlines the architecture and design decisions for the Futuristic Medical Template Builder.

## 🏗️ Architecture Overview

The system is built as a schema-driven React application, ensuring that any medical template can be serialized to JSON and recreated.

### 🧩 Core Components
- **Dashboard**: The gateway where practitioners select the "Type of Scan".
- **Sidebar (Toolbox)**: Contains draggable medical-grade input components.
- **Canvas (Builder)**: A multi-section drop zone where templates are structured.
- **Properties Panel**: A contextual inspector that appears when a field is selected, allowing for logic and validation settings.

## 🎨 Design System (Futuristic Medical)

The UI follows a "Glassmorphic Neon" aesthetic to provide a high-tech, medical-grade feel:
- **Base**: Deep indigo/obsidian background (`#05060f`).
- **Accents**: Cyan (`#00f2fe`) for primary actions, Magenta for media, and Emerald for data.
- **Materials**: `backdrop-blur-xl` foundations with 10% white borders for the "glass" effect.
- **Micro-animations**: Leverages `framer-motion` for layout transitions and neon glows.

## ⚙️ Key Functional Features

### 1. Dynamic Schema Loading
The builder doesn't start from scratch. Each scan type (e.g., *Fetal ECO*) initializes with a preset of standard sections and fields defined in `schemas.ts`.

### 2. State management with Zustand
A centralized store (`store.ts`) handles:
- Template versioning.
- Field CRUD operations.
- UI state (selected field, active template).

### 3. Conditional Visibility
Implemented a logic engine where fields can have a `conditional` property. 
*Example: If "OB History Available" is checked → Show the "Upload History" field.*

### 4. Media & Advanced Fields
Specialized renderers for:
- **Region Selector**: For mapping clinical findings to anatomical locations.
- **Dynamic Video**: For fetal cardiac loops or USG peristalsis.
- **Static Image**: For standard X-ray/USG captures.

## 📂 Project Structure
```text
medical-builder/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Modular Components
│   │   ├── store.ts         # Zustand State
│   │   ├── types.ts         # TypeScript Definitions
│   │   ├── schemas.ts       # Predefined Scan Schemas
│   │   └── App.tsx          # Main Layout & Dashboard
│   ├── tailwind.config.js   # Design Tokens
│   └── index.css            # Global Glassmorphic Styles
└── backend/
    └── venv/                # Ready for FastAPI integration
```

## 🚀 Future Scalability
The `MedicalTemplate` interface is designed to be DICOM-compliant, allowing future integration with PACS (Picture Archiving and Communication Systems) by mapping field IDs to standard DICOM tags.
