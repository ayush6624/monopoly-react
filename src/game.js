import { Grid, Card, Spacer, Button, Input, Text, Modal, useToasts, Popover, ButtonGroup, Page, Toggle, Slider, Dot } from '@geist-ui/react';
import { useEffect, useState } from 'react';
import socket from './lib/socket';
import { Compass, Send, DollarSign, Moon, LogOut } from '@geist-ui/react-icons';
import { useHistory } from 'react-router-dom';

export default function Game(props) {
  let history = useHistory();
  const [name, setName] = useState('');
  const [gameData, setGameData] = useState('');
  const [moneyReceiver, setmoneyReceiver] = useState({ value: 0, id: null });
  const [sendMoney, setSendMoney] = useState('');
  const [moneyState, setMoneyState] = useState(true);
  const [onlineState, setOnlineState] = useState(true);
  const [moneySelected, setMoneySelected] = useState(10);

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
                        e.preventDefault();
                        payMoney(value);
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
                    // window.localStorage.clear('username');
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
            <Modal open={state} onClose={closeHandler}>
              <Modal.Title>Transaction</Modal.Title>
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
                <Slider step={5} showMarkers initialValue={10} onChange={(val) => setMoneySelected(val)} />
                <Grid>
                  <ButtonGroup type={moneyState ? 'success' : 'error'}>
                    <Button>1</Button>
                    <Button>2</Button>
                    <Button>5</Button>
                    <Button>10</Button>
                  </ButtonGroup>
                </Grid>
                <Grid>
                  <ButtonGroup type={moneyState ? 'success' : 'error'}>
                    <Button>50</Button>
                    <Button>100</Button>
                    <Button>500</Button>
                  </ButtonGroup>
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
                  />
                </Grid>
                <Grid>
                  <Button
                    icon={<Compass />}
                    type="success"
                    onClick={(e) => {
                      // e.preventDefault()
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
                    }}
                  >
                    <Popover
                      content={
                        <>
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
                <Card shadow>
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
                </Card>
              </Grid>
              <Grid xs={12}>
                {/* <Card shadow style={{ width: '100%', height: '100px' }} /> */}
                <Button
                  auto
                  icon={<Compass />}
                  type="success"
                  onClick={(e) => {
                    // e.preventDefault()
                    socket.emit('pay', { player: 'go' });
                  }}
                ></Button>
              </Grid>
            </Grid.Container>
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
