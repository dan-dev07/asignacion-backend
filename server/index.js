const express = require('express');
const {createServer} = require('node:http');
const {Server} = require('socket.io');
const cors = require('cors');
const { SocketServer } = require('./socket');
const { dbConnection } = require('../database/config');

const app = express();
const PORT = process.env.PORT || 8080;
const server = createServer(app);

const io = new Server(server, {
  cors:{
    origin: ['http://localhost:5173', 'http://189.131.186.39:5173','https://jovial-malasada-025646.netlify.app'],
    credentials:true
  }
});

dbConnection();

app.use((req, res, next ) => {
  req.io = io;
  next();
});

app.use(express.json());

app.use(cors());

app.use('/api/Login', require('../router/auth'));
app.use('/api/Usuarios', require('../router/usuarios'));
app.use('/api/whatsapp', require('../router/whatsapp'));
app.use('/api/Datos', require('../router/datos'));
app.use('/api/Media', require('../router/media'));

SocketServer(io);

server.listen(PORT, () => {
  console.log('Servidor corriendo en el puerto: ', PORT);
});