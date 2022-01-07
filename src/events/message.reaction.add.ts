import { MessageReaction, User } from "discord.js"
import { UserModel } from "../models/user"
import { ServerModel } from "../models/server"

export = {
    name: 'messageReactionAdd',
    async execute(messageReaction: MessageReaction, user: User) {
        // When a reaction is received, check if the structure is partial
        if (messageReaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await messageReaction.fetch()
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error)
                // Return as `reaction.message.author` may be undefined/null
                return
            }
        }
        const messageAuthor = messageReaction.message.author
        const reactingUser = user
        const guildId = messageReaction.message.guildId
        let isPositiveScore
        let guild
        let emoji

        // check if a reaction for tracking score is used, if the server is not stored yet we add it
        if (!await ServerModel.findOne({ guildId: guildId })) {
            await ServerModel.create({ guildId: guildId })
        }

        guild = await ServerModel.findOne({ guildId: guildId })
        // check if it's the correct emoji 
        emoji = messageReaction.emoji
        const positiveEmojiId = guild?.positiveScore.split(':')[2]
        const negativeEmojiId = guild?.negativeScore.split(':')[2]
        let positiveEmoji = positiveEmojiId?.substring(0, positiveEmojiId.length - 1) || guild?.positiveScore
        let negativeEmoji = negativeEmojiId?.substring(0, negativeEmojiId.length - 1) || guild?.negativeScore

        if (emoji.name === positiveEmoji) {
            isPositiveScore = true
        } else if (emoji.name === negativeEmoji) {
            isPositiveScore = false
        } else if (emoji.id === positiveEmoji) {
            isPositiveScore = true
        } else if (emoji.id === negativeEmoji) {
            isPositiveScore = false
        } else {
            // not the emoji we're tracking
            return
        }

        // we don't want to track bots
        if (messageAuthor?.bot) {
            return
        }

        // if user is not present in DB add them first.
        if (!await UserModel.findOne({ userId: messageAuthor?.id })) {
            await UserModel.create({ userId: messageAuthor?.id, guildId: guildId })
        }
        let mongoReactionUser = await UserModel.findOne({ userId: reactingUser.id })
        if (!mongoReactionUser) {
            mongoReactionUser = await UserModel.create({ userId: reactingUser.id, guildId: guildId })
        }

        // a user can't react to their own posts
        if (messageAuthor == reactingUser) {
            messageReaction.remove()
            return
        }

        // A user can only react with a score emoji within certain time intervals
        let minDiff = (Math.abs(Date.now().valueOf() - mongoReactionUser.lastReaction.valueOf())) / 1000 / 60
        // TODO change minDiff value to something like an hour (60)
        if (minDiff < 2) {
            messageReaction.remove()
            return
        }

        // update the correct score and update last reaction time for reacting user
        if (isPositiveScore) {
            await UserModel.findOneAndUpdate({ userId: messageAuthor?.id, guildId: guildId }, { $inc: { positiveScoreCount: 1 } })
        } else {
            await UserModel.findOneAndUpdate({ userId: messageAuthor?.id, guildId: guildId }, { $inc: { negativeScoreCount: 1 } })
        }

        await UserModel.findOneAndUpdate({ userId: reactingUser.id, guildId: guildId }, { lastReaction: new Date() })
        console.log(`[${guildId}]: ${reactingUser.username} reacted to ${messageAuthor?.username} with '${emoji}'`)
    }
}