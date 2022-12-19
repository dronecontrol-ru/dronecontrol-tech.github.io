const SERIAL_BAUDRATE = 115200;

export class Serial extends EventTarget {
    constructor() {
        super();
        this._port = null;
    }

    async connect() {
        this._port = await navigator.serial.requestPort();
        this._port.onconnect = () => {
            this.dispatchEvent(new CustomEvent('connected'));
        }

        this._port.ondisconnect = () => {
            this._port = null;
            this.dispatchEvent(new CustomEvent('disconnected'));
        }

        this._open();
    }

    async disconnect() {
        await this._port.close();
        this._port = null;
    }

    async _open() {
        await this._port.open({ baudRate: SERIAL_BAUDRATE });
        const reader = this._port.readable.getReader();
        
        this._listen(reader);
    }

    async _listen(reader) {
        while (this._port && this._port.readable) {
            let response;
            try {
                response = await reader.read();
            } catch(e) {
                console.warn(e.message);
                if (e.message == 'Buffer overrun') {
                    await this.disconnect();
                    this.connect();
                }
            }
            if (response && response.value) {
                this.dispatchEvent(new CustomEvent('data', { detail: response.value}));
            }
        }
    }

    async send(buffer) {
        if (!this._port || !this._port.writeble) {
            return;
        }

        const writer = this._port.writeble.getWriter();
        
        const result = await writer.write(buffer);
        console.log(buffer, result);
        writer.releaseLock();

        return result;
    }

    
}

Serial.isAvailable = function() {
    return !!navigator.serial;
}