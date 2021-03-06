import mongoose = require('mongoose')

mongoose.Promise = global.Promise
function connectToMongo(): void {
    const mongoUrl = process.env.MONGO_DATABASE_CONNECTION || 'mongodb://localhost:27017/craftbot'
    try {
        mongoose.connect(mongoUrl)
        console.log('Connected to Mongo DB')
    } catch (err) {
        console.log('Failed to connect to Mongo database')
        console.log(err)
    }
}

export { connectToMongo }