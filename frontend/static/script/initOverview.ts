import WsClient from "./WsClient.js";

export default function initOverview(wsClient: WsClient) {
    renderDOM(wsClient);
}

const renderDOM = (wsClient: WsClient) => {
    const rootEle = document.getElementById("root");

    // reset the dom
    while (rootEle.firstChild) {
        rootEle.removeChild(rootEle.firstChild);
    }

    const availableCanvasIds = ["test-canvas-id", "test-canvas-id-2"]; // TODO: fetch this from the server

    const elementList = [];

    // create client id element
    const clientIdEle = document.createElement("div");
    clientIdEle.textContent = `Your Client ID: ${wsClient.clientId}`;
    elementList.push(clientIdEle);

    // create canvas buttons
    const canvasButtonContainer = document.createElement("div");
    canvasButtonContainer.setAttribute("id", "canvas-button-container");
    availableCanvasIds.forEach(id => {
        const ele = document.createElement("div");
        ele.setAttribute("id", `canvas-button-${id}`);
        ele.classList.add("canvas-button");
        ele.textContent = id;
        canvasButtonContainer.appendChild(ele);
    });
    elementList.push(canvasButtonContainer);

    // create add canvas button
    elementList.push(buildAddCanvasButtonElement(wsClient));

    // add everything to the root element
    elementList.forEach(element => {
        rootEle.appendChild(element);
    });
};

const buildAddCanvasButtonElement = (wsClient: WsClient) => {
    const ele = document.createElement("div");
    ele.setAttribute("id", "add-canvas-button");
    ele.textContent = "ADD CANVAS";

    // add eventlistener
    ele.addEventListener("click", () => {
        wsClient.sendCreateCanvasMessage();
    });
    return ele
};