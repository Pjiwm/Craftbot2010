declare module "discord.js" { export interface Client { commands: Collection<unknown, any> } }
import { Intents, Interaction, Client, Collection } from 'discord.js'
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

    // Listener
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


    // set activity and status
    client.user?.setActivity({
        name: 'with your mom',
        type: 'PLAYING'
    })
    client.user?.setStatus('dnd')
})

client.login(process.env.DISCORD_KEY)