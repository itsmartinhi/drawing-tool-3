class EventManager {
    eventStream = [];

    pushEvent(event) {
        this.eventStream.push(event);
    }
}

export default EventManager;