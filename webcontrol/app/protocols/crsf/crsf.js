import decoder from "./crsf-decoder.js";

export class CRSF extends EventTarget {
    constructor() {
        super();
        this._buffer = new Uint8Array();
        decoder.addEventListener('telemetry', (e) => {
            this.dispatchEvent(new CustomEvent('telemetry', {detail: e.detail}));
        })
    }

    setPacket(buffer) {
        const buffer_new = new Uint8Array(this._buffer.length + buffer.length);
        buffer_new.set(this._buffer);
        buffer_new.set(buffer, this._buffer.length);
        this._buffer = buffer_new;

        if (this._buffer.length < 4) {
            return;
        }
        if (this._buffer.at(1) > 62) {
            this._buffer = new Uint8Array();
            return;
        }
        if (this._buffer.at(1) + 2 > this._buffer.length) {
            return;
        }

        const frame = this._buffer.slice(0, this._buffer[1] + 2);
        this._buffer = this._buffer.slice(this._buffer[1] + 2, this._buffer.length);

        decoder.decode(new DataView(frame.buffer));
    }
}