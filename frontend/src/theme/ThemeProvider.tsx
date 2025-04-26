import { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Define theme settings
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode - Modern color scheme
          primary: {
            main: '#2563eb', // Vibrant blue
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#8b5cf6', // Purple
            light: '#a78bfa',
            dark: '#7c3aed',
            contrastText: '#ffffff',
          },
          success: {
            main: '#10b981', // Green
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
          },
          error: {
            main: '#ef4444', // Red
            light: '#f87171',
            dark: '#dc2626',
            contrastText: '#ffffff',
          },
          warning: {
            main: '#f59e0b', // Amber
            light: '#fbbf24',
            dark: '#d97706',
            contrastText: '#ffffff',
          },
          info: {
            main: '#0ea5e9', // Sky blue
            light: '#38bdf8',
            dark: '#0284c7',
            contrastText: '#ffffff',
          },
          background: {
            default: '#f8fafc', // Very light blue-gray
            paper: '#ffffff',
          },
          text: {
            primary: '#0f172a', // Slate 900 - Darker for better contrast
            secondary: '#475569', // Slate 600 - Darker for better readability
          },
        }
      : {
          // Dark mode - Modern color scheme
          primary: {
            main: '#3b82f6', // Blue
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#a78bfa', // Purple
            light: '#c4b5fd',
            dark: '#8b5cf6',
            contrastText: '#ffffff',
          },
          success: {
            main: '#34d399', // Green
            light: '#6ee7b7',
            dark: '#10b981',
            contrastText: '#ffffff',
          },
          error: {
            main: '#f87171', // Red
            light: '#fca5a5',
            dark: '#ef4444',
            contrastText: '#ffffff',
          },
          warning: {
            main: '#fbbf24', // Amber
            light: '#fcd34d',
            dark: '#f59e0b',
            contrastText: '#ffffff',
          },
          info: {
            main: '#38bdf8', // Sky blue
            light: '#7dd3fc',
            dark: '#0ea5e9',
            contrastText: '#ffffff',
          },
          background: {
            default: '#0f172a', // Slate 900
            paper: '#1e293b', // Slate 800
          },
          text: {
            primary: '#f1f5f9', // Slate 100
            secondary: '#cbd5e1', // Slate 300
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light'
            ? '0 4px 12px 0 rgba(0,0,0,0.05)'
            : '0 4px 12px 0 rgba(0,0,0,0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Create context for theme mode
type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Custom hook to use the theme context
export const useThemeMode = () => useContext(ThemeContext);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get the user's preferred color scheme
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Use localStorage to persist theme preference, defaulting to user's system preference
  const storedMode = localStorage.getItem('themeMode') as PaletteMode | null;
  const [mode, setMode] = useState<PaletteMode>(storedMode || (prefersDarkMode ? 'dark' : 'light'));

  // Toggle between light and dark modes
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Create the theme
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
