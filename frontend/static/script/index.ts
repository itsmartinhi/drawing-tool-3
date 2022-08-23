import Router from "./Router.js";

function initApp() {

    const socket = new WebSocket("ws://localhost:5000");
    socket.onmessage = ({ data: rawData }) => {
        const data = JSON.parse(rawData);
        console.log("Message from server ", data);
    };

    socket.onopen = () => {
        const testMessage = {
            type: "AddCanvas",
            data: {
                a: "abc",
                f: "asdlkfj",
            }
        }
        socket.send(JSON.stringify(testMessage));
    }

    Router.matchUrl();
}

initApp();