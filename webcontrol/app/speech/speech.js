export class Speech {
    constructor(voice_id) {
        this._speech;
        this._activate(voice_id);
    }

    _activate(voice_id) {
        setTimeout(() => {
            this._speech = new SpeechSynthesisUtterance();
            const voices = speechSynthesis.getVoices();
            this._speech.lang = "ru";
            this._speech.speed = 1;
            this._speech.voice = voices[voice_id || 17];
            console.log(this._speech.voice, voices)
        }, 100)
        
    }

    speak(text) {
        this._speech.text = text;
        speechSynthesis.speak(this._speech);
    }
}