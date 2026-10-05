import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'node:http';
import type { WebSocketEvent } from './types/websocket.js';
import jwt from 'jsonwebtoken';
import { jwtPayloadSchema } from './schemas/auth.schema.js';
import { env } from './config/env.js';

type AuthenticatedWebSocket = WebSocket & {
  userId?: number;
};


export function broadcast(
    wss: WebSocketServer,
    event: WebSocketEvent,
    userId?: number,
  ) {
    wss.clients.forEach((client) => {
      if (
      client.readyState === client.OPEN &&
      (userId === undefined ||
        (client as AuthenticatedWebSocket).userId === userId)
    ) {
      sendEvent(client, event);
    }
    });
}

function sendEvent(
  socket: WebSocket,
  event: WebSocketEvent,
) {
  socket.send(JSON.stringify(event));
}

let websocketServer: WebSocketServer | null = null;

export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
  });

  websocketServer = wss;

  wss.on('connection', (socket: AuthenticatedWebSocket) => {
    
    const authTimeout = setTimeout(() => {
      socket.close(1008, 'Authentication timeout');
    }, 5000);

    socket.once('message', (message) => {
      try {
        const authMessage = JSON.parse(message.toString());

        if (
          authMessage.type !== 'authenticate' ||
          typeof authMessage.data?.token !== 'string'
        ) {
          socket.close(1008, 'Authentication required');
          return;
        }

        const token = authMessage.data.token;

        const decoded = jwt.verify(token, env.JWT_SECRET);
        const result = jwtPayloadSchema.safeParse(decoded);

        if (!result.success) {
          socket.close(1008, 'Invalid authentication');
          return;
        }

        socket.userId = result.data.userId;

        clearTimeout(authTimeout);

        sendEvent(socket, {
          type: 'authenticate',
          data: {
            success: true,
          },
        });

        sendEvent(socket, {
          type: 'welcome',
          data: {
            message: 'Welcome to TaskFlow!',
          },
        });

        // Only listen for normal messages after authentication.
        socket.on('message', (message) => {
          console.log('Client says:', message.toString());

          broadcast(wss, {
            type: 'message',
            data: {
              message: message.toString(),
            },
          });
        });
      } catch {
        clearTimeout(authTimeout);
        socket.close(1008, 'Invalid authentication');
      }
    });

    socket.on('close', () => {
      clearTimeout(authTimeout);
      console.log('WebSocket client disconnected');
    });
  });
  return wss;
}

export function broadcastEvent(
  event: WebSocketEvent,
  userId: number,
) {
  if (!websocketServer) {
    return;
  }

  broadcast(websocketServer, event, userId);
}