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

// ORKA Theme — Paleta A (Dark-first, Coral Primary)
export const themes: Record<ThemeName, Theme> = {
  futurista: {
    name: 'futurista',
    displayName: 'ORKA',
    description: 'Design moderno, dark-first com acentos coral',
    emoji: '🐋',
    colors: {
      light: {
        primary: '198 82% 25%',
        'primary-foreground': '0 0% 100%',
        secondary: '0 0% 90%',
        'secondary-foreground': '204 84% 16%',
        accent: '25 100% 50%',
        'accent-foreground': '0 0% 100%',
        background: '0 0% 95%',
        foreground: '204 84% 16%',
        muted: '0 0% 90%',
        'muted-foreground': '200 10% 46%',
        card: '0 0% 100%',
        'card-foreground': '204 84% 16%',
        border: '0 0% 85%',
        input: '0 0% 85%',
        ring: '198 82% 25%',
        'gradient-start': '198 82% 25%',
        'gradient-end': '204 84% 16%',
        'neon-primary': '198 82% 25%',
        'neon-secondary': '25 100% 50%',
      },
      dark: {
        primary: '198 70% 40%',
        'primary-foreground': '0 0% 100%',
        secondary: '200 40% 14%',
        'secondary-foreground': '200 10% 60%',
        accent: '25 100% 50%',
        'accent-foreground': '0 0% 100%',
        background: '204 84% 16%',
        foreground: '0 0% 92%',
        muted: '200 40% 14%',
        'muted-foreground': '200 10% 55%',
        card: '200 60% 12%',
        'card-foreground': '0 0% 92%',
        border: '200 30% 20%',
        input: '200 30% 20%',
        ring: '198 70% 40%',
        'gradient-start': '198 70% 40%',
        'gradient-end': '198 82% 25%',
        'neon-primary': '198 70% 40%',
        'neon-secondary': '25 100% 50%',
      },
    },
  },
};

export const getTheme = (themeName?: ThemeName): Theme => {
  return themes.futurista;
};
