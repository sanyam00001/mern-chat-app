const onlineUsers = new Map();

const addSocket = (userId, socketId) => {
  const id = userId.toString();
  const sockets = onlineUsers.get(id) || new Set();
  const wasOffline = sockets.size === 0;

  sockets.add(socketId);
  onlineUsers.set(id, sockets);

  return { isNewlyOnline: wasOffline };
};

const removeSocket = (userId, socketId) => {
  const id = userId.toString();
  const sockets = onlineUsers.get(id);

  if (!sockets) {
    return { isNowOffline: true };
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(id);
    return { isNowOffline: true };
  }

  onlineUsers.set(id, sockets);
  return { isNowOffline: false };
};

const getSocketIds = (userId) => {
  const sockets = onlineUsers.get(userId.toString());
  return sockets ? [...sockets] : [];
};

const isOnline = (userId) => onlineUsers.has(userId.toString());

const getOnlineUserIds = () => [...onlineUsers.keys()];

const filterOnlineUserIds = (userIds) =>
  userIds.filter((userId) => isOnline(userId)).map((userId) => userId.toString());

const disconnectUserSockets = (io, userId) => {
  getSocketIds(userId).forEach((socketId) => {
    const socket = io.sockets.sockets.get(socketId);

    if (socket) {
      socket.disconnect(true);
    }
  });
};

module.exports = {
  addSocket,
  removeSocket,
  getSocketIds,
  isOnline,
  getOnlineUserIds,
  filterOnlineUserIds,
  disconnectUserSockets,
};
