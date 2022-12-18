const FRSKY_SERVICE_ID = 0xFFF0;
const FRSKY_CHARACTERISTIC_ID = 0x0000FFF6;

export class BLE extends EventTarget{
    constructor() {
        super();
        this._device;
        this._server;
        this._service;
        this._characteristic;
    }

    async connect() {
       
        this._device = await navigator.bluetooth.requestDevice({ filters: [{ services: [FRSKY_SERVICE_ID] }] });
        this._server = await this._device.gatt.connect();
        this._service = await this._server.getPrimaryService(FRSKY_SERVICE_ID);
        this._characteristic = await this._service.getCharacteristic(FRSKY_CHARACTERISTIC_ID);

        this._characteristic.oncharacteristicvaluechanged = (e) => {
            this.dispatchEvent(new CustomEvent('data', {detail: new Uint8Array(e.currentTarget.value.buffer) }));
        }
        this._characteristic.startNotifications();
        this.dispatchEvent(new CustomEvent('connected'));
    }

    async disconnect() {
        await this._server.disconnect();
        this._device = undefined;
        this._server = undefined;
        this._service = undefined;
        this._characteristic = undefined;
        this.dispatchEvent(new CustomEvent('disconnected'));
    }

    async send(data) {
        // Реализовать отправку команд по BLE
    }
}