require('dotenv').config();
require('colors');
require('log-timestamp');


const express = require('express');
const ExpressWs = require('express-ws');

const { GptService } = require('./services/gpt-service');
const { TextService } = require('./services/text-service');
const { recordingService } = require('./services/recording-service');

const { prompt, userProfile, orderHistory } = require('./services/prompt');

const { getLatestRecord } = require('./services/airtable-service');

const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

// Declare global variable
let gptService; 
let textService;

// Add this code after creating the Express app

app.get('/monitor', (req, res) => {
  res.sendFile(__dirname + '/monitor.html');
});

// Initialize an array to store logs
const logs = [];

// Method to add logs
function addLog(level, message) {
    const timestamp = new Date().toISOString();
    logs.push({ timestamp, level, message });
}

// Route to retrieve logs
app.get('/logs', (req, res) => {
    res.json(logs);
});


app.post('/incoming', async (req, res) => {
  try {
    logs.length = 0; // Clear logs
    addLog('info', 'incoming call started');
    // Get latest record from airtable
    const record = await getLatestRecord();
    // console.log('Get latest record ', record);

    // Initialize GPT service 
    gptService = new GptService(record.model);
    
    gptService.userContext.push({ 'role': 'system', 'content': record.sys_prompt });
    gptService.userContext.push({ 'role': 'system', 'content': record.profile });
    gptService.userContext.push({ 'role': 'system', 'content': record.orders });
    gptService.userContext.push({ 'role': 'system', 'content': record.inventory });
    gptService.userContext.push({ 'role': 'system', 'content': record.example });
    

    const response = 
    `<Response>
      <Connect>
        <ConversationRelay url="wss://${process.env.SERVER}/sockets" voice="${record.voice}" language="en-GB"/>
      </Connect>
    </Response>`;
    res.type('text/xml');
    res.end(response.toString());
  } catch (err) {
    console.log(err);
  }
});

app.ws('/sockets', (ws) => {
  try {
    ws.on('error', console.error);
    // Filled in from start message
    let callSid;

    textService = new TextService(ws);

    let interactionCount = 0;
    
    //test to hot swtich language
    // gptService.userContext.push({ 'role': 'system', 'content': 'generate the response to fr-FR'});
    // textService.setLang('en-US' , 'fr-FR');


    // Incoming from MediaStream
    ws.on('message', function message(data) {
      const msg = JSON.parse(data);
      console.log(msg);
      if (msg.type === 'setup') {
        addLog('voxray', 'voxray socket setup');
        // callSid = msg.callSid;        
        gptService.setCallInfo('user phone number', msg.from);

        //trigger gpt to start 
        gptService.completion('hello', interactionCount);
        interactionCount += 1;

        // Set RECORDING_ENABLED='true' in .env to record calls
        recordingService(textService, callSid).then(() => {
          console.log(`Twilio -> Starting Media Stream for ${callSid}`.underline.red);
        });
      } else if (msg.type === 'prompt') {
        addLog('voxray', `VoxRay -> GPT (${msg.lang}) :  ${msg.voicePrompt} `);
        gptService.completion(msg.voicePrompt, interactionCount);
        interactionCount += 1;
      } else if (msg.type === 'interrupt') {
        addLog('voxray', 'voxray socket interrupt');
        gptService.interrupt();
        console.log('Todo: add interruption handling');
      }
    });
      
    gptService.on('gptreply', async (gptReply, final, icount) => {
      console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply}`.green );
      //addLog('info', gptReply);
      addLog('gpt', `GPT -> VoxRay: Interaction ${icount}: ${gptReply}`);
      textService.sendText(gptReply, final);
    });

    gptService.on('tools', async (functionName, functionArgs, functionResponse) => {
      
      addLog('gpt', `Function ${functionName} with args ${functionArgs}`);
      addLog('gpt', `Function Response: ${functionResponse}`);

      if(functionName == 'changeLanguage'){
        addLog('voxray', `VoxRay ChangeLanguage to: ${functionArgs}`);
        let jsonObj = JSON.parse(functionArgs);
        textService.setLang(jsonObj.language);
        // gptService.userContext.push({ 'role': 'assistant', 'content':`change Language to ${functionArgs}`});
      }
      
    });

  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
