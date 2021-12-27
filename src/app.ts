declare module "discord.js" { export interface Client { commands: Collection<unknown, any> } }
import { Intents, Interaction, Client, Collection, MessageReaction, User } from 'discord.js'
import fs from 'fs'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
const TOKEN = process.env.DISCORD_KEY || '0'
const TEST_GUILD_ID = process.env.DISCORD_TEST_GUILD
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'))
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
})

// get our commands
const commands: any[] = []
client.commands = new Collection()
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON)
    client.commands.set(command.data.name, command)
}

// Command Listener
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    try {
        await command.execute(interaction)
    } catch (error) {
        if (error) console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch()
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error)
            // Return as `reaction.message.author` may be undefined/null
            return
        }
    }

    // Now the message has been cached and is fully available
    console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`)
    // The reaction is now also fully available and the properties will be reflected accurately:
    console.log(`${reaction.count} user(s) have given the same reaction to this message!`)
})

// startup
client.on('ready', () => {
    console.log('bot is online')
    // registering the commands
    const CLIENT_ID = client.user?.id || '0'
    const rest = new REST({
        version: '9'
    }).setToken(TOKEN);

    (async () => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                    body: commands
                },
                )
                console.log('Successfully registered application commands globally')
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                    body: commands
                },
                )
                console.log('Successfully registered application commands for development guild')
            }
        } catch (error) {
            if (error) console.error(error)
        }
    })()

    // set activity and status
    client.user?.setActivity({
        name: 'with your mom',
        type: 'PLAYING'
    })
    client.user?.setStatus('dnd')
})

client.login(process.env.DISCORD_KEY)