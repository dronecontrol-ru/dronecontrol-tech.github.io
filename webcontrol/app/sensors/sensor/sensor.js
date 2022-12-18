import sensor_titles from "./sensor-titles.js";
import sensor_units from "./sensor-units.js";

export class Sensor extends EventTarget {
    constructor(type, row_tpl) {
        super();
        this._type = type;
        this._title = sensor_titles[type] || type;
        this._unit = sensor_units[type] || '?';
        this._update = null;
        this._value = null;
        this._last = null;
        this._view = row_tpl.content.cloneNode(true);
        const dv = this._view.querySelectorAll("div");
        dv[2].textContent = this._title;
        dv[4].textContent = this._unit;
        this._update_el = dv[3];

    }

    getElement() {
        return this._view;
    }

    getInfo() {
        return {
            type: this._type,
            title: this._title,
            value: this._value,
            unit: this._unit,
            last: this._last,
            update: this._update
        }
    }

    update(value, datetime) {
        if (this._value !== null) {
            this._last = this._value;
        } 
        this._value = value;
        this._update = datetime;
        this._update_el.textContent = this._value;
        this.dispatchEvent(new CustomEvent('update', { detail: this.getInfo()}));
    }
}