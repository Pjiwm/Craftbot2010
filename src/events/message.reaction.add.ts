import { MessageReaction, User } from "discord.js"

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

        // Now the message has been cached and is fully available
        console.log(`${messageReaction.message.author}'s message "${messageReaction.message.content}" gained a reaction!`)
        // The reaction is now also fully available and the properties will be reflected accurately:
        console.log(`${messageReaction.count} user(s) have given the same reaction to this message!`)
    }
}