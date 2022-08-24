import { AddShapeEvent } from './events/events.js';
import Color from "./Color.js";
import { createIndexSignature } from "../../../node_modules/typescript/lib/typescript.js";
import { Shape, ShapeFactory, ShapeManager, ToolFactory } from "./types.js";
import EventManager from "./events/EventManager.js";
import WsClient from './WsClient.js';

class Point2D {
    constructor(readonly x: number, readonly y: number) { }
}

class Vector extends Point2D { }

class AbstractShape {
    private static counter: number = 0;
    readonly id: string;

    public selectionColor: Color;
    public fillColor: Color;
    public outlineColor: Color;

    constructor(clientId: string) {
        this.id = clientId + "-" + String(AbstractShape.counter++);

        this.selectionColor = Color.BLACK;
        this.fillColor = Color.TRANSPARENT;
        this.outlineColor = Color.BLUE;
    }
}
abstract class AbstractFactory<T extends Shape> {
    private from: Point2D;
    private tmpTo: Point2D;
    private tmpShape: T;

    constructor(readonly shapeManager: ShapeManager, readonly eventManager: EventManager, readonly wsClient: WsClient, readonly canvasId: string) { }

    abstract createShape(from: Point2D, to: Point2D): T;

    handleMouseDown(x: number, y: number) {
        this.from = new Point2D(x, y);
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id.toString(), false);
        }
        const shape = this.createShape(this.from, new Point2D(x, y));
        // this.shapeManager.addShape(shape); // TODO: remove
        const to = new Point2D(x, y);

        const event = new AddShapeEvent(shape.type, shape.id.toString(), {
            from: this.from,
            to: to,
            // zOrder: 1337, // TODO: implement
            fillColor: shape.fillColor,
            outlineColor: shape.outlineColor,
        });

        this.eventManager.pushEvent(event);
        this.wsClient.addCanvasEvent(this.canvasId, event);
        this.shapeManager.draw();

        this.from = undefined;

    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x, y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id.toString(), false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x, y));
            this.shapeManager.addShape(this.tmpShape);
        }
    }

}
export class Line extends AbstractShape implements Shape {
    public type = "line";
    private selectionTolerance: number = 10; // 10px tolernance

    constructor(readonly clientId: string, readonly from: Point2D, readonly to: Point2D) {
        super(clientId);
    }

    draw(ctx: CanvasRenderingContext2D, isSelected: boolean) {
        ctx.strokeStyle = this.outlineColor.getRGBAString();
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.stroke();

        if (isSelected) {
            const rectSize = 10;
            ctx.strokeStyle = this.selectionColor.getRGBAString();
            ctx.beginPath();
            ctx.rect(this.from.x - rectSize / 2, this.from.y - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.to.x - rectSize / 2, this.to.y - rectSize / 2, rectSize, rectSize);
            ctx.stroke();
        }
    }

    isPointInShapeArea(x: number, y: number) {
        const p = new Point2D(x, y);

        // algorith from: https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
        const tmp1 = Math.abs((this.to.x - this.from.x) * (this.from.y - p.y) - (this.from.x - p.x) * (this.to.y - this.from.y));
        const tmp2 = Math.sqrt(((this.to.x - this.from.x) ** 2) + ((this.to.y - this.from.y) ** 2))

        const distance = tmp1 / tmp2;

        // if distance is smaller than selection tolerance consider the line as selected
        return distance <= this.selectionTolerance;
    }

}
export class LineFactory extends AbstractFactory<Line> implements ShapeFactory {

    public label: string = "Linie";

    constructor(shapeManager: ShapeManager, eventManager: EventManager, readonly wsClient: WsClient, readonly canvasId: string) {
        super(shapeManager, eventManager, wsClient, canvasId);
    }

