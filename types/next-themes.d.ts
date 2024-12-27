declare module 'next-themes' {
  import { ReactNode } from 'react'

  export interface UseThemeProps {
    themes?: string[]
    forcedTheme?: string
    setTheme: (theme: string) => void
    theme?: string
    resolvedTheme?: string
    systemTheme?: 'light' | 'dark'
  }

  export interface ThemeProviderProps {
    children: ReactNode
    attribute?: string
    defaultTheme?: string
    storageKey?: string
    forcedTheme?: string
    disableTransitionOnChange?: boolean
    enableSystem?: boolean
    value?: { [themeName: string]: string }
  }

  export function useTheme(): UseThemeProps
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element
}
