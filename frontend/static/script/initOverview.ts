export default function initOverview() {
    renderDOM();
}

const renderDOM = () => {
    const availableCanvasIds = ["test-canvas-id", "test-canvas-id-2"]; // TODO: fetch this from the server

    const elementList = [];

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
    elementList.push(buildAddCanvasButtonElement());

    // add everything to the root element
    const rootEle = document.getElementById("root")
    elementList.forEach(element => {
        rootEle.appendChild(element);
    });
};

const buildAddCanvasButtonElement = () => {
    const ele = document.createElement("div");
    ele.setAttribute("id", "add-canvas-button");
    ele.textContent = "ADD CANVAS";

    // add eventlistener
    ele.addEventListener("click", () => {
        console.log("create new canvas"); // TODO: implement the backend logic -> redirect to the new canvas
    });
    return ele
};