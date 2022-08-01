export class ToolArea {
    constructor(shapesSelector, menue) {
        this.selectedShape = undefined;
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
        function selectFactory(sl, domElm) {
            // remove class from all elements
            for (let j = 0; j < domElms.length; j++) {
                domElms[j].classList.remove("marked");
            }
            this.selectedShape = sl;
            // add class to the one that is selected currently
            domElm.classList.add("marked");
        }
    }
    getSelectedShapeOrTool() {
        return this.selectedShape;
    }
}
export class SelectorFactory {
    // add shapemanager to be able to manipulate the shapes on the canvas
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Auswahl";
        this.pressedKeys = new Set([]);
    }
    handleMouseUp(x, y) {
        let resetCanvas = true;
        let selectableShapeIds = this.shapeManager.getShapeIdsAtPoint(x, y); // todo: consider making this a Set
        if (this.isCtrlPressed()) {
            resetCanvas = false;
        }
        // TODO: cycling through does not work 100% because of the mechanic with getting the selected IDs
        if (this.isAltPressed()) {
            // let the user cycle through the selectable shapes with each click
            const selectedIds = this.shapeManager.getSelectedShapeIds();
            const leftOverSelectableShapeIds = new Set(selectableShapeIds.filter((id) => !selectedIds.has(id)));
            console.log("selected:", selectedIds, "possible:", selectableShapeIds);
            console.log("leftover ids:", leftOverSelectableShapeIds);
            selectableShapeIds = Array.from(leftOverSelectableShapeIds);
        }
        if (resetCanvas) {
            // unselect every shape the reset the canvas
            this.shapeManager.unselectAllShapes(true);
        }
        // select the element with the heightest ID (the highest ID was the last drawn shape)
        const highestId = Math.max(...selectableShapeIds);
        this.shapeManager.selectShapeWithId(highestId, true);
    }
    handleMouseMove(x, y) {
        return; // do nothing since everything gets handled on mouse up
    }
    handleMouseDown(x, y) {
        return; // do nothing since everything gets handled on mouse up
    }
    handleKeyDown(keyCode) {
        this.pressedKeys.add(keyCode);
    }
    handleKeyUp(keyCode) {
        this.pressedKeys.delete(keyCode);
    }
    isAltPressed() {
        const ALT_KEYCODE = 18;
        return this.pressedKeys.has(ALT_KEYCODE);
    }
    isCtrlPressed() {
        const CTRL_KEYCODE = 17;
        return this.pressedKeys.has(CTRL_KEYCODE);
    }
}
//# sourceMappingURL=ToolArea.js.map