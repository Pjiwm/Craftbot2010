import { Document, Schema, model } from "mongoose"

export interface IUser extends Document {
    userId: string
    positiveScoreCount: number
    negativeScoreCount: number
    guildId: string
    lastReaction: Date
}

const UserSchema = new Schema({
    userId: {
        type: 'string',
        required: true,
        unique: true
    },
    positiveScoreCount: {
        type: 'number',
        default: 0
    },
    negativeScoreCount: {
        type: 'number',
        default: 0
    },
    guildId: {
        type: 'string',
        required: true
    },
    lastReaction: {
        type: 'Date',
        default: new Date('2000/1/1')
    }
})

export const UserModel = model<IUser>('user', UserSchema)