import { Interaction } from "discord.js"

export = {
    name: 'interactionCreate',
    async execute(commandInteraction: Interaction) {
        if (!commandInteraction.isCommand()) return

        const command = commandInteraction.client.commands.get(commandInteraction.commandName)
        if (!command) return

        try {
            await command.execute(commandInteraction)
        } catch (error) {
            if (error) console.error(error)
            await commandInteraction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    }
}