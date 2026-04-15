# Landing Page Setup Guide

## Overview
This guide walks you through the new landing page and authentication flow that has been created for MedicalBuilder.

## What's New

### New Components Created

1. **Landing Page** (`src/pages/LandingPage.tsx`)
   - Professional hero section with feature highlights
   - Call-to-action buttons for registration and login
   - Benefits section showcasing key features
   - Responsive design with Framer Motion animations

2. **Register Page** (`src/pages/Register.tsx`)
   - User registration form with validation
   - Fields: First Name, Last Name, Email, Phone, Organization
   - Password strength requirements (minimum 8 characters)
   - Password confirmation matching
   - Terms & Conditions checkbox
   - Real-time form validation with error messages

3. **Login Page** (`src/pages/Login.tsx`)
   - Simple, intuitive login form
   - Email and password fields
   - "Remember me" checkbox
   - "Forgot password?" link (placeholder for future implementation)
   - Demo credentials display for testing

4. **Builder Page** (`src/pages/BuilderPage.tsx`)
   - Wrapper component for the medical builder interface
   - TODO: Add authentication protection to redirect unauthenticated users

5. **App Builder** (`src/AppBuilder.tsx`)
   - Renamed from original App.tsx
   - Contains the medical form builder interface
   - Dashboard with template selection

### Updated Files

1. **App.tsx** - Now serves as the main router component with routes:
   - `/` → Landing Page
   - `/register` → Registration Page
   - `/login` → Login Page
   - `/builder` → Builder Page (protected)
   - `*` → Redirects to home

2. **package.json** - Added dependencies:
   - `react-router-dom`: ^6.22.0
   - `@types/react-router-dom`: ^5.3.3

## Installation & Setup

### Step 1: Install Dependencies
```bash
cd e:\VIT\builder\medical-builder\frontend
npm install
```

This will install:
- `react-router-dom` for routing
- All other existing dependencies (Framer Motion, Zustand, Tailwind CSS, etc.)

### Step 2: Run Development Server
```bash
npm run dev
```

The app will start on `http://localhost:5173` (or similar)

### Step 3: Test the Flow
1. Navigate to `http://localhost:5173` to see the landing page
2. Click "Get Started" or "Create Account" to go to registration
3. Fill in the registration form and submit (will navigate to builder)
4. Go back and click "Sign In" to test the login page
5. After login, you'll be redirected to the builder

## Design Highlights

### Landing Page Features
- **Hero Section**: Bold gradient text with smooth animations
- **Feature Cards**: Responsive grid showcase of key features
- **Call-to-Action**: Multiple prominent buttons for registration and login
- **Professional Styling**: Modern dark theme with blue/cyan gradients
- **Animations**: Staggered entrance animations using Framer Motion

### Authentication Pages
- **Consistent Design**: Both login and registration use the same visual language
- **Form Validation**: Real-time error messages and validation feedback
- **Accessibility**: Proper labels, icons, and error states
- **Loading States**: Visual feedback during form submission
- **Password Visibility Toggle**: Eye icon to show/hide passwords

## Color Scheme
- **Primary**: Blue gradient (#3B82F6 to #06B6D4)
- **Background**: Dark slate (#0F172A to #1E293B)
- **Accents**: Cyan (#06B6D4), Light Blue (#60A5FA)
- **Text**: White and slate grays with proper contrast

## Integration TODO

### Backend Integration
1. **Register Endpoint**: `/api/auth/register`
   - Accept: `{ firstName, lastName, email, phone, organization, password }`
   - Return: `{ token, user }`

2. **Login Endpoint**: `/api/auth/login`
   - Accept: `{ email, password, rememberMe }`
   - Return: `{ token, user }`

3. **Update Register.tsx** - Currently shows success message and navigates
   - Replace the simulated API call with actual backend call
   - Add proper error handling and display

4. **Update Login.tsx** - Currently shows success message and navigates
   - Replace the simulated API call with actual backend call
   - Add proper error handling and display

### Authentication Protection
1. **Create Auth Context**: Store and manage user state globally
   - `useAuth()` hook for accessing user data
   - Token management (localStorage/sessionStorage)

2. **Protect BuilderPage**: Add authentication check
   - Redirect to login if not authenticated
   - Store user info for display in builder

3. **Add Logout**: Update Builder's navbar
   - Add logout button
   - Clear user session
   - Redirect to login

### Example Backend Integration (Register.tsx)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  try {
    const response = await fetch('http://your-backend/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    
    const { token, user } = await response.json();
    
    // Store token
    localStorage.setItem('authToken', token);
    
    // Store user data in global state (TODO: create Auth context)
    navigate('/builder');
  } catch (error) {
    setErrors({ submit: error.message });
  } finally {
    setLoading(false);
  }
};
```

## Key Files & Locations

```
frontend/src/
├── App.tsx                    # Main router component
├── AppBuilder.tsx             # Original builder interface
├── pages/
│   ├── LandingPage.tsx        # Landing page
│   ├── Register.tsx           # Registration form
│   ├── Login.tsx              # Login form
│   └── BuilderPage.tsx        # Builder wrapper
└── ... (existing components)
```

## Customization Options

### Change Colors
- Update gradient colors in the page components
- Example in LandingPage.tsx: `from-blue-400 to-cyan-400` to your preferred colors
- Tailwind color palette: https://tailwindcss.com/docs/customizing-colors

### Modify Form Fields
- Add/remove fields in Register.tsx and Login.tsx
- Update validation logic in `validateForm()` function
- Add new fields to `formData` state

### Adjust Animation Speed
- Edit `containerVariants` and `itemVariants` in each page
- Modify duration values (e.g., `duration: 0.5`)

### Change Logo / Branding
- Replace Heart icon with your own logo
- Update "MedicalBuilder" text to your brand name
- Modify color scheme in Tailwind classes

## Testing Checklist

- [ ] Landing page loads and displays correctly
- [ ] Navigation buttons work (Sign In, Create Account)
- [ ] Register form validates required fields
- [ ] Register form validates email format
- [ ] Register form validates password length (8+ characters)
- [ ] Register form validates password match
- [ ] Login form validates required fields
- [ ] Login form loads and displays correctly
- [ ] Form submission shows loading state
- [ ] Forms navigate to builder after "submission"
- [ ] All animations are smooth and performant
- [ ] Responsive design works on mobile (< 768px)
- [ ] Dark theme applies correctly
- [ ] Icon visibility toggle works on password fields

## Performance Notes

- Landing page uses Framer Motion for animations (performant)
- Form components are optimized with useState and local validation
- No heavy API calls in demo mode (ready for integration)
- Lazy loading can be implemented for pages using React.lazy()

## Future Enhancements

1. **Password Reset Flow**: Create forgot-password page and reset logic
2. **Email Verification**: Add email verification step after registration
3. **Social Login**: Add Google, Microsoft OAuth options
4. **Two-Factor Authentication**: 2FA support for security
5. **Profile Page**: User profile management
6. **Team Management**: Invite team members and assign roles
7. **Activity Logging**: Track user actions for compliance

## Support & Questions

For questions or issues with the landing page implementation:
1. Check the validation functions in Register.tsx and Login.tsx
2. Verify Tailwind CSS classes are applied correctly
3. Ensure all dependencies are installed
4. Check browser console for any errors

---

**Status**: ✅ Landing page and authentication UI Complete | ⏳ Backend integration pending
