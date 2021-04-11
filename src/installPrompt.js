import PWAInstallerPrompt from 'react-pwa-installer-prompt';
import { Button } from '@geist-ui/react';
import { pwa } from './Home';

const Install = () => {
  return (
    <PWAInstallerPrompt
      render={({ onClick }) => (
        <Button size="mini" type="Button" onClick={onClick}>
          Install
        </Button>
      )}
      callback={(data) => console.log(data)}
    />
  );
};
export default Install;
