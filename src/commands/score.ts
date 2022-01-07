import { Embed, SlashCommandBuilder, SlashCommandMentionableOption } from '@discordjs/builders'
import { CommandInteraction, Guild, GuildMember, User } from 'discord.js'
import { ServerModel } from '../models/server'
import { UserModel } from '../models/user'
const baseAvatarUrl = 'https://cdn.discordapp.com/avatars'
export = {
    data: new SlashCommandBuilder()
        .setName('score')
        .addMentionableOption(
            (option: SlashCommandMentionableOption): SlashCommandMentionableOption => (
                option
                    .setName('mention')
                    .setDescription('mention a different user to show their scores')
                    .setRequired(false)
            )
        )
        .setDescription(`Shows the total score you've received from user reactions`),
    async execute(interaction: CommandInteraction) {
        let discordUser

        // if the user tagged someone we apply the command to the tagged user, otherwise the user who executed the command.
        if (interaction.options.getMentionable('mention')) {
            discordUser = (interaction.options.getMentionable('mention') as GuildMember).user
            // we don't want them to be bots
            if (discordUser.bot) {
                interaction.reply('Sorry but the user you tagged is a bot!')
                return
            }
        } else {
            discordUser = interaction.user
        }
        const guildId = interaction.guildId
        let guild = await ServerModel.findOne({ guildId: guildId })

        // make guild or user if it doesn't exist
        if (!guild) {
            guild = await ServerModel.create({ guildId: guildId })
        }

        let mongoUser = await UserModel.findOne({ userId: discordUser.id, guildId: guildId })
        if (!mongoUser) {
            mongoUser = await UserModel.create({ userId: discordUser.id, guildId: guildId })
        }
        const scoreEmbed: Embed = new Embed()
            .setColor(111111)
            .setAuthor({ name: discordUser.username, iconURL: `${baseAvatarUrl}/${discordUser.id}/${discordUser.avatar}` })
            .setTitle(`${interaction.user.username}'s stats`)
            .addFields(
                { name: `positive score    ${guild?.positiveScore}`, value: `${mongoUser?.positiveScoreCount}` },
                { name: `negative score    ${guild?.negativeScore}`, value: `${mongoUser?.negativeScoreCount}` },
                { name: `ratio     ${guild?.positiveScore}/${guild?.negativeScore}`, value: `${mongoUser.ratio}` }
            )
            .setTimestamp()
        interaction.reply({ embeds: [scoreEmbed] })
    }
}