    createShape(from: Point2D, to: Point2D): Line {
        return new Line(this.wsClient.clientId, from, to);
    }

}
export class Circle extends AbstractShape implements Shape {
    public type = "circle";
    constructor(readonly clientId: string, readonly center: Point2D, readonly radius: number) {
        super(clientId);
    }
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean) {
        ctx.strokeStyle = this.outlineColor.getRGBAString();
        ctx.fillStyle = this.fillColor.getRGBAString();
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        if (isSelected) {
            const rectSize = 10;
            ctx.strokeStyle = this.selectionColor.getRGBAString();
            ctx.beginPath();
            ctx.rect(this.center.x - rectSize / 2, this.center.y - this.radius - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.center.x + this.radius - rectSize / 2, this.center.y - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.center.x - this.radius - rectSize / 2, this.center.y - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.center.x - rectSize / 2, this.center.y + this.radius - rectSize / 2, rectSize, rectSize);
            ctx.stroke();
        }
    }

    public isPointInShapeArea(x: number, y: number) {
        return isPointInCircle(x, y, this.center.x, this.center.y, this.radius)
    }

}
export class CircleFactory extends AbstractFactory<Circle> implements ShapeFactory {
    public label: string = "Kreis";

    constructor(shapeManager: ShapeManager, eventManager: EventManager, readonly wsClient: WsClient, readonly canvasId: string) {
        super(shapeManager, eventManager, wsClient, canvasId);
    }

    createShape(from: Point2D, to: Point2D): Circle {
        return new Circle(this.wsClient.clientId, from, CircleFactory.computeRadius(from, to.x, to.y));
    }

    private static computeRadius(from: Point2D, x: number, y: number): number {
        const xDiff = (from.x - x),
            yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}
export class Rectangle extends AbstractShape implements Shape {
    public type = "rectangle";
    constructor(readonly clientId: string, readonly from: Point2D, readonly to: Point2D) {
        super(clientId);
    }

    draw(ctx: CanvasRenderingContext2D, isSelected: boolean) {

        ctx.strokeStyle = this.outlineColor.getRGBAString();
        ctx.fillStyle = this.fillColor.getRGBAString();
        ctx.beginPath();
        ctx.rect(this.from.x, this.from.y,
            this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.stroke();
        ctx.fill();

        if (isSelected) {
            const rectSize = 10;
            ctx.strokeStyle = this.selectionColor.getRGBAString();
            ctx.beginPath();
            ctx.rect(this.from.x - rectSize / 2, this.from.y - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.to.x - rectSize / 2, this.to.y - rectSize / 2, rectSize, rectSize);

            ctx.rect(this.from.x - rectSize / 2, this.to.y - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.to.x - rectSize / 2, this.from.y - rectSize / 2, rectSize, rectSize);
            ctx.stroke();
        }
    }

    isPointInShapeArea(x: number, y: number) {
        // calculate the rect corner points
        let tl: Point2D; // top left
        let br: Point2D; // bottom right

        // drawn from top right to bottom left
        if (this.from.x < this.to.x && this.to.y > this.from.y) {
            // console.log("tl -> br");
            tl = this.from;
            br = this.to;
        }

        // drawn from bottom left to top right
        if (this.from.x < this.to.x && this.to.y < this.from.y) {
            // console.log("bl -> tr");
            tl = new Point2D(this.from.x, this.to.y);
            br = new Point2D(this.to.x, this.from.y);
        }

        // drawn top right to bottom left
        if (this.from.x > this.to.x && this.to.y > this.from.y) {
            // console.log("tr -> bl");
            tl = new Point2D(this.to.x, this.from.y);
            br = new Point2D(this.from.x, this.to.y);
        }

        // drawn bottom right to top left
        if (this.from.x > this.to.x && this.to.y < this.from.y) {
            // console.log("br -> tl");
            tl = this.to;
            br = this.from;
        }

        // check intersection
        if (
            x >= tl.x && x <= br.x
            && y <= br.y && y >= tl.y
        ) {
            return true;
        } else {
            return false;
        }
    }
}
export class RectangleFactory extends AbstractFactory<Rectangle> implements ShapeFactory {
    public label: string = "Rechteck";
    constructor(shapeManager: ShapeManager, eventManager: EventManager, readonly wsClient: WsClient, readonly canvasId: string) {
        super(shapeManager, eventManager, wsClient, canvasId);
    }

