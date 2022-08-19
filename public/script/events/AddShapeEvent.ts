import { IEvent } from './../types';

export default class AddShapeEvent implements IEvent {
    public name: string = "AddShape";
}
