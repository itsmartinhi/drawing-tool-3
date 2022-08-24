import { IEvent } from "./types.js";

export default class WsClient {
    constructor(readonly clientId: string, readonly socket: WebSocket) { }

    private prepareMessage(msg): string {
        return JSON.stringify(msg);
    }

    public sendCreateCanvasMessage(): void {
        this.socket.send(this.prepareMessage({ type: "CreateCanvas" }));
    }

    public registerClientForCanvas(clientId: string, canvasId: string): void {
        this.socket.send(this.prepareMessage({
            type: "RegisterForCanvas",
            clientId,
            canvasId,
        }));
    }

    public unregisterClientForCanvas(clientId: string, canvasId: string): void {
        this.socket.send(this.prepareMessage({
            type: "UnregisterForCanvas",
            clientId,
            canvasId,
        }));
    }

    public getCanvasIds(): void {
        this.socket.send(this.prepareMessage({ type: "GetCanvasIds" }));
    }

    public addCanvasEvent(canvasId: string, event: IEvent): void {
        this.socket.send(this.prepareMessage({
            type: "AddCanvasEvent",
            clientId: this.clientId,
            canvasId,
            event
        }));
    }
}