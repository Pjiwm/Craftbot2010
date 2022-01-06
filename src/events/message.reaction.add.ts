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
        emoji = messageReaction.emoji.name
        if (emoji === guild?.positiveScore) {
            isPositiveScore = true
        } else if (emoji === guild?.negativeScore) {
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
            await UserModel.create({ userId: messageAuthor?.id })
        }

        if (!await UserModel.findOne({ userId: reactingUser.id })) {
            await UserModel.create({ userId: reactingUser.id })
        }

        // a user can't react to their own posts
        if (messageAuthor == reactingUser) {
            messageReaction.remove()
            return
        }

        // update the correct score
        if (isPositiveScore) {
            UserModel.findOneAndUpdate({ userId: messageAuthor }, { $inc: { positiveScoreCount: 1 } })
        } else {
            UserModel.findOneAndUpdate({ userId: messageAuthor }, { $inc: { negativeScoreCount: 1 } })
        }

        console.log(`[${guildId}]: ${reactingUser.username} reacted to ${messageAuthor?.username} with '${emoji}'`)
    }
}