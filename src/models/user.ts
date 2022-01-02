import { Document, Schema, model } from "mongoose"

export interface IUser extends Document {
    userId: string,
    positiveScoreCount: number
    negativeScoreCount: number
}

const UserSchema = new Schema({
    guildId: {
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
    }
})

export const UserModel = model<IUser>('user', UserSchema)