const chalk = require('chalk');
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

app.set('view engine', 'jade');
app.use(cors());
app.options('*', cors());
console.log('Starting!');
server.listen(4000);

const players = [];
let parking = 50;

Array.prototype.search = function (key, value) {
  for (let i = 0; i < this.length; i++) {
    if (this[i][key] == value) return i;
  }
  // can refer as players[player].id.....
  // To check False retuens use Number.isNumber(...)
  return false;
};

io.on('connection', (socket) => {
  // TODO support multiple games simultaneously and ability to close a game
  // TODO online/offline
  // Prompt initial money, passgo money from user
  socket.on('getPlayers', (username) => {
    console.log('Firing -> ', username);
    console.log(players);
    try {
      players[players.search('username', username)].id = socket.id;
    } catch {
      console.log('no socket id');
    }
    socket.emit('update', players);
  });

  socket.on('register', (username) => {
    let player = players.search('username', username);
    if (Number.isInteger(player)) {
      socket.emit('notification', { type: 'error', message: 'Username Already Taken' });
    } else {
      // username = username.charAt(0).toUpperCase() + username.slice(1);
      players.push({ id: socket.id, username: username, balance: 1500 });
      io.sockets.emit('notification', { type: 'info', message: username + ' has joined the game' });
      socket.emit('update', players);
      console.log(players);
      console.log(chalk.magenta('CONNECTION: ') + chalk.gray(username + ' connected'));
      io.emit('update', players);
    }
  });

  socket.on('disconnect', () => {
    console.log('disconenect');
    const player = players.search('id', socket.id);
    if (Number.isInteger(player)) {
      // Prevent duplicate notifications where user might click exit and then also close browser
      // io.sockets.emit('notification', { type: 'info', message: players[player].username + ' has left the room' });
    }
  });

  socket.on('message', (m) => {
    if (m === 'exit_notification') {
      try {
        io.sockets.emit('notification', { type: 'error', message: players[players.search('id', socket.id)].username + ' has left the game' });
      } catch {
        console.log('cant find user in db');
      }
    } else io.sockets.emit('notification', { type: 'error', message: m });
    console.log('p2p notification ');
  });

  socket.on('pay', (data) => {
    if (Number.isInteger(players.search('id', socket.id))) {
      if (data.value === undefined) data.value = 50; // pass go situation
      if (Number.isInteger(data.value) && data.value < 100000) {
        players[players.search('id', socket.id)].balance -= parseInt(data.value);
        if (data.player == 'go') {
          players[players.search('id', socket.id)].balance += 2 * parseInt(data.value); // Since we deducted before
          io.sockets.emit('update', players);
          io.sockets.emit('notification', { type: 'info', message: players[players.search('id', socket.id)].username + ' Passed Go!' });
          console.log(chalk.yellow('TRANSFER: ') + chalk.gray(players[players.search('id', socket.id)].username + ' paid a £' + data.value + ' fine'));
        } else if (data.player === 'bank') {
          io.sockets.emit('update', players);
          io.sockets.emit('notification', { type: 'info', message: players[players.search('id', socket.id)].username + ' Sent ₹' + data.value + ' to Bank' });
          console.log(chalk.yellow('TRANSFER: ') + chalk.gray(players[players.search('id', socket.id)].username + ' paid £' + data.value + ' to the bank'));
        } else if (Number.isInteger(players.search('id', data.player))) {
          players[players.search('id', data.player)].balance += parseInt(data.value);
          io.sockets.emit('update', players);
          io.sockets.emit('notification', { type: 'info', message: players[players.search('id', socket.id)].username + ' Sent ₹' + data.value + ' to ' + players[players.search('id', data.player)].username });
          console.log(chalk.yellow('TRANSFER: ') + chalk.gray(players[players.search('id', socket.id)].username + ' paid ₹' + data.value + ' to ' + players[players.search('id', data.player)].username));
        }
      }
    }
  });

  //bank
  socket.on('receive', (data) => {
    if (Number.isInteger(players.search('id', socket.id))) {
      if (Number.isInteger(data.value) && data.value < 100000) {
        players[players.search('id', socket.id)].balance += parseInt(data.value);
        io.sockets.emit('update', players);
        io.sockets.emit('notification', { type: 'info', message: players[players.search('id', socket.id)].username + ' Received ₹' + data.value + ' From Bank' });
        console.log(chalk.red('ADD: ') + chalk.gray(players[players.search('id', socket.id)].username + ' received £' + data.value));
      }
    }
  });
});
