declare module "discord.js" { export interface Client { commands: Collection<unknown, any> } }
import { Intents, Client, Collection } from 'discord.js'
import fs from 'fs'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import database = require('./database.connect')
const TOKEN = process.env.DISCORD_KEY || ''
const TEST_GUILD_ID = process.env.DISCORD_TEST_GUILD || ''
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''

database.connectToMongo()

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
})

// command handler
const commands: any[] = []
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'))
client.commands = new Collection()
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data)
    client.commands.set(command.data.name, command)
}
// register commands for development guild
const rest = new REST({ version: '9' }).setToken(TOKEN);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.')

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID),
            { body: commands },
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
})()

// event handler
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.ts'))
for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => {
            event.execute(...args)
            // console.log(...args)
        })
    }
}

client.login(process.env.DISCORD_KEY)