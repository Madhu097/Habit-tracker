# Implementation Plan - Professional Redesign

## Issues to Fix:
1. ✅ Remove all unnecessary animations (floating orbs, particles)
2. ✅ Professional color palette (soft blues, grays - less eye strain)
3. ✅ Fix input field visibility (solid backgrounds, high contrast)
4. ✅ Add dark/light toggle to dashboard
5. ✅ Fix "Failed to load habits" error

## New Color Palette:

### Light Mode:
- Background: Soft gradient from slate-50 to blue-50
- Cards: White with subtle shadow
- Primary: Blue-600 (#2563EB)
- Text: Slate-900 for primary, Slate-600 for secondary
- Borders: Slate-200
- Input backgrounds: White (solid)

### Dark Mode:
- Background: Slate-900 (solid)
- Cards: Slate-800 with border
- Primary: Blue-500 (#3B82F6)
- Text: Slate-100 for primary, Slate-400 for secondary
- Borders: Slate-700
- Input backgrounds: Slate-800 (solid)

## Files to Update:
1. `components/auth/LoginForm.tsx` - Remove animations, fix inputs, new colors
2. `components/auth/SignupForm.tsx` - Same as login
3. `app/dashboard/page.tsx` - Add dark mode toggle, new colors
4. `app/globals.css` - Update color variables

## Input Field Fix:
- Change from semi-transparent to SOLID backgrounds
- Dark mode: bg-slate-800 (not bg-slate-900/50)
- Light mode: bg-white (not bg-white/70)
- Increase border contrast
- Ensure text color is always visible

## Dashboard Toggle:
- Add toggle button in header
- Use same toggle component as login/signup
- Persist preference in localStorage
- Apply to all dashboard components
