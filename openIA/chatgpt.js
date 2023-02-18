import { ChatGPTAPI } from 'chatgpt'

  config = require("./config.js");

const chatGPT = {
    init: false,
    sendMessage: null,
}

export async function initChatGPT() {
    const api = new ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY
    })

    chatGPT.sendMessage = (message, opts = {}) => {
        return api.sendMessage(message, opts)
    }

    chatGPT.init = true
}

export async function askQuestion(question, cb, opts = {}) {

    if (!chatGPT.init) {
        cb("¡Chatgpt no inicializado!")
        return;
    }

    const { conversationInfo } = opts

    let tmr = setTimeout(() => {
        cb("¡Huy! Algo salió mal! (Se acabó el tiempo)")
    }, 120000)

    if (process.env.CONVERSATION_START_PROMPT.toLowerCase() != "false" && conversationInfo.newConversation) {
        try{
            const response = await chatGPT.sendMessage(process.env.CONVERSATION_START_PROMPT, {
                conversationId: conversationInfo.conversationId,
                parentMessageId: conversationInfo.parentMessageId
            })
            conversationInfo.conversationId = response.conversationId
            conversationInfo.parentMessageId = response.id
            clearTimeout(tmr)
            tmr = setTimeout(() => {
                cb("Huy! Algo salió mal! (Se acabó el tiempo)")
            }, 120000)
        }catch(e){
            clearTimeout(tmr)
            cb("¡Huy! Algo salió mal! (Error)")
            return;
        }
    }

    try{
        const response = await chatGPT.sendMessage(question, {
            conversationId: conversationInfo.conversationId,
            parentMessageId: conversationInfo.parentMessageId
        })
        conversationInfo.conversationId = response.conversationId
        conversationInfo.parentMessageId = response.id
        cb(response.text)
    }catch(e){
        cb("¡Huy! Algo salió mal! (Error)")
        console.error("mensaje de error : " + e)
    }finally{
        clearTimeout(tmr)
    }
}