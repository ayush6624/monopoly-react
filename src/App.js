import { CssBaseline, GeistProvider } from '@geist-ui/react';
import { useRecoilState } from 'recoil';
import { theme } from './lib/theme';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Game from './game';
import { useEffect } from 'react';

export default function App() {
  const [themeState, setThemeState] = useRecoilState(theme);

  const changeTheme = () => {
    setThemeState(themeState === 'dark' ? 'light' : 'dark');
  };
  useEffect(() => {
    console.log('theme changed -> ', themeState);
    window.localStorage.setItem('theme', themeState);
  }, [themeState]);

  return (
    <>
      <GeistProvider theme={{ type: themeState }}>
        <CssBaseline />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/game">
            <Game changeTheme={changeTheme} />
          </Route>
        </Switch>
      </GeistProvider>
    </>
  );
}
