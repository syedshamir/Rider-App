const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initDb } = require('./db/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] }
});

app.set('io', io);
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.get('/', (req, res) => res.json({ status: '🚕 Taxi App API running' }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:driver', (driverId) => {
    socket.join(`driver:${driverId}`);
    console.log(`Driver ${driverId} joined their room`);
  });

  socket.on('join:owner', () => {
    socket.join('owner');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚕 Taxi App Server running on http://localhost:${PORT}`);
    console.log('📋 Default PINs:');
    console.log('   Owner    → 0000');
    console.log('   Ahmed    → 1111');
    console.log('   Mohammed → 2222');
    console.log('   Khalid   → 3333\n');
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
