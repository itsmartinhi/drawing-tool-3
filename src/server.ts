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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
    // res.send(`Ich bin eine Übersichtsseite`)
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
        parseWsData(data, socket);
        // socket.send(JSON.stringify(data));
    });

    socket.on("open", () => {

    });
});

class Client {
    constructor(public id: string) { }

    private registeredCanvases: Set<Canvas> = new Set();

    public registerCanvas
}
class Canvas {
    constructor(public id: string) { }
}

const clientStore: Array<Client> = [];
const canvasStore: Array<Canvas> = [];

const parseWsData = (data, socket) => {
    switch (data.type) {
        case "CreateCanvas":
            const id = randomUUID();
            canvasStore.push(new Canvas(id));
            console.log("Added new canvas with id: ", id);

            const message = {
                type: "CreateCanvasComplete",
                canvasId: id,
            }
            socket.send(JSON.stringify(message));
            break;

        case "RegisterForCanvas":
            // search for client and canvas with matching id
            console.log(data);

        default:
            break;
    }
}

const createClient = (socket) => {
    const id = randomUUID();
    console.log("Created new client with id: ", id)

    const client = new Client(id);
    clientStore.push(client);

    const message = {
        type: "InitClient",
        id: client.id
    };

    socket.send(JSON.stringify(message));
};