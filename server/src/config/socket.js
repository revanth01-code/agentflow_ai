const { Server } = require('socket.io');

let io;

function initSocket(server, clientUrl) {
  io = new Server(server, {
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('workflow:join', (workflowId) => {
      if (workflowId) {
        socket.join(`workflow:${workflowId}`);
      }
    });

    socket.on('execution:join', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
      }
    });
  });

  return io;
}

function emitEvent(channel, event, payload) {
  if (!io) return;
  if (channel) {
    io.to(channel).emit(event, payload);
  } else {
    io.emit(event, payload);
  }
}

module.exports = { initSocket, emitEvent };
