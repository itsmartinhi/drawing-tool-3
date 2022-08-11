import { initContextMenu } from "./menuApi.js";
export class Canvas {
    constructor(canvasDomElement, toolarea) {
        this.shapes = {};
        this.selectedShapeIds = new Set([]);
        const { width, height } = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.ctx = canvasDomElement.getContext("2d");
        // register mouse handlers
        canvasDomElement.addEventListener("mousemove", createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown", createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup", createMouseHandler("handleMouseUp"));
        // register key handlers (the canvas needs a tabindex in order to get focus to recieve key events)
        canvasDomElement.addEventListener("keydown", createKeyHandler("handleKeyDown"));
        canvasDomElement.addEventListener("keyup", createKeyHandler("handleKeyUp"));
        // register menu handler
        canvasDomElement.addEventListener("contextmenu", createContextmenuHandler());
        function createMouseHandler(methodName) {
            return function (e) {
                e = e || window.event;
                if ('object' === typeof e) {
                    const btnCode = e.button, x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop, ss = toolarea.getSelectedShapeOrTool();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        const m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            };
        }
        function createKeyHandler(methodName) {
            return function (e) {
                var _a;
                e = e || window.event;
                if ('object' === typeof e) {
                    const keyCode = e.keyCode;
                    const ss = toolarea.getSelectedShapeOrTool();
                    if (ss) {
                        const m = (_a = ss[methodName]) !== null && _a !== void 0 ? _a : false;
                        // check if method exists
                        if (m) {
                            m.call(ss, keyCode);
                        }
                    }
                }
            };
        }
        const canvas = this;
        function createContextmenuHandler() {
            return function (e) {
                // prevent showing the "normal" contextMenu
                e.preventDefault();
                const x = e.pageX;
                const y = e.pageY;
                const menu = initContextMenu(canvas);
                menu.show(x, y);
            };
        }
    }
    draw() {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.stroke();
        // draw shapes
        this.ctx.fillStyle = 'black';
        for (let id in this.shapes) {
            const isSelected = this.selectedShapeIds.has(parseInt(id));
            this.shapes[id].draw(this.ctx, isSelected);
        }
        return this;
    }
    addShape(shape, redraw = true) {
        this.shapes[shape.id] = shape;
        return redraw ? this.draw() : this;
    }
    removeShape(shape, redraw = true) {
        const id = shape.id;
        delete this.shapes[id];
        return redraw ? this.draw() : this;
    }
    removeShapeWithId(id, redraw = true) {
        delete this.shapes[id];
        return redraw ? this.draw() : this;
    }
    // shape selection
    getShapeIdsAtPoint(x, y) {
        const Ids = [];
        // iterate through all shapes on the canvas
        for (const id in this.shapes) {
            // get the current shape by id
            const shape = this.shapes[id];
            // if the point is within the shape area, add it the the id list
            if (shape.isPointInShapeArea(x, y)) {
                Ids.push(parseInt(id));
            }
        }
        // console.log(Ids) // TODO: remove this logging
        return Ids;
    }
    selectShapeWithId(id, redraw) {
        this.selectedShapeIds.add(id);
        return redraw ? this.draw() : this;
    }
    unselectAllShapes(redraw) {
        this.selectedShapeIds = new Set([]);
        return redraw ? this.draw() : this;
    }
    getSelectedShapeIds() {
        return this.selectedShapeIds;
    }
    removeSelectedShapes() {
        this.selectedShapeIds.forEach((id) => {
            this.removeShapeWithId(id, false);
        });
        return this.draw();
    }
    // color
    setOutlineColorForSelectedShapes(color, redraw) {
        this.selectedShapeIds.forEach((id) => {
            this.shapes[id].outlineColor = color;
        });
        return redraw ? this.draw() : this;
    }
    setFillColorForSelectedShapes(color, redraw) {
        this.selectedShapeIds.forEach((id) => {
            this.shapes[id].fillColor = color;
        });
        return redraw ? this.draw() : this;
    }
    // move
    moveSelectedToBackground(redraw) {
        return redraw ? this.draw() : this;
    }
    moveSelectedToForeground(redraw) {
        return redraw ? this.draw() : this;
    }
}
//# sourceMappingURL=Canvas.js.map