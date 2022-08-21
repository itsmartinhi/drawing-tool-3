import initCanvas from "./initCanvas.js";
import initOverview from "./initOverview.js";

export default class Router {
    private static getCurrentUrl(): string {
        return window.location.href;
    }

    public static matchUrl(): void {
        const re = new RegExp("https?:\/\/(.*)");
        const matches = Router.getCurrentUrl().match(re);

        const urlParts = matches[1].split("/");

        const canvasIndex = urlParts.indexOf("canvas");
        // greater 0 because the first urlPart is the domain
        if (canvasIndex > 0 && urlParts[canvasIndex + 1]) {
            const canvasId = urlParts[canvasIndex + 1];
            return initCanvas();
        }

        return initOverview();
    }
}
