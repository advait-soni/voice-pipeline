import "dotenv/config";

const HOST = "generativelanguage.googleapis.com";
const PATH =
  "google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";
const API_KEY = process.env.GEMINI_API_KEY;

const URL = `wss://${HOST}/ws/${PATH}?key=${API_KEY}`;
const MODEL = "gemini-live-2.5-flash-preview";
const ws = new WebSocket(URL);

ws.onopen = () => {
  console.log("WS connection established");

  const setupMessage = {
    setup: {
      model: `models/${MODEL}`,
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Puck", 
            },
          },
        },
      },
    },
  };

  ws.send(JSON.stringify(setupMessage));
  console.log("Server is Configured");
};

ws.onmessage = async (event) => {
    let msg;
    try {
        // msg = JSON.parse(event.data.toString());
        console.log("event: ", event.data)
    }
    catch (e){
        console.error("Error parsing message not valid json:", e);
        return;
    }
    // if(msg.setupComplete){
    //     console.log("🤖 SETUP COMPLETE: Model is ready for audio streaming.");
        
    //     // 🚨 Next Code Block Goes Here: Start the microphone!
        
    //     return;
    // }
    // if (msg.serverContent) {
    //     // console.log("📥 Received conversation content structure...");
    //     // Audio playback logic will go here
    // }
}

ws.onerror = (err) => console.error("WS error:", err);
