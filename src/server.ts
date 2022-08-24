const express = require('express')
const http = require('http');
const path = require('path');

const app = express()
app.use(express.json());
app.use(express.static("express"));
app.use("/static", express.static(path.join(__dirname, "../frontend/static")));

// this is probably not needed because we are building a spa
// app.get('/*/canvas/:id', (req, res) => {
//     const id = req.params.id;
//     res.send(`Ich bin eine Canvasseite mit der ID: ${id}!`)
// })

app.get('/api/canvasIds', (req, res) => {
    const ids = canvasStore.getStorage().map((canvas: Canvas) => {
        return canvas.id;
    });

    res.json({ canvasIds: ids });
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
})

const server = http.createServer(app);
const port = 3000;
server.listen(port);


// WEBSOCKET SERVER
const WS = require("ws")
const { randomUUID } = require("crypto")
const wsServer = new WS.Server({ port: "5000" });

wsServer.on("connection", socket => {

    createClient(socket);

    socket.on("message", rawData => {
        const data = JSON.parse(String(rawData));
        console.log(">> WS: " + data.type);
        parseWsData(data, socket);
    });

    socket.on("open", () => {

    });
});

class Client {
    constructor(readonly id: string, readonly ws: WebSocket) { }
}
class Canvas {
    constructor(public id: string) { }

    public eventStore: Array<object> = [];

    private registeredClients: Set<Client> = new Set();

    public getRegisteredClients() {
        return this.registeredClients;
    }

    public registerClient(client: Client) {
        this.registeredClients.add(client);
    }

    public unregisterClient(client: Client) {
        this.registeredClients.delete(client); // return bool whether there was actually something deleted
    }
}

class AbstractStore {
    private storage: Array<any> = [];

    public getStorage() {
        return this.storage;
    }

    public add(item: any): void {
        this.storage.push(item);
    }

    public getById(id: any): any {
        let selectedItem;
        this.storage.forEach(item => {
            if (item.id === id) {
                selectedItem = item;
            }
        });

        // log error if no canvas with the id exists
        if (!selectedItem) {
            console.error(`Client Registration failed.`);
            return;
        }

        return selectedItem;
    }
}


class ClientStore extends AbstractStore {
    public add(client: Client): void {
        return super.add(client);
    }

    public getById(id: string): Client {
        return super.getById(id);
    }
}

class CanvasStore extends AbstractStore {
    public add(canvas: Canvas): void {
        return super.add(canvas);
    }

    public getById(id: string): Canvas {
        return super.getById(id);
    }
}

const clientStore = new ClientStore();
const canvasStore = new CanvasStore();

const parseWsData = (data, socket) => {
    switch (data.type) {
        case "CreateCanvas": {
            createCanvas(socket);
            break;
        }

        case "RegisterForCanvas": {
            const selectedCanvas = canvasStore.getById(data.canvasId);
            const selectedClient = clientStore.getById(data.clientId);

            selectedCanvas?.registerClient(selectedClient);
            break;
        }

        case "UnregisterForCanvas": {
            const selectedCanvas = canvasStore.getById(data.canvasId);
            const selectedClient = clientStore.getById(data.clientId);

            selectedCanvas?.unregisterClient(selectedClient);
            break;
        }

        case "AddCanvasEvent": {
            const selectedCanvas = canvasStore.getById(data.canvasId);
            const senderClientId = data.clientId;
            selectedCanvas?.eventStore.push(data.event);

            clientStore.getStorage().forEach((client: Client) => {
                if (client.id !== senderClientId) {
                    client.ws.send(JSON.stringify({
                        type: "AddCanvasEvent",
                        canvasId: data.canvasId,
                        clientId: client.id,
                        event: data.event
                    }));
                }
            })
            break;
        }

        // case "GetCanvasIds": {
        //     socket.send(JSON.stringify({
        //         type: "GetCanvasIds",
        //         canvasIds: canvasStore.getStorage().map((canvas: Canvas) => {
        //             return canvas.id;
        //         })
        //     }));
        //     break;
        // }

        default:
            console.error(`Unknown Message with type ${data.type}.`)
            break;
    }
}

const createClient = (socket) => {
    const id = randomUUID();
    console.log("Created new client with id: ", id)

    const client = new Client(id, socket);
    clientStore.add(client);

    const message = {
        type: "InitClient",
        id: client.id
    };

    socket.send(JSON.stringify(message));
};

const createCanvas = (socket) => {
    const id = randomUUID();
    canvasStore.add(new Canvas(id));
    console.log("Added new canvas with id: ", id);

    // notify the client that the canvas has been created
    const msg = {
        type: "CreateCanvasComplete",
        canvasId: id,
    }
    socket.send(JSON.stringify(msg));
}
