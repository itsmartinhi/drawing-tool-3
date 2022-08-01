import Color from "./Color.js";
class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Vector extends Point2D {
}
class AbstractShape {
    constructor() {
        this.id = AbstractShape.counter++;
        this.selectionColor = Color.BLACK;
        this.fillColor = Color.TRANSPARENT;
        this.outlineColor = Color.BLUE;
    }
}
AbstractShape.counter = 0;
class AbstractFactory {
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
    }
    handleMouseDown(x, y) {
        this.from = new Point2D(x, y);
    }
    handleMouseUp(x, y) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(this.createShape(this.from, new Point2D(x, y)));
        this.from = undefined;
    }
    handleMouseMove(x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x, y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x, y));
            this.shapeManager.addShape(this.tmpShape);
        }
    }
}
export class Line extends AbstractShape {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
        this.selectionTolerance = 10; // 10px tolernance
    }
    draw(ctx, isSelected) {
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
    isPointInShapeArea(x, y) {
        const p = new Point2D(x, y);
        // algorith from: https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
        const tmp1 = Math.abs((this.to.x - this.from.x) * (this.from.y - p.y) - (this.from.x - p.x) * (this.to.y - this.from.y));
        const tmp2 = Math.sqrt((Math.pow((this.to.x - this.from.x), 2)) + (Math.pow((this.to.y - this.from.y), 2)));
        const distance = tmp1 / tmp2;
        // if distance is smaller than selection tolerance consider the line as selected
        return distance <= this.selectionTolerance;
    }
}
export class LineFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Linie";
    }
    createShape(from, to) {
        return new Line(from, to);
    }
}
class Circle extends AbstractShape {
    constructor(center, radius) {
        super();
        this.center = center;
        this.radius = radius;
    }
    draw(ctx, isSelected) {
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
    isPointInShapeArea(x, y) {
        return isPointInCircle(x, y, this.center.x, this.center.y, this.radius);
    }
}
export class CircleFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Kreis";
    }
    createShape(from, to) {
        return new Circle(from, CircleFactory.computeRadius(from, to.x, to.y));
    }
    static computeRadius(from, x, y) {
        const xDiff = (from.x - x), yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}
class Rectangle extends AbstractShape {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
    }
    draw(ctx, isSelected) {
        ctx.strokeStyle = this.outlineColor.getRGBAString();
        ctx.fillStyle = this.fillColor.getRGBAString();
        console.log(this.fillColor.getRGBAString());
        ctx.beginPath();
        ctx.rect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
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
    isPointInShapeArea(x, y) {
        // calculate the rect corner points
        let tl; // top left
        let br; // bottom right
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
        if (x >= tl.x && x <= br.x
            && y <= br.y && y >= tl.y) {
            return true;
        }
        else {
            return false;
        }
    }
}
export class RectangleFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Rechteck";
    }
    createShape(from, to) {
        return new Rectangle(from, to);
    }
}
class Triangle extends AbstractShape {
    constructor(p1, p2, p3) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
    draw(ctx, isSelected) {
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
    calcVector(from, to) {
        return new Vector(to.x - from.x, to.y - from.y);
    }
    calc2DCrossProduct(v1, v2) {
        return (v1.x * v2.y) - (v2.x * v1.y);
    }
    isPointInShapeArea(x, y) {
        const p = new Point2D(x, y);
        // algorithm from: https://math.stackexchange.com/a/51328
        const cp1 = this.calc2DCrossProduct(this.calcVector(this.p1, this.p2), this.calcVector(this.p1, p));
        const cp2 = this.calc2DCrossProduct(this.calcVector(this.p2, this.p3), this.calcVector(this.p2, p));
        const cp3 = this.calc2DCrossProduct(this.calcVector(this.p3, this.p1), this.calcVector(this.p3, p));
        // p is only inside the triangle if every cp is either positive or negative at the same time
        return ((cp1 > 0 && cp2 > 0 && cp3 > 0)
            || ((cp1 < 0 && cp2 < 0 && cp3 < 0)));
    }
}
export class TriangleFactory {
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Dreieck";
    }
    handleMouseDown(x, y) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape(new Triangle(this.from, this.tmpTo, new Point2D(x, y)));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        }
        else {
            this.from = new Point2D(x, y);
        }
    }
    handleMouseUp(x, y) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x, y);
            this.thirdPoint = new Point2D(x, y);
            this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(this.tmpShape);
        }
    }
    handleMouseMove(x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x, y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(this.tmpShape);
            }
        }
        else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x, y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(this.from, this.tmpTo);
                this.shapeManager.addShape(this.tmpLine);
            }
        }
    }
}
const isPointInPolygon = (x, y) => {
    // ray casting algorithm
};
const isPointInCircle = (x, y, center_x, center_y, radius) => {
    return (Math.pow((x - center_x), 2)) + (Math.pow((y - center_y), 2)) <= (Math.pow(radius, 2));
};
//# sourceMappingURL=Shapes.js.map