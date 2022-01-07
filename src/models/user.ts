import { Document, Schema, model } from "mongoose"

export interface IUser extends Document {
    userId: string
    positiveScoreCount: number
    negativeScoreCount: number
    guildId: string
    lastReaction: Date
    ratio: any
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
}
)

UserSchema.virtual('ratio').get(function (this: IUser) {
    console.log(this.positiveScoreCount)
    console.log(this.negativeScoreCount)
    if (this.positiveScoreCount === 0 && this.negativeScoreCount === 0) {
        return 0
    } else if (this.positiveScoreCount === 0) {
        return this.negativeScoreCount * -1
    } else if (this.negativeScoreCount === 0) {
        return this.positiveScoreCount
    } else {
        console.log(this.positiveScoreCount / this.negativeScoreCount)
        return (this.positiveScoreCount / this.negativeScoreCount).toFixed(2)
    }
})

export const UserModel = model<IUser>('user', UserSchema)