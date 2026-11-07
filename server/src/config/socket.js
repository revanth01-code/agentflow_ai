let io;

function initSocket(server, clientUrl) {
  // TODO: Create the socket.io server with CORS for clientUrl and handle the
  // TODO: 'workflow:join' and 'execution:join' events by joining the matching rooms.
  return io;
}

function emitEvent(channel, event, payload) {
  // TODO: Emit the event to the given room, or broadcast it when no channel is passed.
}

module.exports = { initSocket, emitEvent };
