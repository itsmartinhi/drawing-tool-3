import { Canvas } from './Canvas';
import EventManager from "./events/EventManager.js";
import Router from "./Router.js";
import WsClient from "./WsClient.js";

const initRouter = (wsClient: WsClient, eventManager: EventManager) => {
    // create router instance
    const router = new Router(wsClient, eventManager);

    // initially match the url
    router.matchUrl();
    return router;
};

function initApp() {
    let router: Router;
    let canvasId: string;
    const eventManager = new EventManager();

    const socket = new WebSocket("ws://localhost:5000");
    socket.onmessage = ({ data: rawData }) => {
        const data = JSON.parse(rawData);
        console.log("Message from server ", data);

        switch (data.type) {
            case "InitClient":
                const wsClient = new WsClient(data.id, socket);
                router = initRouter(wsClient, eventManager);
                break;

            case "CreateCanvasComplete":
                window.history.pushState("", "", "/canvas/" + data.canvasId);
                if (!router) {
                    console.error("router not initialized");
                    break;
                }

                // update canvas id
                canvasId = data.canvasId;
                router.matchUrl()
                break;

            case "CanvasEventUpdate":
                console.log("recieved event ", data.event);
                eventManager.pushEvent(data.event);

                // @ts-ignore
                eventManager.draw();
                break;

            default:
                break;
        }
    };
}

initApp();