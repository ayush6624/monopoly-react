import { atom, selector } from 'recoil';

const theme = atom({
  key: 'theme',
  default: 'light',
});

export { theme };
