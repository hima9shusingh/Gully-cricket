const http = require('http');
const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const { Server } = require('socket.io');

// Connect to database
connectDB();

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // For development. Update in production.
    methods: ['GET', 'POST']
  }
});

// Attach socket io to app so we can use it in controllers
app.set('io', io);

// Basic socket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`Socket ${socket.id} joined room match_${matchId}`);
  });

  socket.on('leave_match', (matchId) => {
    socket.leave(`match_${matchId}`);
    console.log(`Socket ${socket.id} left room match_${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = env.port;
server.listen(PORT, () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
});
