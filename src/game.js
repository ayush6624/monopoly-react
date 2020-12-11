import { Grid, Card, Spacer, Button, Input, Text, Modal, useToasts, Popover } from '@geist-ui/react';
import { useEffect, useState, useCallback } from 'react';
import socket from './lib/socket';
import { Compass, Send, DollarSign, Moon, LogOut } from '@geist-ui/react-icons';
import { useHistory } from 'react-router-dom';

export default function Game(props) {
  //   const router = useRouter();
  let history = useHistory();
  const [name, setName] = useState('');
  const [gameData, setGameData] = useState('');
  const [moneyReceiver, setmoneyReceiver] = useState({ value: 0, id: null });
  const [sendMoney, setSendMoney] = useState('');

  const [state, setState] = useState(false);
  const handler = () => setState(!state);
  const closeHandler = (event) => {
    setState(false);
  };

  const [toasts, setToast] = useToasts();

  const payMoney = (user) => {
    setmoneyReceiver({ ...moneyReceiver, id: user.id });
    handler();
  };
  // First useEffect -> ComponentDidMount
  useEffect(() => {
    console.log('GAME.JS');
    console.log('localstorage -> ', window.localStorage.getItem('username'));
    socket.emit('getPlayers', window.localStorage.getItem('username'));
    return () => {
      console.log('closing game.js first useEffect');
    };
  }, []);

  // Second useEffect
  useEffect(() => {
    socket.on('notification', (n) => {
      let theme_type = n.type === 'error' ? 'error' : 'success';
      setToast({ text: n.message, type: theme_type, delay: 3000 });
      console.log(n);
    });
    return () => {
      console.log('closing game.js second useEffect');
      socket.off('notification');
    };
  }, []);
  useEffect(() => {
    socket.on('update', (d) => {
      setGameData([...d]);
    });
  }, []);

  if (!gameData) return 'Loading';
  return (
    <>
      <div className="container">
        <main>
          {/* <Row> */}
          <Grid.Container gap={2} justify="center">
            {gameData.map((value, index) => {
              let me = false;
              if (value.id === socket.id) me = true;
              return (
                <Grid key={index} xs={12}>
                  <Card
                    hoverable
                    shadow
                    type={me ? 'success' : 'default'}
                    // style={{ width: '100%', height: '100%' }}
                    onClick={(e) => {
                      e.preventDefault();
                      payMoney(value);
                    }}
                  >
                    <h1 align="center">{value.username}</h1>
                    <Text align="center">Balance: {value.balance}</Text>
                  </Card>
                </Grid>
              );
            })}
            <Grid xs={12}>
              <Button
                icon={<Moon />}
                onClick={() => {
                  props.changeTheme();
                }}
              >
                Change Theme!
              </Button>
              <Button
                icon={<LogOut />}
                type="error"
                onClick={() => {
                  // window.localStorage.clear('username');
                  socket.emit('message', 'exit_notification');
                  //   router.push('/'); // Commented
                  //   <Redirect to="/" />;
                  history.push('/');
                }}
              >
                Exit!
              </Button>
              <Text>If you want to continue later, Simply close the game. It is automatically saved!</Text>
            </Grid>
          </Grid.Container>
          <Modal open={state} onClose={closeHandler}>
            <Modal.Title>Transaction</Modal.Title>
            {/* <Modal.Subtitle>This is a modal</Modal.Subtitle> */}
            <Modal.Content>
              <Input
                type="number"
                clearable
                placeholder="Amount"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    socket.emit('pay', { value: moneyReceiver.value, player: moneyReceiver.id });
                    setmoneyReceiver({ value: 0, id: null });
                    handler();
                  }
                }}
                onChange={(e) => {
                  let input = e.target.value;
                  if (input >= 0) setmoneyReceiver({ ...moneyReceiver, value: parseInt(input) });
                  else socket.emit('message', 'Player entered -ve value!');
                }}
              >
                {' '}
                Money{' '}
              </Input>
            </Modal.Content>
            <Modal.Action passive onClick={() => setState(false)}>
              Cancel
            </Modal.Action>
            <Modal.Action
              onClick={() => {
                console.log(moneyReceiver);
                socket.emit('pay', { value: moneyReceiver.value, player: moneyReceiver.id });
                handler();
              }}
            >
              Submit
            </Modal.Action>
          </Modal>
          <Spacer y={1} />
          <Card hoverable shadow>
            <Grid.Container gap={2} justify="center">
              <Grid xs={24}>
                <h4 align="center">Common Actions!</h4>
              </Grid>
              <Grid>
                <Button
                  htmlType="submit"
                  icon={<Send />}
                  type="success"
                  onClick={(e) => {
                    // e.preventDefault();
                    payMoney({ id: 'bank' });
                  }}
                >
                  Pay To Bank
                </Button>
              </Grid>
              <Grid>
                <Button
                  icon={<Compass />}
                  type="success"
                  onClick={(e) => {
                    // e.preventDefault()
                    socket.emit('pay', { player: 'go' });
                  }}
                >
                  Pass Go
                </Button>
              </Grid>
              <Grid>
                <Button
                  icon={<DollarSign />}
                  type="success"
                  onClick={(e) => {
                    console.log('receive money click');
                  }}
                >
                  <Popover
                    content={
                      <>
                        <Popover.Item title>
                          <span>Enter Amount</span>
                        </Popover.Item>
                        <Popover.Item>
                          <Input onChange={(e) => setSendMoney({ value: parseInt(e.target.value) })} size="small" width="100%" type="number" clearable placeholder="Amount"></Input>
                        </Popover.Item>
                        <Popover.Item>
                          <Button
                            type="secondary"
                            onClick={(e) => {
                              console.log(sendMoney);
                              socket.emit('receive', sendMoney);
                              console.log('receive moeny');
                            }}
                          >
                            Submit
                          </Button>
                        </Popover.Item>
                      </>
                    }
                  >
                    From Bank
                  </Popover>
                </Button>
              </Grid>
            </Grid.Container>
          </Card>
          <Spacer y={2} />
          <Grid.Container gap={2} justify="center">
            <Grid xs={12}>
              <Card shadow style={{ width: '100%', height: '100px' }} />
            </Grid>
            <Grid xs={12}>
              <Card shadow style={{ width: '100%', height: '100px' }} />
            </Grid>
          </Grid.Container>
          {/* </Row> */}
        </main>
      </div>
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

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
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
    </>
  );
}
