const ws = require('ws');

let wss = null;

const initWebSocket = (server) => {
  wss = new ws.Server({ server });

  wss.on('connection', (socket) => {
    console.log('[WEBSOCKET] Cyber security operator connected to SIEM real-time feed');

    // Send immediate acknowledgement
    socket.send(JSON.stringify({
      event: 'connected',
      data: { message: 'Secure WebSocket connection established with HackerSafe SIEM Server.' }
    }));

    socket.on('close', () => {
      console.log('[WEBSOCKET] Cyber security operator disconnected from SIEM real-time feed');
    });
  });

  return wss;
};

const getIO = () => {
  return {
    emit: (event, data) => {
      if (!wss) {
        console.warn('[WEBSOCKET] WebSocket server not initialized yet.');
        return;
      }
      
      const payload = JSON.stringify({ event, data });
      
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(payload);
        }
      });
    }
  };
};

module.exports = { initWebSocket, getIO };
