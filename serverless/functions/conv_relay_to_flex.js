exports.handler = async function(context, event, callback) {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;

  if (event.HandoffData) {
    const handoffData = JSON.parse(event.HandoffData);

    const response = new VoiceResponse();

    const taskAttributesJson = {
      reasonCode: handoffData.reasonCode,
      reason: handoffData.reason,
      callSummary: handoffData.callSummary,
      sentiment: handoffData.sentiment
    };

    response.enqueue({
      workflowSid: context.WORKFLOW_SID,
    }).task({}, JSON.stringify(taskAttributesJson));
    
    console.log(response.toString());
    return callback(null, response);
  } else {
    console.error("handoffData is missing:", event.HandoffData);
    return callback("handoffData is missing");
  }
}