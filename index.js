// --- Imports ---
import {
    WorkerOptions,
    cli,
    defineAgent,
    voice,
  } from '@livekit/agents';
  
  // --- FIX 1: Import the *entire* plugin as an object (e.g., "Google") ---
  import * as Google from '@livekit/agents-plugin-google';
  
  import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
  import { fileURLToPath } from 'node:url';
  import dotenv from 'dotenv';
  
  // --- Load your .env file ---
  dotenv.config();
  
  // --- This class is the agent's "personality" ---
  class Assistant extends voice.Agent {
    constructor() {
      super({
        instructions: 'You are a helpful voice assistant. Be concise and friendly, always speak in English, greet the user by saying "Hi I am here to help you find your dream apartment, I will ask you some questions related to your preferences and will connect you to the best match"',
      });
    }
  }
  
  // --- This defines what the agent does when a call starts ---
  export default defineAgent({
    entry: async (ctx) => {
      
      // --- FIX 2: Access the RealtimeModel through its full path ---
      // It's nested inside 'beta.realtime'
      const llm = new Google.beta.realtime.RealtimeModel({
        model: 'gemini-live-2.5-flash-preview',
      });
  
      const session = new voice.AgentSession({
        llm: llm,
      });
      session.on('audio', (audio) => {
        ctx.room.localParticipant.publishTrack(audio.track);
      });
      session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (event) => {
        // event.isFinal is true when the user has finished a sentence/phrase
        if (event.isFinal) {
          console.log(`USER (final): ${event.transcript}`);
        } else {
          console.log(`USER (interim): ${event.transcript}`);
        }
      });
     // Agent "joins" the call *FIRST*
     await ctx.connect();
  
     // Set up the audio pipeline
     await session.start({
       agent: new Assistant(),
       room: ctx.room,
       inputOptions: {
         noiseCancellation: BackgroundVoiceCancellation(),
       },
     });
 
     // Agent speaks first
     console.log("Generating greeting..."); // Added for debugging
     const handle = session.generateReply({
       instructions: 'Hi I am here to help you find your dream apartment, I will ask you some questions related to your preferences and will connect you to the best match',
     });
     await handle.waitForPlayout(); 
     console.log("Greeting finished."); // Added for debugging
   },
  });
  
  // --- This starts the worker ---
  const workerOpts = new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
  });
  
  cli.runApp(workerOpts);