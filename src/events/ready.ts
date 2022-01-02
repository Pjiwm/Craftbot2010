import { Client } from "discord.js"

export = {
    name: 'ready',
    once: true,
    execute(client: Client) {
        console.log('bot is online')
        // set activity and status
        client.user?.setActivity({
            name: 'with your mom',
            type: 'PLAYING'
        })
        client.user?.setStatus('dnd')
    }
}