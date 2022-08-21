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