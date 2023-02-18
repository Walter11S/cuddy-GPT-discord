import { REST, Routes, AttachmentBuilder } from 'discord.js'

  config = require("./config.js");

import stableDiffusion from '../stablediffusion/stableDiffusion.js';
import Conversations from '../openIA/conversations.js'
import { askQuestion } from '../openIA/chatgpt.js';
import { generateInteractionReply } from './discord_helpers.js';

export const commands = [
    {
        name: 'ask',
        description: '¡Pregunta cualquier cosa!',
        options: [
            {
                name: "pregunta",
                description: "Respondo a cualquier cosa 😀",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'image',
        description: '¡Pregunta cualquier cosa!',
        options: [
            {
                name: "descripción",
                description: "Genero cualquier cosa",
                type: 3,
                required: true
            }
        ]
    },
];

export async function initDiscordCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
        console.log('Comenzó a actualizar los comandos de la aplicación (/).');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });
        console.log('Comandos de aplicación (/) recargados con éxito.');
    } catch (error) {
        console.error(error);
    }
}

export async function handle_interaction_ask(interaction) {
    const user = interaction.user

    // Begin conversation
    let conversationInfo = Conversations.getConversation(user.id)
    const question = interaction.options.getString("pregunta")
    await interaction.deferReply()
    if (question.toLowerCase() == "reset") {
        generateInteractionReply(interaction,user,question,"Quien eres ?")
        return;
    }

    try {
        askQuestion(question, async (content) => {
            generateInteractionReply(interaction,user,question,content)
        }, { conversationInfo })
    } catch (e) {
        console.error(e)
    }
}

export async function handle_interaction_image(interaction) {
    const prompt = interaction.options.getString("prompt")
    try {
        await interaction.deferReply()
        stableDiffusion.generate(prompt, async (result) => {
            if (result.error) {
                await interaction.editReply({ content: "error..." })
                return;
            }
            try {
                const attachments = []
                for (let i = 0; i < result.results.length; i++) {
                    let data = result.results[i].split(",")[1]
                    const buffer = Buffer.from(data, "base64")
                    let attachment = new AttachmentBuilder(buffer, { name: "result0.jpg" })
                    attachments.push(attachment)
                }
                await interaction.editReply({ content: "hecho...", files: attachments })
            } catch (e) {
                await interaction.editReply({ content: "error..." })
            }

        })
    } catch (e) {
        console.error(e)
    }
}