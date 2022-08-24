import EventManager from "./events/EventManager.js";
import initCanvas from "./initCanvas.js";
import initOverview from "./initOverview.js";
import WsClient from "./WsClient.js";

export default class Router {

    constructor(private wsClient: WsClient, readonly eventManager: EventManager) { }

    public static getCurrentUrl(): string {
        return window.location.href;
    }

    public matchUrl(): void {
        const re = new RegExp("https?:\/\/(.*)");
        const matches = Router.getCurrentUrl().match(re);

        const urlParts = matches[1].split("/");

        const canvasIndex = urlParts.indexOf("canvas");
        // greater 0 because the first urlPart is the domain
        if (canvasIndex > 0 && urlParts[canvasIndex + 1]) {
            const canvasId = urlParts[canvasIndex + 1];
            return initCanvas(this.wsClient, canvasId, this, this.eventManager);
        }

        return initOverview(this.wsClient, this);
    }
}
