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
        primary: '0 100% 73%',
        'primary-foreground': '0 0% 100%',
        secondary: '210 12% 92%',
        'secondary-foreground': '216 14% 7%',
        accent: '0 100% 73%',
        'accent-foreground': '0 0% 100%',
        background: '210 17% 95%',
        foreground: '216 14% 7%',
        muted: '210 12% 92%',
        'muted-foreground': '212 9% 58%',
        card: '210 17% 98%',
        'card-foreground': '216 14% 7%',
        border: '212 12% 80%',
        input: '212 12% 80%',
        ring: '0 100% 73%',
        'gradient-start': '0 100% 73%',
        'gradient-end': '0 52% 51%',
        'neon-primary': '0 100% 73%',
        'neon-secondary': '212 100% 67%',
      },
      dark: {
        primary: '0 100% 73%',
        'primary-foreground': '0 0% 100%',
        secondary: '215 18% 13%',
        'secondary-foreground': '212 9% 58%',
        accent: '0 100% 73%',
        'accent-foreground': '0 0% 100%',
        background: '216 28% 7%',
        foreground: '40 31% 87%',
        muted: '215 18% 13%',
        'muted-foreground': '212 9% 58%',
        card: '215 21% 11%',
        'card-foreground': '40 31% 87%',
        border: '212 12% 21%',
        input: '212 12% 21%',
        ring: '0 100% 73%',
        'gradient-start': '0 100% 73%',
        'gradient-end': '0 52% 51%',
        'neon-primary': '0 100% 73%',
        'neon-secondary': '212 100% 67%',
      },
    },
  },
};

export const getTheme = (themeName?: ThemeName): Theme => {
  return themes.futurista;
};
