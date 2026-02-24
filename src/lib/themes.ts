export type ThemeName = 'futurista';

export interface ThemeColors {
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  accent: string;
  'accent-foreground': string;
  background: string;
  foreground: string;
  muted: string;
  'muted-foreground': string;
  card: string;
  'card-foreground': string;
  border: string;
  input: string;
  ring: string;
  'gradient-start': string;
  'gradient-end': string;
  'neon-primary': string;
  'neon-secondary': string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  emoji: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

// ORKA Theme
export const themes: Record<ThemeName, Theme> = {
  futurista: {
    name: 'futurista',
    displayName: 'ORKA',
    description: 'Design moderno, clean e focado em dados',
    emoji: '🐋',
    colors: {
      light: {
        primary: '220 100% 50%',
        'primary-foreground': '0 0% 100%',
        secondary: '210 40% 96%',
        'secondary-foreground': '215 28% 17%',
        accent: '220 100% 50%',
        'accent-foreground': '0 0% 100%',
        background: '0 0% 100%',
        foreground: '215 28% 17%',
        muted: '210 40% 98%',
        'muted-foreground': '215 16% 47%',
        card: '210 40% 98%',
        'card-foreground': '215 28% 17%',
        border: '214 32% 91%',
        input: '214 32% 91%',
        ring: '220 100% 50%',
        'gradient-start': '220 100% 50%',
        'gradient-end': '220 100% 30%',
        'neon-primary': '220 100% 50%',
        'neon-secondary': '210 85% 55%',
      },
      dark: {
        primary: '220 100% 50%',
        'primary-foreground': '0 0% 100%',
        secondary: '217 33% 17%',
        'secondary-foreground': '215 20% 65%',
        accent: '220 100% 50%',
        'accent-foreground': '0 0% 100%',
        background: '220 16% 4%',
        foreground: '0 0% 100%',
        muted: '217 33% 17%',
        'muted-foreground': '215 20% 65%',
        card: '220 14% 8%',
        'card-foreground': '0 0% 100%',
        border: '217 33% 17%',
        input: '217 33% 17%',
        ring: '220 100% 50%',
        'gradient-start': '220 100% 50%',
        'gradient-end': '220 100% 30%',
        'neon-primary': '220 100% 50%',
        'neon-secondary': '210 85% 60%',
      },
    },
  },
};

export const getTheme = (themeName?: ThemeName): Theme => {
  return themes.futurista;
};
