import { UserModel } from "../models/user"
export default class ServerController {

    async getUsers() {
        return await UserModel.find()
    }
}