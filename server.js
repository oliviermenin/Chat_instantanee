const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const connectedUsers = new Map();

function broadcastUserList() {
  const userList = Array.from(connectedUsers.values());
  io.emit('user_list', userList);
  console.log('Liste des utilisateurs mise à jour:', userList);
}

function generateUniqueId(prefix = '') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.id);

  socket.on('register_user', (username) => {
    console.log(`Utilisateur enregistré: ${username} (${socket.id})`);
    
    connectedUsers.set(socket.id, username);
    
    io.emit('message', {
      id: generateUniqueId('system'),
      text: `${username} a rejoint le chat`,
      sender: 'Système',
      timestamp: new Date()
    });
    
    broadcastUserList();
  });

  socket.on('message', (message) => {
    console.log('Message reçu:', message);
    if (!message.id) {
      message.id = generateUniqueId('msg');
    }
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    const username = connectedUsers.get(socket.id);
    if (username) {
      console.log(`Utilisateur déconnecté: ${username} (${socket.id})`);
      
      io.emit('message', {
        id: generateUniqueId('system'),
        text: `${username} a quitté le chat`,
        sender: 'Système',
        timestamp: new Date()
      });
      
      connectedUsers.delete(socket.id);
      
      broadcastUserList();
    } else {
      console.log('Client déconnecté (non enregistré):', socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
httpServer.listen(PORT, HOST, () => {
  console.log(`Serveur WebSocket démarré sur ${HOST}:${PORT}`);
});