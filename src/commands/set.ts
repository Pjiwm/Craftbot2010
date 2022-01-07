import { Embed, SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandInteraction, GuildEmoji, GuildMemberRoleManager } from 'discord.js'
import { ServerModel } from '../models/server'
import emojiRegex = require('emoji-regex')
import { Permissions } from 'discord.js/node_modules/discord-api-types'
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
                .addStringOption(option => option.setName(EMOJI).setDescription('The new positive score emoji').setRequired(true))
        ))
        .addSubcommand((option: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder => (
            option
                .setName(NEGATIVE)
                .setDescription('Sets the negative score')
                .addStringOption(option => option.setName(EMOJI).setDescription('The new negative score emoji').setRequired(true))
        )),
    async execute(interaction: CommandInteraction) {
        // check if user has permission
        if (!interaction.memberPermissions?.has('MANAGE_GUILD')) {
            const msg = 'Sorry, but you do not have permission to execute this command.'
            interaction.client.users.cache.get(interaction.user.id)?.send(msg)
            return
        }

        const guildId = interaction.guildId
        let guild = await ServerModel.findOne({ guildId: guildId })

        // make guild if it doesn't exist
        if (!guild) {
            guild = await ServerModel.create({ guildId: guildId })
        }
        // with the argument that's given we can see if we're gonna change the positive or negative score emoji
        let argument = interaction.options.getSubcommand()
        // emojis are formatted like <:name:id> so we split by ':'
        let emoji = interaction.options.getString(EMOJI)
        const emojiParts = emoji?.split(':')

        let foundValidEmoji = false

        // if the emoji is found in the server and has the correct string format we can pass it as true
        if (emojiParts?.length === 3) {
            interaction.guild?.emojis.cache.forEach(emoji => {
                if (emoji.name === emojiParts[1] && emoji.id === emojiParts[2].substring(0, emojiParts[2].length - 1)) {
                    foundValidEmoji = true
                }
            })
        }

        // The emoji can also be a non-guild emoji, so we need to check for that as well, 
        //a normal emoji is alwasy 2 character long
        const re = emojiRegex()
        if (re.exec(emoji || '')) {
            foundValidEmoji = true
        }

        if (!foundValidEmoji) {
            interaction.reply({ content: 'This is not a valid server emote' })
            return
        }

        if (argument === POSITIVE) {
            await ServerModel.updateOne({ guildId: guildId }, { positiveScore: emoji })
        } else {
            await ServerModel.updateOne({ guildId: guildId }, { negativeScore: emoji })
        }

        interaction.reply({ content: 'emoji has been updated!' })
    }
}