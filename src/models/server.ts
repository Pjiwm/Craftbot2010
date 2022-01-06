import { Document, Schema, model } from "mongoose"

export interface IServer extends Document {
    guildId: string,
    positiveScore: string,
    negativeScore: string,
}

const ServerSchema = new Schema({
    guildId: {
        type: 'string',
        required: true,
        unique: true
    },
    positiveScore: {
        type: 'string',
        default: '👍'
    },
    negativeScore: {
        type: 'string',
        default: '👎'
    }
})

export const ServerModel = model<IServer>('server', ServerSchema)