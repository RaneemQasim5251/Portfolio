export const theme = {
  colors: {
    primary: '#720E0E',
    darkbg: '#0B0B0B',
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      muted: '#999999'
    },
    glass: {
      bg: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      hover: 'rgba(255, 255, 255, 0.15)'
    }
  },
  fonts: {
    arabic: 'Cairo, sans-serif',
    sans: 'Inter, sans-serif'
  },
  spacing: {
    section: {
      desktop: '6rem',
      mobile: '4rem'
    },
    container: {
      desktop: '1200px',
      tablet: '768px',
      mobile: '100%'
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  transitions: {
    default: '0.3s ease',
    smooth: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.2)',
    glow: `0 0 20px rgba(114, 14, 14, 0.3)`
  },
  gradients: {
    primary: 'linear-gradient(135deg, #720E0E 0%, #A01212 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  }
}

export function getGlassStyle(opacity = 0.1) {
  return {
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: 'blur(8px)',
    border: `1px solid rgba(255, 255, 255, ${opacity * 2})`
  }
}

export function getPrimaryGlow(intensity = 0.3) {
  return `0 0 20px rgba(114, 14, 14, ${intensity})`
}

export function getResponsiveValue(value: any, breakpoint: keyof typeof theme.breakpoints) {
  const breakpointValue = parseInt(theme.breakpoints[breakpoint])
  return window.innerWidth >= breakpointValue ? value.desktop : value.mobile
}

export function getContainerWidth() {
  if (window.innerWidth >= parseInt(theme.breakpoints.xl)) {
    return theme.spacing.container.desktop
  } else if (window.innerWidth >= parseInt(theme.breakpoints.md)) {
    return theme.spacing.container.tablet
  }
  return theme.spacing.container.mobile
}