# 🎨 HabitFlow - Branding Guide & Logo System

## 🚀 **NEW: Code-Based Logo Engine**

We have upgraded to a **React Component Logo System** (`components/ui/Logo.tsx`).

### **Why this is better:**
1. **Perfect Transparency**: No white boxes or background glitches.
2. **Infinite Scaling**: SVG vectors look crisp at any resolution.
3. **Dynamic Theming**: Automatically adjusts for Light/Dark mode.
4. **Performance**: No network request for image files.

---

## 🛠️ **Implementation**

### **Using the Logo Component**

```tsx
import Logo from '@/components/ui/Logo';

// Default Usage (Auto Theme)
<Logo />

// Custom Sourcing
<Logo darkMode={true} iconSize={48} textSize="text-3xl" />

// Icon Only
<Logo showText={false} />
```

### **Component Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | "" | Custom classes for wrapper |
| `showText` | boolean | true | Show/Hide "HabitFlow" text |
| `darkMode` | boolean | false | Forces white text for dark backgrounds |
| `iconSize` | number | 32 | Size of the circular icon in pixels |
| `textSize` | string | "text-xl" | Tailwind class for font size |

---

## 📦 **Asset Files (External Use Only)**

The PNG files are still available in `public/` for external use (social media, marketing, app stores), but the app uses the `Logo` component internally.

- `public/logo-main.png` - App Icon
- `public/logo-horizontal.png` - Light Marketing Logo
- `public/logo-dark.png` - Dark Marketing Logo
- `public/favicon.png` - Browser Favicon

---

## 🎨 **Brand Identity**

**HabitFlow** represents:
- 📈 **Progress**: Continuous growth and improvement
- ✅ **Achievement**: Completing daily habits
- 🔄 **Consistency**: Building lasting routines
- 💪 **Empowerment**: Taking control of your life

### **Brand Gradients**
- **Purple**: `#8B5CF6` (Violet-500)
- **Blue**: `#3B82F6` (Blue-500)
- **Gradient**: `linear-gradient(to right, #8B5CF6, #3B82F6)`

---

## 📝 **Changelog**

- **v2.0**: Switched from PNG images to pure SVG React Component for Navbar and Auth screens to solve transparency and resolution issues.
- **v1.0**: Initial PNG asset generation.
