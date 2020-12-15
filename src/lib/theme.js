import { atom } from 'recoil';

let defaultTheme = 'light';
const savedTheme = window.localStorage.getItem('theme'); // save the users prefered mode
if (savedTheme) {
  defaultTheme = savedTheme;
} else {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; //get the default prefered mode
  defaultTheme = isDarkMode ? 'dark' : 'light';
}

const theme = atom({
  key: 'theme',
  default: defaultTheme,
});

export { theme };
