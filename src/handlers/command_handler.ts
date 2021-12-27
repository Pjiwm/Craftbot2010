import { Client } from 'discord.js'
import fs from 'fs'
export = (client: Client) => {
    const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts'))
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`)
        client.commands.set(command.data.name, command)
    }
}