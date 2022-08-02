const express = require('express')
const http = require('http');

const app = express()
app.use(express.json());
app.use(express.static("express"));

app.get('/*/canvas/:id', (req, res) => {
    const id = req.params.id;
    res.send(`Ich bin eine Canvasseite mit der ID: ${id}!`)
})

app.get('*', (req, res) => {
    res.send(`Ich bin eine Übersichtsseite`)
})

const server = http.createServer(app);
const port = 3000;
server.listen(port);