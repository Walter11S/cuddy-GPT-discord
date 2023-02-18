module.exports = {
  
  Token: process.env.DISCORD_BOT_TOKEN || "",
  
  ClientID: process.env.DISCORD_CLIENT_ID || "",
  
  API: process.env.OPENAI_API_KEY || "",
  
  ENABLE_DIRECT_MESSAGES: false,

 CONVERSATION_MEMORY_SECONDS: 300,

CONVERSATION_START_PROMP: false,

USE_EMBED: true,
  
}
