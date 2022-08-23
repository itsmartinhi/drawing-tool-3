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
const cryptoLib = require("crypto")
const wsServer = new WS.Server({ port: "5000" });

wsServer.on("connection", socket => {
    socket.on("message", rawData => {
        const data = JSON.parse(String(rawData));
        console.log(data);
        parseWsData(data);
        // socket.send(JSON.stringify(data));
    });

    socket.on("open")
});

class Canvas {
    constructor(public id) { }
}

const canvasStore: Array<Canvas> = [];

const parseWsData = (data) => {
    switch (data.type) {
        case "AddCanvas":
            const id = cryptoLib.randomBytes(20).toString('hex'); // TODO: check if id exists already and choose a new one
            canvasStore.push(new Canvas(id));
            console.log("Added new canvas with id: ", id);
            break;


        default:
            break;
    }
}