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

        // we don't wanna track bots
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

        UserModel.findOneAndUpdate({ userId: messageAuthor }, { $inc: { positiveScoreCount: 1 } })
        // Now the message has been cached and is fully available
        console.log(`${messageReaction.message.author?.id}'s message "${messageReaction.message.content}" gained a reaction!`)
        // The reaction is now also fully available and the properties will be reflected accurately:
        console.log(`${messageReaction.count} user(s) have given the same reaction to this message!`)
    }
}