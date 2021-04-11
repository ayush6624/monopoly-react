import { Grid, Card, Spacer, Button, Text, useToasts, ButtonGroup, Page, Toggle, Slider, Dot } from '@geist-ui/react';
import { useEffect, useState } from 'react';
import socket from './lib/socket';
import { Compass, Send, DollarSign, Moon, LogOut } from '@geist-ui/react-icons';
import { useHistory } from 'react-router-dom';
import { pwa } from './Home';

export default function Game(props) {
  let history = useHistory();
  const [gameData, setGameData] = useState('');
  // const [moneyReceiver, setmoneyReceiver] = useState({ value: 0, id: null }); // good idea but commenting for now
  const [moneyState, setMoneyState] = useState(true);
  const [onlineState, setOnlineState] = useState(true);
  const [moneySelected, setMoneySelected] = useState(5);

  const [toasts, setToast] = useToasts();

  const payMoney = (user) => {
    console.log('trigger payMoney function');
    socket.emit('pay', { value: moneySelected, player: user.id });
    setMoneySelected(5);
  };

  const receiveMoney = () => {
    // from bank
    console.log('teigger receiveMoney function');
    socket.emit('receive', { value: moneySelected });
    setMoneySelected(5);
  };
  // First useEffect -> ComponentDidMount
  useEffect(() => {
    console.log('localstorage -> ', window.localStorage.getItem('username'));
    socket.emit('getPlayers', window.localStorage.getItem('username'));
    pwa.WakeLock();
    return () => {
      console.log('closing game.js first useEffect');
    };
  }, []);

  // Second useEffect
  useEffect(() => {
    socket.on('notification', (n) => {
      let theme_type = n.type === 'error' ? 'error' : 'success';
      setToast({ text: n.message, type: theme_type, delay: 3000 });
      if (theme_type === 'success') {
        const notificationText = {
          title: n.message,
          options: {
            // body: 'Progressive Web App Hello Notification!',
            icon: '/logo192.png',
            tag: 'pwa',
          },
        };
        pwa.Notification(notificationText);
      }
      console.log(n);
    });
    return () => {
      console.log('closing game.js second useEffect');
      socket.off('notification');
    };
  }, []);
  useEffect(() => {
    socket.on('update', (d) => {
      d.map((e, i) => (e.id === socket.id ? ([d[0], d[i]] = [d[i], d[0]]) : ''));
      console.log(d);
      setGameData([...d]);
    });
  }, []);

  if (!gameData) return 'Loading';
  return (
    <>
      <Page>
        <div className="container">
          <main>
            {/* <Row> */}
            <Grid.Container gap={1} justify="center" alignContent="center">
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
                        if (me) return;
                        console.log('card clicked -> ' + value.id);
                        payMoney({ id: value.id });
                        e.preventDefault();
                      }}
                    >
                      <h2 align="center" style={{ wordWrap: 'break-word' }}>
                        {value.username}
                      </h2>
                      <Text align="center">Balance: {value.balance}</Text>
                      <Dot style={{ marginRight: '20px' }} type={onlineState ? 'warning' : 'error'}>
                        {onlineState ? 'Online' : 'Offline'}
                      </Dot>
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
                    socket.emit('message', 'exit_notification');
                    history.push('/');
                  }}
                >
                  Exit!
                </Button>
                <Text align="center" p>
                  If you want to continue later, Simply close the game. It is automatically saved!
                </Text>
              </Grid>
            </Grid.Container>
            <Spacer y={1} />
            <Card hoverable shadow>
              <Grid.Container gap={2} justify="center" alignItems="center" direction="row">
                <Grid xs={24}>
                  <DollarSign />
                  <h4 align="center">{moneyState ? moneySelected : -1 * moneySelected}</h4>
                </Grid>
                <Grid>
                  <Toggle
                    initialChecked
                    size="large"
                    onChange={(e) => {
                      setMoneyState(e.target.checked);
                    }}
                  />
                </Grid>
                <Slider step={5} showMarkers initialValue={5} value={moneySelected} onChange={(val) => setMoneySelected(val)} />
                <Grid>
                  <ButtonGroup type={moneyState ? 'success' : 'error'}>
                    <Button
                      onClick={() => {
                        setMoneySelected(moneySelected + 1);
                      }}
                    >
                      1{' '}
                    </Button>
                    <Button
                      onClick={() => {
                        setMoneySelected(moneySelected + 2);
                      }}
                    >
                      2
                    </Button>
                    <Button
                      onClick={() => {
                        setMoneySelected(moneySelected + 5);
                      }}
                    >
                      5
                    </Button>
                    <Button
                      onClick={() => {
                        setMoneySelected(moneySelected + 10);
                      }}
                    >
                      10
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid>
                  <ButtonGroup type={moneyState ? 'success' : 'error'}>
                    <Button
                      onClick={() => {
                        setMoneySelected(moneySelected + 50);
                      }}
                    >
                      50
                    </Button>
                    <Button
                      onClick={() => {
                        setMoneySelected(moneySelected + 100);
                      }}
                    >
                      100
                    </Button>
                    <Button
                      onClick={() => {
                        setMoneySelected(moneySelected + 500);
                      }}
                    >
                      500
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid>
                  <Button
                    htmlType="submit"
                    icon={<Send />}
                    type="success"
                    onClick={(e) => {
                      console.log('clicking send icon');
                      payMoney({ id: 'bank' });
                    }}
                  />
                </Grid>
                <Grid>
                  <Button
                    icon={<Compass />}
                    type="success"
                    onClick={(e) => {
                      socket.emit('pay', { player: 'go' });
                    }}
                  ></Button>
                </Grid>
                <Grid>
                  <Button
                    icon={<DollarSign />}
                    type="success"
                    onClick={(e) => {
                      console.log('receive money click');
                      receiveMoney();
                    }}
                  ></Button>
                </Grid>
              </Grid.Container>
            </Card>
            {/* </Row> */}
          </main>
        </div>

        <style jsx>{`
          .container {
            touch-action: manipulation;
          }
        `}</style>
      </Page>
    </>
  );
}
