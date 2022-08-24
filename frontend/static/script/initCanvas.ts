import { ShapeFactory, ShapeManager } from "./types.js";
import { CircleFactory, LineFactory, RectangleFactory, TriangleFactory } from "./Shapes.js";
import { SelectorFactory, ToolArea } from "./ToolArea.js";
import { Canvas } from "./Canvas.js";
import EventManager from "./events/EventManager.js";
import WsClient from "./WsClient.js";
import Router from "./Router.js";

export default function initCanvas(wsClient: WsClient, canvasId: string, router: Router) {
    buildDOM(wsClient, canvasId, router);

    // register client for canvas
    wsClient.registerClientForCanvas(wsClient.clientId, canvasId);

    const canvasDomElm = document.getElementById("drawArea") as HTMLCanvasElement;
    const menu = document.getElementsByClassName("tools");
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    let canvas: Canvas;
    const em: EventManager = new EventManager();
    const sm: ShapeManager = {
        draw() {
            return canvas.draw();
        },
        addShape(s, rd) {
            return canvas.addShape(s, rd);
        },
        removeShape(s, rd) {
            return canvas.removeShape(s, rd);
        },
        removeShapeWithId(id, rd) {
            return canvas.removeShapeWithId(id, rd);
        },
        getShapeIdsAtPoint(x, y) {
            return canvas.getShapeIdsAtPoint(x, y);
        },
        selectShapeWithId(id, rd) {
            return canvas.selectShapeWithId(id, rd);
        },
        unselectAllShapes(rd) {
            return canvas.unselectAllShapes(rd);
        },
        getSelectedShapeIds() {
            return canvas.getSelectedShapeIds();
        },
        removeSelectedShapes() {
            return canvas.removeSelectedShapes();
        },
        setFillColorForSelectedShapes(color, rd) {
            return canvas.setFillColorForSelectedShapes(color, rd);
        },
        setOutlineColorForSelectedShapes(color, rd) {
            return canvas.setOutlineColorForSelectedShapes(color, rd);
        },
        moveSelectedToBackground(rd) {
            return canvas.moveSelectedToBackground(rd);
        },
        moveSelectedToForeground(rd) {
            return canvas.moveSelectedToBackground(rd);
        },
    };
    const shapesSelector: ShapeFactory[] = [
        new LineFactory(sm, em),
        new CircleFactory(sm, em),
        new RectangleFactory(sm, em),
        new TriangleFactory(sm, em),
        new SelectorFactory(sm, em),
    ];
    const toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea, em, sm);
    canvas.draw();
}

function buildDOM(wsClient: WsClient, canvasId: string, router: Router) {
    const rootEle = document.getElementById("root");

    // reset the dom
    while (rootEle.firstChild) {
        rootEle.removeChild(rootEle.firstChild);
    }

    const elementList = [];

    // back to overview button
    const backButtonEle = document.createElement("div");
    backButtonEle.textContent = "Back to Overview";
    backButtonEle.classList.add("canvas-back-button");
    backButtonEle.addEventListener("click", () => {
        window.history.pushState("", "", "/");
        router.matchUrl();
        wsClient.unregisterClientForCanvas(wsClient.clientId, canvasId);
    });
    elementList.push(backButtonEle);

    // render client and canvas id
    const idEle = document.createElement("div");
    idEle.textContent = `CLIENT-ID: ${wsClient.clientId}CANVAS-ID: ${canvasId}`;
    elementList.push(idEle);

    // info text
    const infoElement = document.createElement('p');
    infoElement.textContent = `Wählen Sie auf der linken Seite Ihr Zeichwerkzeug aus.
    Haben Sie eines ausgewählt, können Sie mit der Maus
    die entsprechenden Figuren zeichen. Typischerweise, indem
    Sie die Maus drücken, dann mit gedrückter Maustaste die
    Form bestimmen, und dann anschließend die Maustaste loslassen.`;
    elementList.push(infoElement);

    // tool list
    const toolListElement = document.createElement('ul');
    toolListElement.classList.add('tools');
    elementList.push(toolListElement);

    // canvas
    const canvasElement = document.createElement('canvas');
    canvasElement.setAttribute("id", "drawArea");
    canvasElement.setAttribute("width", "900");
    canvasElement.setAttribute("height", "800");
    canvasElement.setAttribute("tabindex", "-1"); // The canvas gets a tabindex to be able to get focus (-1 doesn't put it in the tab rotation)
    elementList.push(canvasElement);

    // eventstream
    const eventStreamContainer = document.createElement('div');
    eventStreamContainer.setAttribute("id", "eventstream-container");

    const eventStreamHeader = document.createElement('h4');
    eventStreamHeader.textContent = "Eventstream:";

    const eventStreamTextarea = document.createElement('textarea');
    eventStreamTextarea.setAttribute("name", "eventstream");
    eventStreamTextarea.setAttribute("id", "eventstream");
    eventStreamTextarea.setAttribute("cols", "100");
    eventStreamTextarea.setAttribute("rows", "10");

    const eventStreamLoadButton = document.createElement('div');
    eventStreamLoadButton.setAttribute("id", "load-events-button");
    eventStreamLoadButton.textContent = "Load Events";

    eventStreamContainer.appendChild(eventStreamHeader);
    eventStreamContainer.appendChild(eventStreamTextarea);
    eventStreamContainer.appendChild(eventStreamLoadButton);
    elementList.push(eventStreamContainer);

    // add everything to the root element
    elementList.forEach(element => {
        rootEle.appendChild(element);
    });
}
