export default class WsClient {
    constructor(readonly clientId: string, private socket: WebSocket) { }

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
}