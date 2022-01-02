import { Document, Schema, model } from "mongoose"
import { IUser, UserModel } from "./user"

export interface IServer extends Document {
    guildId: string,
    positiveScore: string,
    negativeScore: string,
    users: IUser[]
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
    },
    users: {
        type: [UserModel],
        default: []
    }
})

export const ServerModel = model<IServer>('server', ServerSchema)