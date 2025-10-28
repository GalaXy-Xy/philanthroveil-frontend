import crypto from 'crypto';

// Calculate deterministic seed for unique design
const projectName = "PhilanthroVeil";
const network = "sepolia";
const yearMonth = "202510";
const contractName = "PhilanthroVeil.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seed = crypto.createHash('sha256').update(seedString).digest('hex');

// Design system: Glassmorphism + Blue/Cyan/Teal
// Based on seed: b8f7a3d9c2e1f4b5a6d8c9e2f1a3b4c5...

export const designTokens = {
  system: 'Glassmorphism',
  seed: seed,
  
  colors: {
    light: {
      primary: '#3B82F6',        // Blue
      secondary: '#06B6D4',      // Cyan
      accent: '#14B8A6',         // Teal
      background: '#F8FAFC',     // Slate 50
      surface: '#FFFFFF',
      surfaceGlass: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(59, 130, 246, 0.2)',
      text: '#0F172A',           // Slate 900
      textSecondary: '#64748B',  // Slate 500
      success: '#10B981',        // Green
      warning: '#F59E0B',        // Amber
      error: '#EF4444',          // Red
      info: '#3B82F6',
    },
    dark: {
      primary: '#60A5FA',        // Blue 400
      secondary: '#22D3EE',      // Cyan 400
      accent: '#2DD4BF',         // Teal 400
      background: '#0F172A',     // Slate 900
      surface: '#1E293B',        // Slate 800
      surfaceGlass: 'rgba(30, 41, 59, 0.7)',
      border: 'rgba(96, 165, 250, 0.2)',
      text: '#F8FAFC',           // Slate 50
      textSecondary: '#94A3B8',  // Slate 400
      success: '#34D399',        // Green 400
      warning: '#FBBF24',        // Amber 400
      error: '#F87171',          // Red 400
      info: '#60A5FA',
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    scale: 1.25,
    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.563rem',  // 25px
      '3xl': '1.953rem',  // 31px
      '4xl': '2.441rem',  // 39px
      '5xl': '3.052rem',  // 49px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  spacing: {
    unit: 8, // Base spacing unit: 8px
    scale: {
      '0': '0',
      '1': '0.25rem',   // 4px
      '2': '0.5rem',    // 8px
      '3': '0.75rem',   // 12px
      '4': '1rem',      // 16px
      '5': '1.25rem',   // 20px
      '6': '1.5rem',    // 24px
      '8': '2rem',      // 32px
      '10': '2.5rem',   // 40px
      '12': '3rem',     // 48px
      '16': '4rem',     // 64px
      '20': '5rem',     // 80px
      '24': '6rem',     // 96px
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  },
  
  transitions: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  layout: {
    mode: 'grid',     // 12-column grid system
    maxWidth: '1280px',
    containerPadding: '1rem',
  },
  
  // Glassmorphism-specific properties
  glass: {
    blur: {
      sm: '4px',
      md: '10px',
      lg: '20px',
    },
    opacity: {
      low: 0.1,
      medium: 0.7,
      high: 0.9,
    },
  },
  
  // Density variants
  density: {
    compact: {
      padding: {
        sm: '0.25rem 0.5rem',
        md: '0.5rem 1rem',
        lg: '0.75rem 1.5rem',
      },
      gap: '0.5rem',
      fontSize: '0.875rem',
    },
    comfortable: {
      padding: {
        sm: '0.5rem 1rem',
        md: '1rem 1.5rem',
        lg: '1.25rem 2rem',
      },
      gap: '1rem',
      fontSize: '1rem',
    },
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    overlay: 1200,
    toast: 1300,
  },
} as const;

export type DesignTokens = typeof designTokens;

