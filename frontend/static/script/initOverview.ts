import Router from "./Router.js";
import WsClient from "./WsClient.js";

export default function initOverview(wsClient: WsClient, router: Router) {

    // fetch available canvas ids from api and render dom
    let availableCanvasIds: Array<string>;
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const data = JSON.parse(httpRequest.response);
                availableCanvasIds = data.canvasIds ?? [];
            } else {
                console.error('There was a problem with the request.');
            }
        }
        renderDOM(wsClient, router, availableCanvasIds);
    };
    httpRequest.open('GET', '/api/canvasIds');
    httpRequest.send();

}

const renderDOM = (wsClient: WsClient, router: Router, availableCanvasIds: Array<string> = []) => {
    const rootEle = document.getElementById("root");

    // reset the dom
    while (rootEle.firstChild) {
        rootEle.removeChild(rootEle.firstChild);
    }

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
        ele.addEventListener("click", () => {
            window.history.pushState("", "", `/canvas/${id}`);
            router.matchUrl();
        });
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