import { WebSocket } from "../deps.ts";

export class WebSocketServer {
  private clients: Set<WebSocket>;

  constructor() {
    this.clients = new Set<WebSocket>();
  }

  public register(socket: WebSocket) {
    this.clients.add(socket);
  }

  public async unregister(socket: WebSocket) {
    this.clients.delete(socket);

    try {
      await socket.close(1000);
    } catch (_) {
      // swallow
    }
  }

  public send(data: any) {
    const message = JSON.stringify(data);

    this.clients.forEach(async (client) => {
      if (!client.isClosed) {
        try {
          await client.send(message);
        } catch (_) {
          // swallow
        }
      }
    });
  }

  public close() {
    this.clients.forEach(async (client) => await this.unregister(client));
  }
}
