import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
export = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('replies with pong'),
    async execute(interaction: CommandInteraction) {
        interaction.reply({ content: 'pong' })
    }
}