import { Embed, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandInteraction, GuildEmoji } from 'discord.js'
import { ServerModel } from '../models/server'
import emojiRegex = require('emoji-regex')
const POSITIVE = 'positive-score'
const NEGATIVE = 'negative-score'
const EMOJI = 'emoji'
export = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('pick the negative or positive score')
        .addSubcommand((option: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder => (
            option
                .setName(POSITIVE)
                .setDescription('Sets the positive score')
                .addStringOption(option => option.setName(EMOJI).setDescription('The new positive-score emoji').setRequired(true))
        )
        )
        .setDescription(`Shows the total score you've received from user reactions`),
    async execute(interaction: CommandInteraction) {

        const guildId = interaction.guildId
        let guild = await ServerModel.findOne({ guildId: guildId })

        // make guild if it doesn't exist
        if (!guild) {
            guild = await ServerModel.create({ guildId: guildId })
        }

        // emojis are formatted like <:name:id> so we split by ':'
        let emoji = interaction.options.getString(EMOJI)
        const emojiParts = emoji?.split(':')

        let foundValidEmoji = false
        let isGuildEmoji = false

        // if the emoji is found in the server and has the correct string format we can pass it as true
        if (emojiParts?.length === 3) {
            interaction.guild?.emojis.cache.forEach(emoji => {
                if (emoji.name === emojiParts[1] && emoji.id === emojiParts[2].substring(0, emojiParts[2].length - 1)) {
                    foundValidEmoji = true
                    isGuildEmoji = true
                }
            })
        }

        // The emoji can also be a non-guild emoji, so we need to check for that as well, 
        //a normal emoji is alwasy 2 character long
        console.log(emoji?.length)
        const re = emojiRegex()
        if (re.exec(emoji || '')) {
            foundValidEmoji = true
        }

        if (!foundValidEmoji) {
            interaction.reply({ content: 'This is not a valid server emote' })
            return
        }

        await ServerModel.updateOne({ guildId: guildId }, { positiveScore: emoji })

        interaction.reply({ content: 'ping' })
    }
}