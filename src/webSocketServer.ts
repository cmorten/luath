// deno-lint-ignore-file no-explicit-any

import { WebSocket } from "../deps.ts";

type Data = Record<string, any>;

export class WebSocketServer {
  private clients: Set<WebSocket>;
  private buffer: Data[] = [];

  constructor() {
    this.clients = new Set<WebSocket>();
  }

  private flush() {
    while (this.buffer.length > 0) {
      this.send(this.buffer.shift()!);
    }
  }

  public register(socket: WebSocket) {
    this.clients.add(socket);
    this.flush();
  }

  public async unregister(socket: WebSocket) {
    this.clients.delete(socket);

    try {
      await socket.close(1000);
    } catch (_) {
      // swallow
    }

    this.flush();
  }

  public send(data: Data) {
    if (!this.clients.size) {
      this.buffer.push(data);
    }

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
