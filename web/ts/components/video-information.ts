import { AlpineComponent } from "./alpine-component";
import { SocketConnections } from "../api/chat-ws";
import { ToggleableElement } from "../utilities/ToggleableElement";
import { RealtimeFacade } from "../utilities/ws";

const CUTOFFLENGTH = 256;

export function videoInformationContext(streamId: number): AlpineComponent {
    // TODO: REST
    const descriptionEl = document.getElementById("description") as HTMLInputElement;
    return {
        viewers: 0 as number,
        description: descriptionEl.value as string,
        less: descriptionEl.value.length > CUTOFFLENGTH,

        showFullDescription: new ToggleableElement(),

        init() {
            SocketConnections.ws = new RealtimeFacade("chat/" + streamId);
            Promise.all([this.initWebsocket()]);
        },

        hasDescription(): boolean {
            return this.description.length > 0;
        },

        async initWebsocket() {
            const handler = (data) => {
                if ("viewers" in data) {
                    this.handleViewersUpdate(data);
                } else if ("description" in data) {
                    this.handleDescriptionUpdate(data);
                }
            };
            SocketConnections.ws.subscribe(handler);
        },

        handleViewersUpdate(upd: { viewers: number }) {
            this.viewers = upd.viewers;
        },

        handleDescriptionUpdate(upd: { description: { full: string } }) {
            this.less = upd.description.full.length > CUTOFFLENGTH;
            this.description = upd.description.full;
        },
    } as AlpineComponent;
}
