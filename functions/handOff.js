async function handOff(functionArgs) {
    let callSid = functionArgs.callSid;
    console.log('GPT -> called handOff function', callSid);
  
    return 'Handing call off to a live agent ' + callSid;
    
  }
  
  module.exports = handOff;