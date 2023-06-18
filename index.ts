import express from "express"
import fs from "fs/promises"
import { faker } from "@faker-js/faker"

const port = 3000
const app = express()
const pathToDB = "./usersdb.json"

fs.access(pathToDB, fs.constants.F_OK)
    .then(() => console.log("The \"usersdb.json\" already exists."))
    .catch((err) => createUsersDB(50))

app.listen(port, () => console.log(`Server is running on port ${port}`))

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