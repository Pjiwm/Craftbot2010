import { Embed, SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { ServerModel } from '../models/server'
import { UserModel } from '../models/user'
export = {
    data: new SlashCommandBuilder()
        .setName('score')
        .setDescription(`Shows the total score you've received from user reactions`),
    async execute(interaction: CommandInteraction) {
        const discordUser = interaction.user
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
            .setAuthor({ name: discordUser.username, iconURL: discordUser.avatarURL() || '' })
            .setTitle(`${interaction.user.username}'s stats`)
            .addFields(
                { name: `${guild?.positiveScore}    score`, value: `${mongoUser?.positiveScoreCount}` },
                { name: `${guild?.negativeScore}    score`, value: `${mongoUser?.positiveScoreCount}` }
            )
            .setTimestamp()
        interaction.reply({ embeds: [scoreEmbed] })
    }
}