import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [colorScheme, setColorScheme] = useState('light');

  useEffect(() => {
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setColorScheme('dark');
    }

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setColorScheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1F2233',
    secondaryText: isDark ? '#A1A1AA' : '#6F7683',
    tertiaryText: isDark ? '#71717A' : '#9CA3AF',
    border: isDark ? '#2A2A2A' : '#E5E7EB',
    searchBorder: isDark ? '#2A2A2A' : '#D9DDEA',
    searchBackground: isDark ? '#1E1E1E' : '#FFFFFF',
    cardBackground: isDark ? '#1E1E1E' : '#FFFFFF',
    separatorColor: isDark ? '#2A2A2A' : '#F2F3F5',
    tabActiveColor: isDark ? '#FFFFFF' : '#1E2533',
    tabInactiveColor: isDark ? '#A1A1AA' : '#6C7488',
    emptyStateBg: isDark ? '#1E1E1E' : '#F8F9FA',
    emptyStateIcon: isDark ? '#71717A' : '#6F7683',
    accentCardBg: isDark ? '#262626' : '#FFFFFF',
    badgeBackground: isDark ? '#2563EB' : '#2563EB',
    placeholderText: isDark ? '#71717A' : '#6C7488',
    profileBadge: isDark ? '#1E1E1E' : '#E5DFFB',
    divider: isDark ? '#2A2A2A' : '#EAECF0',
  };

  return {
    colors,
    isDark,
    colorScheme,
  };
};