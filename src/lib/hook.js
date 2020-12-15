import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { theme as atomTheme } from './theme';

const useLocalStorageState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const persistedValue = localStorage.getItem(key);
    return persistedValue !== null ? persistedValue : initialValue;
    // If localstorage key is not null, return the value from strage, or return the original given value
  });

  useEffect(() => {
    console.log('hook useffect called');
    localStorage.setItem(key, value);
  }, [key, value]);
  // if key/value is changed

  return [value, setValue];
};

const useDarkMode = () => {
  const [theme, setTheme] = useRecoilState(atomTheme);

  const saveTheme = (chosenTheme) => {
    setTheme(chosenTheme);
    window.localStorage.setItem('theme', chosenTheme);
  };

  const toggleTheme = () => {
    saveTheme(theme === 'light' ? 'dark' : 'light');
  };

  return [theme, toggleTheme];
};

export { useLocalStorageState, useDarkMode };
