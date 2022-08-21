import initCanvas from "./initCanvas.js";

export default class Router {
    private static getCurrentUrl(): string {
        return window.location.href;
    }

    public static matchUrl(): void {
        const re = new RegExp("https?:\/\/(.*)");
        const matches = Router.getCurrentUrl().match(re);

        console.log(matches);

        if (false) {
            return initCanvas();
        }

        return; // TODO: add initOverview
    }


}