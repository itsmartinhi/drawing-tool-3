import Router from "./Router.js";
import WsClient from "./WsClient.js";

const initRouter = (wsClient: WsClient) => {
    // create router instance
    const router = new Router(wsClient);

    // initially match the url
    router.matchUrl();
    return router;
};


// function makeRequest() {
//     const httpRequest = new XMLHttpRequest();

//     if (!httpRequest) {
//         alert('Giving up :( Cannot create an XMLHTTP instance');
//         return false;
//     }
//     httpRequest.onreadystatechange = alertContents.bind(this, httpRequest);
//     httpRequest.open('GET', '/canvasIds');
//     httpRequest.send();
// }

// function alertContents(httpRequest) {
//     if (httpRequest.readyState === XMLHttpRequest.DONE) {
//         if (httpRequest.status === 200) {
//             alert(httpRequest.responseText);
//         } else {
//             alert('There was a problem with the request.');
//         }
//     }
// }


function initApp() {
    let router: Router;

    // makeRequest();

    const socket = new WebSocket("ws://localhost:5000");
    socket.onmessage = ({ data: rawData }) => {
        const data = JSON.parse(rawData);
        console.log("Message from server ", data);

        switch (data.type) {
            case "InitClient":
                const wsClient = new WsClient(data.id, socket);
                router = initRouter(wsClient);
                break;

            case "CreateCanvasComplete":
                window.history.pushState("", "", "/canvas/" + data.canvasId);
                if (!router) {
                    console.error("router not initialized");
                    break;
                }
                router.matchUrl()
                break;

            case "CreateCanvasComplete":
                window.history.pushState("", "", "/canvas/" + data.canvasId);
                if (!router) {
                    console.error("router not initialized");
                    break;
                }
                router.matchUrl()
                break;

            // case "GetCanvasListResponse":


            default:
                break;
        }
    };
}

initApp();