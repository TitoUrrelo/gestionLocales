import { createContext, useContext, useState } from 'react';

const light = {
  bg: '#F4F2EE',
  surface: '#FFFFFF',
  surface2: '#F0EDE8',
  border: 'rgba(0,0,0,0.1)',
  textPrimary: '#1A1916',
  textSecondary: '#7A7670',
  placeholder: '#B0ADA8',
  accentText: '#185FA5',
  btnBg: '#1A1916',
  btnText: '#F4F2EE',
};

const dark = {
  bg: '#111210',
  surface: '#1C1D1B',
  surface2: '#252623',
  border: 'rgba(255,255,255,0.09)',
  textPrimary: '#EDEBE6',
  textSecondary: '#888680',
  placeholder: '#555450',
  accentText: '#7BB8E8',
  btnBg: '#EDEBE6',
  btnText: '#111210',
};

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  return (
    <ThemeContext.Provider value={{
      colors: isDark ? dark : light,
      isDark,
      toggle: () => setIsDark(p => !p),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);