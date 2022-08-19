import { IEvent } from '../types';

// class AbstractEvent {
//     public name: string = "Abstract";
//     public payload: object;
//     constructor() {

//     }
// }

export class AddShapeEvent implements IEvent {
    public name: string = "AddShape";
    public payload: object;
    constructor(private shapeType: string, private id: string, private data: object) {
        this.payload = { shapeType, id, data };
    }
}

export class RemoveShapeWithIdEvent implements IEvent {
    public name: string = "RemoveShapeWithId";
    public payload: object;
    constructor(private shapeId: string) { this.payload = { shapeId } }
}

export class SelectShapeEvent implements IEvent {
    public name: string = "SelectShape";
    public payload: object;
    constructor(private shapeId: string, private clientId: string) {
        this.payload = { shapeId, clientId };
    }
}

export class UnselectShapeEvent implements IEvent {
    public name: string = "UnselectShape";
    public payload: object;
    constructor(private shapeId: string, private clientId: string) {
        this.payload = { shapeId, clientId };
    }
}
