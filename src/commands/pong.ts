import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
export = {
    data: new SlashCommandBuilder()
        .setName('pong')
        .setDescription('replies with ping'),
    async execute(interaction: CommandInteraction) {
        interaction.reply({ content: 'ping' })
    }
}