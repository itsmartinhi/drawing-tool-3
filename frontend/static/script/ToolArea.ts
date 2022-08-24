import { Canvas } from "./Canvas.js";
import EventManager from "./events/EventManager.js";
import { AddShapeEvent, SelectShapeEvent, UnselectShapeEvent } from "./events/events.js";
import { Point2D, Vector } from "./Shapes.js";
import { ShapeFactory, ShapeManager, ToolFactory } from "./types.js";
import WsClient from "./WsClient.js";

export class ToolArea {
    private selectedShape: ShapeFactory = undefined;
    constructor(shapesSelector: ShapeFactory[], menue: Element) {
        const domElms = [];
        shapesSelector.forEach(sl => {
            const domSelElement = document.createElement("li");
            domSelElement.innerText = sl.label;
            menue.appendChild(domSelElement);
            domElms.push(domSelElement);

            domSelElement.addEventListener("click", () => {
                selectFactory.call(this, sl, domSelElement);
            });
        });

        function selectFactory(sl: ShapeFactory, domElm: HTMLElement) {
            // remove class from all elements
            for (let j = 0; j < domElms.length; j++) {
                domElms[j].classList.remove("marked");
            }
            this.selectedShape = sl;
            // add class to the one that is selected currently
            domElm.classList.add("marked");
        }
    }

    getSelectedShapeOrTool(): ShapeFactory {
        return this.selectedShape;
    }
}
export class SelectorFactory implements ToolFactory {

    // add shapemanager to be able to manipulate the shapes on the canvas
    constructor(private shapeManager: ShapeManager, readonly eventManager: EventManager, readonly wsClient: WsClient, readonly canvasId: string) { }

    public label: string = "Auswahl";
    private pressedKeys: Set<number> = new Set([]);

    // drag and drop stuff
    isDragging: boolean = false;
    selectedShapes = [];
    dragFromPoint: Point2D;
    dragToPoint: Point2D;

    handleMouseUp(x: number, y: number) {
        let resetCanvas = true;
        let selectableShapeIds = this.shapeManager.getShapeIdsAtPoint(x, y); // todo: consider making this a Set

        // sadly i could not make this work in time
        // if (this.isDragging) {
        //     this.dragToPoint = new Point2D(x, y);

        //     const translateVector = new Vector(
        //         this.dragToPoint.x - this.dragFromPoint.x,
        //         this.dragToPoint.y - this.dragFromPoint.y
        //     );

        //     console.log(this.selectedShapes);

        //     // translate the shapes
        //     this.selectedShapes.forEach((shape) => {
        //         // remove shape

        //         // add new shape
        //         // const shape = this.shapeManager.getShapeById(id);

        //         // @ts-ignore
        //         shape.from?.x + translateVector.x;
        //         // @ts-ignore
        //         shape.to?.x + translateVector.x;
        //         // @ts-ignore
        //         shape.from?.y + translateVector.y;
        //         // @ts-ignore
        //         shape.to?.y + translateVector.y;

        //         const addEvent = new AddShapeEvent(shape.type, shape.id, { ...shape });
        //         this.eventManager.pushEvent(addEvent);
        //     });
        //     this.shapeManager.draw();

        //     // reset
        //     this.selectedShapes = [];
        //     this.isDragging = false;
        //     // return;
        // }

        if (this.isCtrlPressed()) {
            resetCanvas = false;
        }

        // TODO: cycling through does not work 100% because of the mechanic with getting the selected IDs
        if (this.isAltPressed()) {
            // let the user cycle through the selectable shapes with each click
            const selectedIds = this.shapeManager.getSelectedShapeIds();

            const leftOverSelectableShapeIds = new Set(
                selectableShapeIds.filter((id) => !selectedIds.has(id.toString()))
            );

            console.log("selected:", selectedIds, "possible:", selectableShapeIds);
            console.log("leftover ids:", leftOverSelectableShapeIds);

            selectableShapeIds = Array.from(leftOverSelectableShapeIds);
        }

        if (resetCanvas) {
            // unselect every shape the reset the canvas
            this.shapeManager.getSelectedShapeIds().forEach(shapeId => {
                const event = new UnselectShapeEvent(shapeId.toString(), this.wsClient.clientId);
                this.eventManager.pushEvent(event);
                this.wsClient.addCanvasEvent(this.canvasId, event);
            });
            this.shapeManager.draw();
            // this.shapeManager.unselectAllShapes(true); // TODO: remove after event sourcing is finalized
        }

        // do nothing if there are no selectable shapes
        if (!selectableShapeIds.length) {
            return;
        }

        // select the element with the heightest ID (the latest ID was the last drawn shape)
        const latestId = selectableShapeIds[selectableShapeIds.length - 1];
        const event = new SelectShapeEvent(latestId.toString(), this.wsClient.clientId);
        this.eventManager.pushEvent(event);
        this.wsClient.addCanvasEvent(this.canvasId, event);
        this.shapeManager.draw();
        // this.shapeManager.selectShapeWithId(highestId, true); // TODO: remove after event sourcing is finalized
    }

    handleMouseMove(x: number, y: number) {
        if (this.isDragging) {
            // console.log(x, y);
        }
        return
    }

    handleMouseDown(x: number, y: number) {
        this.shapeManager.getSelectedShapeIds().forEach(id => {
            const shape = this.shapeManager.getShapeById(id);
            this.selectedShapes.push(shape);
        });
        this.dragFromPoint = new Point2D(x, y);
        this.isDragging = true;
        return
    }

    handleKeyDown(keyCode: number) {
        this.pressedKeys.add(keyCode);
    }

    handleKeyUp(keyCode: number) {
        this.pressedKeys.delete(keyCode);
    }

    private isAltPressed() {
        const ALT_KEYCODE = 18;
        return this.pressedKeys.has(ALT_KEYCODE);
    }

    private isCtrlPressed() {
        const CTRL_KEYCODE = 17;
        return this.pressedKeys.has(CTRL_KEYCODE);
    }
}