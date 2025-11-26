// Utilitário para encontrar uma porta disponível
const net = require('net');

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

async function findAvailablePort(startPort = 3001, maxAttempts = 10) {
  const ports = [];
  for (let i = 0; i < maxAttempts; i++) {
    ports.push(startPort + i);
  }
  
  for (const port of ports) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  
  throw new Error(`Nenhuma porta disponível entre ${startPort} e ${startPort + maxAttempts - 1}`);
}

module.exports = { findAvailablePort, isPortAvailable };

