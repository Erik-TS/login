import express from "express"
import fs from "fs/promises"
import { faker } from "@faker-js/faker"

const port = 3000
const app = express()
let registeredUsers: Array<object> = []

class Server {
    private readonly pathToDB = "./usersdb.json"
    private registeredUsers: Array<object> = new Array(0)
    private static instance: Server
    private isReady = false

    constructor() {
        this.startDB().then(value => {
            console.log(value)
            this.isReady = true
        })
    }

    public getRegisteredUsers(): Array<object> { return this.registeredUsers }

    public static getInstance(): Server {
        if (Server.instance === null || Server.instance === undefined) Server.instance = new Server()
        return Server.instance
    }

    public getIsReady(): boolean { return this.isReady }

    public addRegisteredUsers(users: Array<object>) {
        registeredUsers.push(users)
    }

    private async startDB() {
        await this.prepareDB()
        await this.importRegisteredUsersFromDB()
        return "The database has been started."
    }

    private async prepareDB() {
        await fs.access(this.pathToDB, fs.constants.F_OK)
            .then(() => console.log("The \"usersdb.json\" already exists."))
            .catch((err) => createUsersDB(50))
    }

    private async importRegisteredUsersFromDB() {
        try {
            await fs.readFile(this.pathToDB, "utf-8").then(value => {
                this.registeredUsers = JSON.parse(value)
            })
        } catch (error) {
            console.error(error)
        }
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    const server = Server.getInstance()
})

async function createUsersDB(quant: number) {
    interface User {
        name: string,
        userName: string,
        password: string
    }

    function generateUsers(quant: number): Array<User> {
        const userList: Array<User> = []

        for (let i = 0; i < quant; i++) {
            const sex = Math.random() % 2 == 0 ? "male" : "female"
            const fullname = { first: faker.person.firstName(sex), last: faker.person.lastName("female") }
            const user: User = {
                name: `${fullname.first} ${fullname.last}`,
                userName: faker.internet.userName({
                    firstName: fullname.first,
                    lastName: fullname.last
                }),
                password: faker.internet.password()
            }

            userList.push(user)
        }
        return userList
    }

    const users: Array<User> = generateUsers(quant)
    let str = JSON.stringify(users)

    try {
        await fs.writeFile("./usersdb.json", str)
        console.log("\"usersdb.json\" was created with success.")
    }
    catch (err) {
        console.error(err)
    }
}