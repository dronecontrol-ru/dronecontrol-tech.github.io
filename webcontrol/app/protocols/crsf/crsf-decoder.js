const CRSF_ADDRESS_RADIO_TRANSMITTER = 0xEA;
const CRSF_ADDRESS_CRSF_TRANSMITTER = 0xEE;
const CRSF_ADDRESS_SYNC_BYTE = 0xC8;

const CRSF_FRAMETYPE_GPS = 0x02;
const CRSF_FRAMETYPE_VARIO = 0x07;
const CRSF_FRAMETYPE_BATTERY = 0x08;
const CRSF_FRAMETYPE_BARO_ALT = 0x09;
const CRSF_FRAMETYPE_LINK = 0x14;
const CRSF_FRAMETYPE_LINK_RX = 0x1C;
const CRSF_FRAMETYPE_LINK_TX = 0x1D;
const CRSF_FRAMETYPE_ATTITUDE = 0x1E;
const CRSF_FRAMETYPE_FLIGHT_MODE = 0x21;

const POWER_MODES = [0, 10, 25, 100, 500, 1000, 2000, 250];


class CRSFDecoder extends EventTarget {
    constructor() {
        super();
        this._addresses = new Map();
    }

    create(addr, frametype, fn) {
        if (!this._addresses.has(addr)) {
            this._addresses.set(addr, new Map());
        }
        const frames = this._addresses.get(addr);
        frames.set(frametype, fn);
    }

    decode(buffer) {
        
        const frames = this._addresses.get(buffer.getUint8(0));
        if (!frames) {
            console.info('Unknown address', new Uint8Array(buffer.buffer));
            
        }
        let detail = {};
        const fn = frames.get(buffer.getUint8(2));
        if (!fn) {
            const key = `0x${buffer.getUint8(2).toString(16)}`;
            let val = ''
            for (let i=3; i<buffer.byteLength - 2; i++) val += `0x${buffer.getUint8(i).toString(16)}`;
            detail[key] = val;
        } else {
            detail = fn(buffer);
        }
        
        
        this.dispatchEvent(new CustomEvent('telemetry', {detail: detail}));
    }
}
const decoder = new CRSFDecoder();


decoder.create(CRSF_ADDRESS_RADIO_TRANSMITTER, CRSF_FRAMETYPE_GPS, (frame) =>{
    return {
        LATITUDE: frame.getInt32(3) / 10000000,
        LONGITUDE: frame.getInt32(7) / 10000000,
        GSPEED: frame.getUint16(11),
        HEADING: frame.getInt16(13),
        ALTITUDE: frame.getUint16(15) - 1000,
        SATELLITES: frame.getUint8(17)

    }
});

decoder.create(CRSF_ADDRESS_RADIO_TRANSMITTER, CRSF_FRAMETYPE_VARIO, (frame) =>{
    return {
        VSPEED: frame.getInt16(3)
    }
});

decoder.create(CRSF_ADDRESS_RADIO_TRANSMITTER, CRSF_FRAMETYPE_BATTERY, (frame) =>{
    return {
        BATT_VOLTAGE: frame.getUint16(3) / 100,
        BATT_CURRENT: frame.getUint16(5) / 100,
        BATT_CAPACITY: frame.getUint16(7),
        BATT_REMAINING: frame.getUint16(10)
    }
});

decoder.create(CRSF_ADDRESS_RADIO_TRANSMITTER, CRSF_FRAMETYPE_LINK, (frame) =>{
    return {
        RX_RSSI_1: frame.getInt8(3),
        RX_RSSI_2: frame.getInt8(4),
        RX_LQ: frame.getInt8(5),
        RX_SNR: frame.getInt8(6),
        RX_ANT: frame.getInt8(7) + 1,
        RF_MODE: frame.getInt8(8),
        TX_POWER: POWER_MODES[frame.getInt8(9)],
        TX_RSSI: frame.getInt8(10),
        TX_LQ: frame.getInt8(11),
        TX_SNR: frame.getInt8(12)
    }
});

decoder.create(CRSF_ADDRESS_RADIO_TRANSMITTER, CRSF_FRAMETYPE_ATTITUDE, (frame) =>{
    return {
        PITCH: frame.getUint16(3) / (Math.PI * 10000),
        ROLL: frame.getUint16(5) / (Math.PI * 10000),
        YAW: frame.getUint16(7) / (Math.PI * 10000)
    }
});

decoder.create(CRSF_ADDRESS_RADIO_TRANSMITTER, CRSF_FRAMETYPE_FLIGHT_MODE, (frame) =>{
    let fmode = '';
    for (let c = 3; c < frame.byteLength - 2; c++) fmode += String.fromCharCode(frame.getUint8(c));
    return {
        FLIGHT_MODE: fmode
    }
});



export default decoder; 