declare module "discord.js" { export interface Client { commands: Collection<unknown, any> } }
import { Intents, Interaction, Client, Collection } from 'discord.js'
import fs from 'fs'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
const TOKEN = process.env.DISCORD_KEY || '0'
const TEST_GUILD_ID = ''
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

// get our commands
const commands: any[] = []
client.commands = new Collection()
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
    client.commands.set(command.data.name, command)
}

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