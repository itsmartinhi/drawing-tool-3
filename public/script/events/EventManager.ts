import { IEvent } from "../types";

class EventManager {
    private eventStream: Array<IEvent> = [];

    public pushEvent(event: IEvent) {
        this.eventStream.push(event);
        this.updateEventstreamDisplay();
    }

    public getEventStream(): Array<IEvent> {
        return this.eventStream;
    }

    private updateEventstreamDisplay() {
        const eventStreamString = this.getEventStream().map((event: IEvent) => {
            return `>> ${event.name} | ${JSON.stringify(event.payload)}`;
        }).join('\n');

        (<HTMLInputElement>document.getElementById('eventstream')).value = eventStreamString;
    }
}

export default EventManager;