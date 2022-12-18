import { Sensor } from "./sensor/sensor.js";

export class Sensors extends EventTarget {
    constructor(view, row_tpl) {
        super();
        this._view = view;
        this._row_tpl = row_tpl;
        this._rows = new Map();
        this._sensors = new Map();
    }

    _addSensor(type) {
        const sensor = new Sensor(type, this._row_tpl);
        sensor.addEventListener('update', (e) => {
            this.dispatchEvent(new CustomEvent('update', { detail: e.detail }));
        })
        this._sensors.set(type, sensor);
        this._view.appendChild(sensor.getElement());
        this.dispatchEvent(new CustomEvent('create', { detail: sensor }));
        
        return sensor;
    }

    update(records) {
        const now = Date.now();
        for (let type in records) {
            
            if (!this._sensors.has(type)) {
                this._addSensor(type);
            }
            let sensor = this._sensors.get(type);
            sensor.update(records[type], now);
        }

    }
}

