import { WebSocketServer, WebSocket } from "ws";
import { v4 as generateUuid } from "uuid";

import message from "../message";

interface ResponseHeader {
  requestId: string;
  messagePurpose: string;
  version: number;
}

interface ResponseBody {
  statusCode: number;
  statusMessage: string;
}

interface ResponseData {
  header: ResponseHeader;
  body: ResponseBody;
}

class MinecraftClient {
  private client;

  constructor(client: WebSocket) {
    this.client = client;
  }

  runCommand(command: string): Promise<void> {
    const uuid = generateUuid();

    this.client.send(
      JSON.stringify({
        header: {
          version: 1,
          messagePurpose: "commandRequest",
          requestId: uuid,
        },
        body: {
          commandLine: command,
        },
      })
    );

    return new Promise((resolve) => {
      this.client.on("message", (data: any) => {
        const res: ResponseData = JSON.parse(data.toString());
        if (res.header.requestId !== uuid) return;

        resolve();
      });
    });
  }

  async reload() {
    const reloadingMessage = "[SOCKET] §9Triggering automatic world reload...";
    await this.runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: reloadingMessage }] })}`);

    await this.runCommand("reload");

    const reloadedMessage = "[SOCKET] §aSuccessfully reloaded scripts and functions.";
    await this.runCommand(`tellraw @a ${JSON.stringify({ rawtext: [{ text: reloadedMessage }] })}`);
  }
}

export class MinecraftWebSocketServer {
  private server: WebSocketServer;

  constructor(port: number) {
    this.server = new WebSocketServer({ port });

    if (this.server.address() === null) {
      message(`Port ${port} is already in use, so automatic script reloading is not available.`, "warning", "SOCKET");
    } else {
      message(`To enable automatic script reloading in your world, run the *"/connect localhost:${port}"* command.`, "information", "SOCKET");
    }

    this.server.on("connection", (client) => {
      message("New client connected successfully!", "addition", "SOCKET");
      new MinecraftClient(client).reload();
    });
  }

  get clients() {
    return Array.from(this.server.clients).map((client) => new MinecraftClient(client));
  }

  reloadClients() {
    for (const client of this.clients) client.reload();
  }

  dispose() {
    this.server.close();
  }
}
