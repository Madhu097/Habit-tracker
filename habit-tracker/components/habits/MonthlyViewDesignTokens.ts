/* Monthly View Design Tokens & Color Scheme */

/**
 * COMPLETION RATE COLOR MAPPING
 * These colors create a visual heat map effect on the calendar
 */

// Dark Mode Colors
const darkModeColors = {
    completion100: 'bg-emerald-500/80',    // 100% - Bright emerald with transparency
    completion75: 'bg-green-500/60',       // 75-99% - Green with medium transparency
    completion50: 'bg-yellow-500/60',      // 50-74% - Yellow warning
    completion25: 'bg-orange-500/60',      // 25-49% - Orange alert
    completion0: 'bg-red-500/60',          // 0-24% - Red danger
    noData: 'bg-slate-800/40',             // No logs for the day
    otherMonth: 'bg-slate-800/20',         // Days from prev/next month
};

// Light Mode Colors
const lightModeColors = {
    completion100: 'bg-emerald-400',       // 100% - Solid emerald
    completion75: 'bg-green-300',          // 75-99% - Light green
    completion50: 'bg-yellow-300',         // 50-74% - Light yellow
    completion25: 'bg-orange-300',         // 25-49% - Light orange
    completion0: 'bg-red-300',             // 0-24% - Light red
    noData: 'bg-white',                    // No logs for the day
    otherMonth: 'bg-gray-50',              // Days from prev/next month
};

/**
 * STAT CARD THEMES
 * Each statistic has its own color theme
 */

const statCardThemes = {
    completionRate: {
        gradient: {
            dark: 'from-blue-600/20 to-blue-800/20 border-blue-700/50',
            light: 'from-blue-100 to-blue-200 border-blue-300',
        },
        icon: {
            dark: 'text-blue-400',
            light: 'text-blue-600',
        },
    },
    completed: {
        gradient: {
            dark: 'from-green-600/20 to-green-800/20 border-green-700/50',
            light: 'from-green-100 to-green-200 border-green-300',
        },
        icon: {
            dark: 'text-green-400',
            light: 'text-green-600',
        },
    },
    streak: {
        gradient: {
            dark: 'from-purple-600/20 to-purple-800/20 border-purple-700/50',
            light: 'from-purple-100 to-purple-200 border-purple-300',
        },
        icon: {
            dark: 'text-purple-400',
            light: 'text-purple-600',
        },
    },
    missed: {
        gradient: {
            dark: 'from-red-600/20 to-red-800/20 border-red-700/50',
            light: 'from-red-100 to-red-200 border-red-300',
        },
        icon: {
            dark: 'text-red-400',
            light: 'text-red-600',
        },
    },
};

/**
 * GLASSMORPHIC CARD STYLES
 * Modern, premium card designs with backdrop blur
 */

const cardStyles = {
    monthNavigation: {
        dark: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 backdrop-blur-xl',
        light: 'bg-gradient-to-br from-white to-blue-50/50 border-blue-200 backdrop-blur-xl shadow-lg',
    },
    calendar: {
        dark: 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700 backdrop-blur-xl',
        light: 'bg-gradient-to-br from-white to-purple-50/30 border-purple-200 shadow-xl',
    },
};

/**
 * BUTTON STYLES
 * Navigation and filter button designs
 */

const buttonStyles = {
    navigation: {
        dark: 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300',
        light: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    },
    filterActive: {
        dark: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30',
        light: 'bg-blue-600 text-white shadow-lg shadow-blue-300/50',
    },
    filterInactive: {
        dark: 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50',
        light: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
};

/**
 * ANIMATION VARIANTS
 * Framer Motion animation configurations
 */

const animations = {
    // Card entrance animation
    cardEntrance: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
    },

    // Stat card hover
    statCardHover: {
        whileHover: { scale: 1.05, y: -5 },
    },

    // Calendar day stagger
    calendarDayStagger: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: (index) => ({ delay: index * 0.01 }),
    },

    // Month transition
    monthTransition: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
};

/**
 * SPACING & SIZING
 * Consistent spacing throughout the component
 */

const spacing = {
    cardPadding: 'p-6',
    cardGap: 'gap-6',
    statCardGap: 'gap-4',
    filterGap: 'gap-2',
    calendarGap: 'gap-2',
    borderRadius: {
        card: 'rounded-2xl',
        button: 'rounded-xl',
        day: 'rounded-xl',
    },
    borderWidth: 'border-2',
};

/**
 * TYPOGRAPHY
 * Text styles for different elements
 */

const typography = {
    monthTitle: 'text-3xl font-black',
    sectionTitle: 'text-2xl font-bold',
    statValue: 'text-2xl font-black',
    statLabel: 'text-xs font-semibold uppercase tracking-wide',
    dayNumber: 'font-bold',
    weekDay: 'text-sm font-bold',
};

/**
 * RESPONSIVE BREAKPOINTS
 * Grid configurations for different screen sizes
 */

const responsive = {
    statCards: 'grid-cols-2 md:grid-cols-4',
    calendar: 'grid-cols-7', // Always 7 columns for days of week
    filters: 'flex-wrap', // Horizontal scroll on mobile
};

/**
 * SPECIAL EFFECTS
 * Unique visual effects
 */

const effects = {
    todayHighlight: 'ring-4 ring-blue-500 ring-offset-2 scale-105',
    dayHover: 'hover:scale-105 hover:shadow-lg',
    buttonHover: 'hover:scale-110',
    habitDots: 'w-1.5 h-1.5 rounded-full',
};

/**
 * USAGE EXAMPLE
 * 
 * // For a calendar day with 80% completion in dark mode:
 * <div className={`
 *   ${darkModeColors.completion75}
 *   ${spacing.borderRadius.day}
 *   ${effects.dayHover}
 *   aspect-square p-2 transition-all cursor-pointer
 * `}>
 *   <div className={typography.dayNumber}>15</div>
 * </div>
 */

export {
    darkModeColors,
    lightModeColors,
    statCardThemes,
    cardStyles,
    buttonStyles,
    animations,
    spacing,
    typography,
    responsive,
    effects,
};
