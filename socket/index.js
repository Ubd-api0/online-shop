const socketIO = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const dotenv = require('dotenv');
// config
dotenv.config();

const allowedOrigins = [
  'http://localhost:3030',
  'https://eb24-182-177-144-64.ngrok-free.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Origin:', origin);

      if (!origin) {
        console.log('a');
        // allow Postman / mobile / server requests
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log('b');
        return callback(null, true);
      }

      console.log('c');
      return callback(null, true); // 🔥 TEMP: allow all (for debugging)
      // return callback(new Error("CORS blocked"));
    },
  })
);

console.log('socket server');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello world from socket server!');
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

// Define a message object with a seen property
const createMessage = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
});

io.on('connection', (socket) => {
  // when connect
  //   console.log(`a user is connected`);

  // take userId and socketId from user
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  // send and get message
  const messages = {}; // Object to track messages sent to each user

  socket.on('sendMessage', ({ senderId, receiverId, text, images }) => {
    const message = createMessage({ senderId, receiverId, text, images });

    const user = getUser(receiverId);

    // Store the messages in the `messages` object
    if (!messages[receiverId]) {
      messages[receiverId] = [message];
    } else {
      messages[receiverId].push(message);
    }

    // send the message to the recevier
    io.to(user?.socketId).emit('getMessage', message);
  });

  socket.on('messageSeen', ({ senderId, receiverId, messageId }) => {
    const user = getUser(senderId);

    // update the seen flag for the message
    if (messages[senderId]) {
      const message = messages[senderId].find(
        (message) =>
          message.receiverId === receiverId && message.id === messageId
      );
      if (message) {
        message.seen = true;

        // send a message seen event to the sender
        io.to(user?.socketId).emit('messageSeen', {
          senderId,
          receiverId,
          messageId,
        });
      }
    }
  });

  // update and get last message
  socket.on('updateLastMessage', ({ lastMessage, lastMessagesId }) => {
    io.emit('getLastMessage', {
      lastMessage,
      lastMessagesId,
    });
  });

  //when disconnect
  socket.on('disconnect', () => {
    // console.log(`a user disconnected!`);
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`server is running on port ${process.env.PORT || 4000}`);
});
