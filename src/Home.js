import { Card, Text, Input, Button, Spacer } from '@geist-ui/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Install from './installPrompt';
import socket from './lib/socket';
import pwafire from 'pwafire';
export const pwa = pwafire.pwa;

export default function Home() {
  let history = useHistory();
  const [name, setName] = useState('');
  const [notification, setNotification] = useState('');
  const [oldGame, setOldGame] = useState('');

  useEffect(() => {
    let prevGame = window.localStorage.getItem('username');
    if (prevGame) {
      console.log('prev game ->  ', prevGame);
      setOldGame(prevGame);
    }
  }, []);

  useEffect(() => {
    socket.on('notification', (n) => {
      console.log('index notifications -> ', n);
      setNotification(n);
    });
    return () => {
      console.log('turn off notification index');
      socket.off('notification');
    };
  }, []);

  // Third useEffect -> notification
  useEffect(() => {
    if (notification) console.log(notification);
    if (notification.message?.includes('has joined the game')) {
      const data = {
        title: notification.message,
        options: {
          icon: '/logo192.png',
          tag: 'pwa',
        },
      };
      pwa.Notification(data);
      window.localStorage.setItem('username', name);
      setTimeout(() => {
        console.log('MOCK ROUTING TO /PAGE');
        history.push('/game');
      }, 500);
    }

    return () => {
      console.log('notification and pushing unmount');
    };
  }, [notification]);

  return (
    <>
      <Install />
      <div className="container">
        <main>
          <h1 className="title">
            <a>Digital Monopoly</a>
          </h1>
          <p className="description">Easy Financial Management</p>

          <Card hoverable shadow width="300px">
            <h4 align="center"> Enter Your Name </h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name !== '') {
                  socket.emit('register', name);
                }
              }}
            >
              <Input onChange={(e) => setName(e.target.value)}></Input>
              <Spacer y={0.5}></Spacer>
              <Button type="success" htmlType="submit">
                Proceed
              </Button>
            </form>

            {notification ? (
              <Text align="center" type={notification.type}>
                {notification.message}
              </Text>
            ) : (
              ''
            )}
            {oldGame ? (
              <>
                <Spacer y={0.5}></Spacer>
                <Button
                  type="secondary"
                  onClick={() => {
                    console.log('clicked on prev game');
                    history.push('/game');
                  }}
                >
                  Join Previous Game!
                </Button>
              </>
            ) : (
              ''
            )}
          </Card>
        </main>

        <footer>
          <h4>Made By Ayush Goyal</h4>
        </footer>

        <style jsx>{`
          .container {
            min-height: 100vh;
            padding: 0 0.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          main {
            padding: 5rem 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          footer {
            width: 100%;
            height: 100px;
            border-top: 1px solid #eaeaea;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .title:hover {
            text-decoration: underline;
          }

          footer img {
            margin-left: 0.5rem;
          }

          footer a {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          @media (max-width: 600px) {
            .grid {
              width: 100%;
              flex-direction: column;
            }
          }
        `}</style>

        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </div>
    </>
  );
}
