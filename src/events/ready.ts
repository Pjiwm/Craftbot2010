import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { Client } from "discord.js"
const TOKEN = process.env.DISCORD_KEY || '0'
const TEST_GUILD_ID = process.env.DISCORD_TEST_GUILD

export = {
    name: 'ready',
    once: true,
    execute(client: Client, commands: any[]) {
        console.log('bot is online')
        console.log(commands)
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
    }
}