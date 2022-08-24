import Router from "./Router.js";
import WsClient from "./WsClient.js";

const initRouter = (wsClient: WsClient) => {
    // create router instance
    const router = new Router(wsClient);

    // initially match the url
    router.matchUrl();
    return router;
};

function initApp() {
    let router: Router;

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

            default:
                break;
        }
    };
}

initApp();