    createShape(from: Point2D, to: Point2D): Rectangle {
        return new Rectangle(this.wsClient.clientId, from, to);
    }
}
export class Triangle extends AbstractShape implements Shape {
    public type = "triangle";
    constructor(readonly clientId: string, readonly p1: Point2D, readonly p2: Point2D, readonly p3: Point2D) {
        super(clientId);
    }
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean) {
        ctx.strokeStyle = this.outlineColor.getRGBAString();
        ctx.fillStyle = this.fillColor.getRGBAString();
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
        ctx.fill();

        if (isSelected) {
            const rectSize = 10;
            ctx.strokeStyle = this.selectionColor.getRGBAString();
            ctx.beginPath();
            ctx.rect(this.p1.x - rectSize / 2, this.p1.y - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.p2.x - rectSize / 2, this.p2.y - rectSize / 2, rectSize, rectSize);
            ctx.rect(this.p3.x - rectSize / 2, this.p3.y - rectSize / 2, rectSize, rectSize);
            ctx.stroke();
        }
    }

    private calcVector(from: Point2D, to: Point2D): Vector {
        return new Vector(to.x - from.x, to.y - from.y);
    }

    private calc2DCrossProduct(v1: Vector, v2: Vector): number {
        return (v1.x * v2.y) - (v2.x * v1.y);
    }

    isPointInShapeArea(x: number, y: number) {
        const p = new Point2D(x, y);

        // algorithm from: https://math.stackexchange.com/a/51328
        const cp1 = this.calc2DCrossProduct(
            this.calcVector(this.p1, this.p2),
            this.calcVector(this.p1, p)
        );

        const cp2 = this.calc2DCrossProduct(
            this.calcVector(this.p2, this.p3),
            this.calcVector(this.p2, p)
        );

        const cp3 = this.calc2DCrossProduct(
            this.calcVector(this.p3, this.p1),
            this.calcVector(this.p3, p)
        );

        // p is only inside the triangle if every cp is either positive or negative at the same time
        return (
            (cp1 > 0 && cp2 > 0 && cp3 > 0)
            || ((cp1 < 0 && cp2 < 0 && cp3 < 0))
        );
    }


}
export class TriangleFactory implements ShapeFactory {
    public label: string = "Dreieck";

    private from: Point2D;
    private tmpTo: Point2D;
    private tmpLine: Line;
    private thirdPoint: Point2D;
    private tmpShape: Triangle;

    constructor(readonly shapeManager: ShapeManager, readonly eventManager: EventManager, readonly wsClient: WsClient, readonly canvasId: string) { }

    handleMouseDown(x: number, y: number) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id.toString(), false);

            const p3 = new Point2D(x, y);
            const shape = new Triangle(this.wsClient.clientId, this.from, this.tmpTo, p3);
            // this.shapeManager.addShape(shape); // TODO: remove

            const event = new AddShapeEvent(shape.type, shape.id.toString(), {
                p1: shape.p1,
                p2: shape.p2,
                p3: shape.p3,
                fillColor: shape.fillColor,
                outlineColor: shape.outlineColor,
            });
            this.eventManager.pushEvent(event);
            this.wsClient.addCanvasEvent(this.canvasId, event);
            this.shapeManager.draw();

            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        } else {
            this.from = new Point2D(x, y);
        }
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id.toString(), false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x, y);
            this.thirdPoint = new Point2D(x, y);
            this.tmpShape = new Triangle(this.wsClient.clientId, this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }

        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x, y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id.toString(), false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.wsClient.clientId, this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        } else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x, y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id.toString(), false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.wsClient.clientId, this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    }
}

const isPointInPolygon = (x: number, y: number) => {
    // ray casting algorithm
};

const isPointInCircle = (x: number, y: number, center_x: number, center_y: number, radius: number): boolean => {
    return ((x - center_x) ** 2) + ((y - center_y) ** 2) <= (radius ** 2);
}