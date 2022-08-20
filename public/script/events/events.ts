import { IEvent } from '../types';

// class AbstractEvent {
//     public name: string = "Abstract";
//     public payload: object;
//     constructor() {

//     }
// }

export class AddShapeEvent implements IEvent {
    readonly name: string = "AddShape";
    public payload: object;
    constructor(private shapeType: string, private id: string, private data: object) {
        this.payload = { shapeType, id, data };
    }
}

export class RemoveShapeWithIdEvent implements IEvent {
    readonly name: string = "RemoveShapeWithId";
    public payload: object;
    constructor(private shapeId: string) { this.payload = { shapeId } }
}

export class SelectShapeEvent implements IEvent {
    readonly name: string = "SelectShape";
    public payload: object;
    constructor(private shapeId: string, private clientId: string) {
        this.payload = { shapeId, clientId };
    }

    public static getName(): string {
        return this.name;
    }
}

export class UnselectShapeEvent implements IEvent {
    readonly name: string = "UnselectShape";
    public payload: object;
    constructor(private shapeId: string, private clientId: string) {
        this.payload = { shapeId, clientId };
    }

    public static getName(): string {
        return this.name;
    }
}
