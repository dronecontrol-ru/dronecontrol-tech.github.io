import { scanDomTree } from "./utils/utils.js";
import { CRSF } from "./protocols/crsf/crsf.js";
import { Connection } from "./connection/connection.js";
import { Sensors } from "./sensors/sensors.js";
import { Speech } from "./speech/speech.js";

export class App {
    constructor() {
        this._tags = scanDomTree();
        this._speech = new Speech();


        this._sensors = new Sensors(this._tags.view_sensors, this._tags.row_sensor);
        this._sensors.addEventListener('create', (e) => {
            console.info(e.detail);
        })
        this._sensors.addEventListener('update', (e) => {
            // console.info(e.detail);
        });

        this._crsf = new CRSF();
        this._crsf.addEventListener('telemetry', (e) => {
            this._sensors.update(e.detail);
        });

        this._connection = new Connection();

        this._connection.addEventListener('connected', () => {
            this._tags.button_connect_ble.classList.add('button_hidden');
            this._tags.button_connect_serial.classList.add('button_hidden');
            this._tags.button_disconnect.classList.remove('button_hidden');
            this._speech.speak('Соединение установлено');
        });

        this._connection.addEventListener('disconnected', () => {
            this._tags.button_connect_ble.classList.remove('button_hidden');
            this._tags.button_connect_serial.classList.remove('button_hidden');
            this._tags.button_disconnect.classList.add('button_hidden');
            this._speech.speak('Разрыв связи с аппаратурой');
        });

        this._connection.addEventListener('data', (e) => {
            this._crsf.setPacket(e.detail);
        });
        
        this._tags.button_connect_serial.onclick = () => {
            this._connection.connect('serial');
        }

        this._tags.button_connect_ble.onclick = () => {
            this._connection.connect('ble');
        }

        this._tags.button_disconnect.onclick = () => {
            this._connection.disconnect();
        }

        this._tags.button_flight.onclick = () => {
            this._tags.button_flight.classList.add('button_selected');
            this._tags.button_map.classList.remove('button_selected');
            this._tags.button_sensors.classList.remove('button_selected');
            this._tags.view_flight.classList.remove('article_hidden');
            this._tags.view_map.classList.add('article_hidden');
            this._tags.view_sensors.classList.add('article_hidden');
        }
        this._tags.button_map.onclick = () => {
            this._tags.button_flight.classList.remove('button_selected');
            this._tags.button_map.classList.add('button_selected');
            this._tags.button_sensors.classList.remove('button_selected');
            this._tags.view_flight.classList.add('article_hidden');
            this._tags.view_map.classList.remove('article_hidden');
            this._tags.view_sensors.classList.add('article_hidden');
        }
        this._tags.button_sensors.onclick = () => {
            this._tags.button_flight.classList.remove('button_selected');
            this._tags.button_map.classList.remove('button_selected');
            this._tags.button_sensors.classList.add('button_selected');
            this._tags.view_flight.classList.add('article_hidden');
            this._tags.view_map.classList.add('article_hidden');
            this._tags.view_sensors.classList.remove('article_hidden');
        }
    }
}