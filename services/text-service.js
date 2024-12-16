const EventEmitter = require('events');

class TextService extends EventEmitter {
  constructor(websocket) {
    super();
    this.ws = websocket;
  }

  sendText (text, last) {
    // console.log('Sending text: '.yellow, text, last);
    this.ws.send(
      JSON.stringify({
        type: 'text',
        token: text,
        last: last,
      })
    );
  }

  setLang(language){
    
    console.log('setLang: |', language);
    this.ws.send(
      JSON.stringify({
        type: 'language',
        ttsLanguage: language,
        transcriptionLanguage: language,
      })
    );

  }
  handOff(msg){
    this.ws.send(
      JSON.stringify({
        type: 'end',
        handoffData: JSON.stringify({
          reasonCode: "live-agent-handoff",
          reason: "handoff",
          callSummary: JSON.parse(msg).callSummary,
          sentiment: JSON.parse(msg).sentiment,
        })
      })
    );
  }
}

module.exports = {TextService};