import express from "express"
import fs from "fs/promises"
import { faker } from "@faker-js/faker"

const port = 3000
const app = express()

interface User {
    name?: string
    username: string
    password: string
}

class Server {
    private readonly pathToDB = "./usersdb.json"
    private _registeredUsers: Array<User> = new Array(0)
    private static _instance: Server
    private _isReady = false
    private _loggedUsers: Array<string> = new Array(0)

    constructor() {
        this.startDB().then(value => {
            console.log(value)
            this._isReady = true
        })
    }

    public login(userInput: User) {
        if (this.authenticate(userInput)) this.addLoggedUser(userInput.username)
    }

    public logout(userInput: User){
        if (this.authenticate(userInput)) this.removeLoggedUser(userInput.username)
    }

    public authenticate(input: User): boolean {
        let isValid = false
        for (let user of this._registeredUsers) {
            if (user.username == input.username && user.password && input.password) {
                isValid = true
                break
            }
        }

        return isValid
    }

    public isUserLogged(username: string): boolean {
        return this._loggedUsers.includes(username)
    }

    public addLoggedUser(username: string) {
        this.loggedUsers.push(username)
    }

    public removeLoggedUser(username: string) {
        for (let loggedName of this._loggedUsers) {
            if (loggedName === username) {
                const index = this._loggedUsers.indexOf(username)
                this._loggedUsers = this._loggedUsers.splice(index, 1)
                break
            }
        }
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
                this._registeredUsers = JSON.parse(value)
            })
        } catch (error) {
            console.error(error)
        }
    }

    public get loggedUsers() { return this._loggedUsers }

    public get registeredUsers(): Array<object> { return this._registeredUsers }

    public static get instance(): Server {
        if (Server._instance === null || Server._instance === undefined) {
            Server._instance = new Server();
        }
        return Server._instance;
    }

    private static set instance(server: Server) {
        Server._instance = server
    }

    public get isReady(): boolean { return this._isReady }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    const server = Server.instance
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