import Color from "./Color.js";

class menuApi {
    static createMenu = (id) => {
        return new Menu(id);
    }

    static createItem = (text, callback) => {
        return new MenuItem(text, callback);
    }

    static createSeperator = () => {
        return new Seperator();
    }

    static createRadioSelect = (text, options, selection, callback) => {
        return new RadioSelect(text, options, selection, callback);
    }
}

class Menu {

    public id: string;
    public items: MenuItem[];

    constructor(id) {
        this.id = id ?? Date.now() * Math.random(); // generate a unique id
        this.items = [];
    }

    _getMenusContainer = () => {
        let container = document.getElementById("menus-container");

        // if container doesn't exist yet, create it
        if (!container) {
            container = document.createElement("div");
            container.setAttribute("id", "menus-container");
            document.body.appendChild(container);
        }

        return container
    }

    _closeClickHandler = (e) => {
        const menuContainer = document.getElementById(this.id);

        // todo: clean this condition up!
        if (e.target !== menuContainer && e.target.parentNode !== menuContainer && !menuContainer.contains(e.target)) {
            e.preventDefault();
            e.stopPropagation();
            this.hide(); // hiding the menu will also remove the event handler
        }
    }

    // this displays the menu in the browser
    show = (x = 10, y = 10) => {
        // TODO (the code below is commented out, because I was not sure if this is wanted behaviour)
        // check if menu already exists in DOM and delete it if so
        // const existingMenu = document.getElementById(this.id);
        // if (existingMenu) {
        //     existingMenu.hide();
        // }

        // create menu container
        const menuContainer = document.createElement("div");
        menuContainer.classList.add("menu-container");
        menuContainer.setAttribute("id", this.id);

        // add styles for the container to display it at a specified location
        menuContainer.style.position = 'absolute';
        menuContainer.style.left = x + 'px';
        menuContainer.style.top = y + 'px';

        // add the items to the menu
        this.items.forEach(item => {
            menuContainer.appendChild(item.render());
        });
        
        // render the menu into the DOM
        const menusContainer = this._getMenusContainer();
        menusContainer.appendChild(menuContainer);

        // add event listener to prevent outside clicks to do anything but closing the menu
        document.addEventListener("click", this._closeClickHandler, true);
    }

    // this hides the menu in the browser
    hide = () => {
        const menusContainer = this._getMenusContainer();
        const menuContainer = document.getElementById(this.id);
        menusContainer.removeChild(menuContainer);
        document.removeEventListener("click", this._closeClickHandler, true);
    }

    // this adds an item to the menu
    addItem = (item) => {
        this.items.push(item);
    }

    // this adds a list of items to the menu
    addItems = (itemList) => {
        this.items.push(...itemList);
    }

    // this adds an item at a specific position to the menu
    addItemAt = (item, position) => {
        this.items.splice(position, 0, item);
    }

    // this removes an item from the menu
    removeItem = (item) => {
        let itemIndex = undefined;
        this.items.forEach((value, index) => {
            if (value === item) {
                itemIndex = index;
            }
        });

        if (itemIndex === undefined) {
            console.warn("You tried to remove a non existing item!");
            return;
        }

        // remove the item at the calculated index
        this.items.splice(itemIndex, 1);
    }
}

class MenuItem {

    private text: string;
    private callback;

    constructor(text, callback) {
        this.text = text;
        this.callback = callback;
    }

    render = () => {
        const item = document.createElement("div");
        item.classList.add("menu-item");
        item.textContent = this.text;
        item.addEventListener("click", this.callback);
        return item;
    }
}

class Seperator {
    render = () => {
        const seperator = document.createElement("div");
        seperator.classList.add("menu-seperator");
        return seperator;
    }
}

class RadioSelect {
    constructor(
        private text: string,
        private options: Map<string, any>,
        private callback,
        private selection: string,
    ) {}

    render = () => {
        const formElement = document.createElement("form");
        formElement.innerText = this.text;

        // render options
        this.options.forEach((option, key) => {
            
            // create radio element
            const radioInputElement = document.createElement("input");
            radioInputElement.type = "radio";
            radioInputElement.name = key;
            radioInputElement.id = `menu-radioinput-${key}`;
            radioInputElement.checked = this.selection === key;

            // create label element
            const inputLabelElement = document.createElement("label");
            inputLabelElement.innerText = key;
            inputLabelElement.htmlFor = `menu-radioinput-${key}`;
            
            const customEventListener = (e) => {
                e.stopPropagation();
                this.selection = option;
                this.callback(option);
            }
            radioInputElement.addEventListener("change", customEventListener);
            inputLabelElement.addEventListener("click", customEventListener);

            formElement.appendChild(document.createElement("br"));
            formElement.appendChild(radioInputElement);
            formElement.appendChild(inputLabelElement);
        });

        return formElement;
    }
}

const initContextMenu = (canvas) => {
    const menuId = 1;
    const menu = menuApi.createMenu(menuId);
    const items = [];
    
    // create color options
    const outlineColorOptions = new Map<string, any>();
    outlineColorOptions.set("Red", Color.RED);
    outlineColorOptions.set("Green", Color.GREEN);
    outlineColorOptions.set("Yellow", Color.YELLOW);
    outlineColorOptions.set("Blue", Color.BLUE);
    outlineColorOptions.set("Black", Color.BLACK);

    const fillColorOptions = new Map<string, any>(outlineColorOptions);
    fillColorOptions.set("Transparent", Color.TRANSPARENT);

    // add radio selections
    items.push(menuApi.createRadioSelect(
        "Outline Color",
        outlineColorOptions,
        (value: Color) => {
            canvas.setOutlineColorForSelectedShapes(value, true);
        },
        "Blue", // set blue as default
    ));
    items.push(menuApi.createSeperator());
    items.push(menuApi.createRadioSelect(
        "Fill Color",
        fillColorOptions,
        (value: Color) => {
            canvas.setFillColorForSelectedShapes(value, true);
        },
        "Blue", // set blue as default
    ));
    items.push(menuApi.createSeperator());

    // add move buttons
    items.push(menuApi.createItem("Move to Foreground", () => {
        alert("sry, this doesn't work yet...");
        canvas.moveSelectedToForeground();
    }));
    items.push(menuApi.createItem("Move to Background", () => {
        alert("sry, this doesn't work yet...");
        canvas.moveSelectedToBackground();
    }));

    // add delete button
    items.push(menuApi.createItem("Delete", () => {
        canvas.removeSelectedShapes();
    }));

    menu.addItems(items);
    return menu;
}

export default menuApi;
export { initContextMenu };
