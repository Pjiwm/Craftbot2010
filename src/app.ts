declare module "discord.js" { export interface Client { commands: Collection<unknown, any> } }
import { Intents, Client, Collection } from 'discord.js'
import fs from 'fs'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import database = require('./database.connect')
const TOKEN = process.env.DISCORD_KEY || ''
const TEST_GUILD_ID = process.env.DISCORD_TEST_GUILD || ''
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''

let dir = 'src'
let extension = '.ts'

// if we're in production mode we have js files instead of ts and the directory is called dist not src
if (process.env.NODE_ENV === 'prod') {
    dir = 'dist'
    extension = '.js'
}

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
const commandFiles = fs.readdirSync(`./${dir}/commands`).filter(file => file.endsWith(extension))
client.commands = new Collection()
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data)
    client.commands.set(command.data.name, command)
}
// register commands for development guild
const rest = new REST({ version: '9' }).setToken(TOKEN);
(async () => {
    if (process.env.NODE_ENV === 'dev') {
        try {
            console.log('Started refreshing application guild commands.')
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID),
                { body: commands },
            )

            console.log('Successfully reloaded application guild commands.')
        } catch (error) {
            console.error(error)
        }
    }
    if (process.env.NODE_ENV === 'prod') {
        try {
            console.log('Started refreshing application global commands.')
            await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: commands },
            )
            console.log('Successfully reloaded application global commands.')
        } catch (error) {
            console.error(error)
        }
    }
})()

// event handler
const eventFiles = fs.readdirSync(`./${dir}/events`).filter(file => file.endsWith(extension))
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