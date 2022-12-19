const BLE_SERVICES_ID = [0xFFF0, 0xFFE0];
const BLE_CHARACTERISTICS_ID = [0x0000FFF6, 0x0000FFE1];

export class BLE extends EventTarget{
    constructor() {
        super();
        this._device;
        this._server;
        this._service;
        this._characteristic;
    }

    async connect() {
       
        this._device = await navigator.bluetooth.requestDevice({ filters: [{ services: [0xFFF0] }, {services: [0xFFE0]}] });
        this._server = await this._device.gatt.connect();
        const services = await this._server.getPrimaryServices();
        if (!services.length) {
            this.dispatchEvent(new CustomEvent('error'));
            return;
        }

        this._service = services[0];
        console.log(this._service);
        const characteristics = await this._service.getCharacteristics();
        console.log(characteristics);

        this._characteristic = characteristics.reverse().find(characteristic => characteristic.properties.notify === true);
        console.log(this._characteristic);
        if (!this._characteristic) {
            this.dispatchEvent(new CustomEvent('error'));
            return;
        }
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