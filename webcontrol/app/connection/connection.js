import { Serial } from "./serial/serial.js";
import { BLE } from "./ble/ble.js";
export class Connection extends EventTarget {
    constructor() {
        super();
        this._connection = null;
    }

    async connect(type) {
        if (type === 'serial') {
            this._connection = new Serial();
        } else {
            this._connection = new BLE();
        }

        this._connection.addEventListener('connected',() => {
            this.dispatchEvent(new CustomEvent('connected'));
        });
        this._connection.addEventListener('disconnected',() => {
            this.dispatchEvent(new CustomEvent('disconnected'));
        });
        this._connection.addEventListener('data', (e) => {
            this.dispatchEvent(new CustomEvent('data', { detail: e.detail}));
        });
        
        await this._connection.connect();
    }

    async disconnect() {
        await this._connection.disconnect();
    }

    send(buffer) {
        this._connection.send(buffer);
    }
}