import io from 'socket.io-client';

let url = 'http://192.168.1.124:4000';
if (process.env.NODE_ENV === 'production') url = 'https://monopoly-backend.ayushgoyal.dev';
const socket = io(url);
export default socket;
