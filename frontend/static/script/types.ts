import Color from "./Color.js";

type EventPayload = {
    [key: string]: any;
}

export interface IEvent {
    readonly name: string;
    readonly payload: EventPayload;
}

export interface Shape {
    readonly id: number;
    readonly type: string;
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean);
    isPointInShapeArea(x: number, y: number);

    selectionColor: Color;
    fillColor: Color;
    outlineColor: Color;
}

export interface ShapeManager {
    draw(): this;
    addShape(shape: Shape, redraw?: boolean): this;
    removeShape(shape: Shape, redraw?: boolean): this;
    removeShapeWithId(id: string, redraw?: boolean): this;

    // shape selection
    getShapeIdsAtPoint(x: number, y: number): string[];
    selectShapeWithId(id: string, redraw?: boolean): this; // TODO: think about whether the redraw param is even needed
    unselectAllShapes(redraw?: boolean): this;
    getSelectedShapeIds(): Set<string>;

    removeSelectedShapes(): this; // todo: maybe add redraw as param?

    // color
    setOutlineColorForSelectedShapes(color: Color, redraw?: boolean): this;
    setFillColorForSelectedShapes(color: Color, redraw?: boolean): this;

    // move
    moveSelectedToForeground(redraw?: boolean): this;
    moveSelectedToBackground(redraw?: boolean): this;
}

export interface ShapeFactory {
    label: string;
    handleMouseDown(x: number, y: number);
    handleMouseUp(x: number, y: number);
    handleMouseMove(x: number, y: number);
}

export interface ToolFactory extends ShapeFactory {
    handleKeyDown(keyCode: number);
    handleKeyUp(keyCode: number);
}
