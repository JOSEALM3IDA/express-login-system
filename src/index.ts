import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import "reflect-metadata";
import { exit } from 'process';
import { User } from './entity/user';
import { createConnection } from "typeorm";

const SALT_ROUNDS = 10;

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const envDbPort = parseInt(process.env.DB_PORT || '')
const dbPort = Number.isInteger(envDbPort) ? envDbPort : 5432

app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hello from the TypeScript world!</h1>');
});

app.post('/login', async (req: Request, res: Response) => {
    const { username, password }: { username: string, password: string } = req.body;
    
    if (!username) {
        console.log("Error: username not a string!");
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }

    if (!password) {
        console.log("Error: password not a string!");
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }

    try {
        let user = await User.findOne(username);

        if (!user) {
            console.log("Found no user with username: " + username);
            res.json({ status: 500,  error: "Found no user with such username" });
            return;
        }

        if (!(await bcrypt.compare(password, user.password))) {
            console.log("Failed login from user " + username);
            res.json({ status: 500, error: "Wrong username or password" });
            return;exreturn; return;
        }

        console.log("Successful login from user " + username);
        res.sendStatus(200);
    } catch (err: any) {
        console.log(err.message);
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }
});

app.post('/register', (req: Request, res: Response) => {
    const { username, email, password }: {username: string, email: string, password: string} = req.body;

    if (!username) {
        console.log("Error: username not a string!");
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }

    if (!email) {
        console.log("Error: email not a string!");
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }

    if (!password) {
        console.log("Error: password not a string!");
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }

    bcrypt.hash(password, SALT_ROUNDS, async (error: Error | undefined, hash: string) => {
        if (error) {
            console.log("Error hashing password: " + error.message);
            res.json({ status: 500, error: "Something went wrong" })
            return;
        }

        try {
            const user = User.create({ username, email, password: hash });
            await user.save();
            console.log("Created User: " + user.username)
            res.sendStatus(201);
        } catch(err: any) {
            console.log("Error inserting into database: " + err.message);
            res.json({ status: 500, error: "Something went wrong" })
            return;
        }
    });
});

createConnection({
    "type": "postgres",
    "host": process.env.DB_HOST || "localhost",
    "port": dbPort,
    "username": process.env.DB_USER || "postgres",
    "password": process.env.DB_PASSWORD || "postgres",
    "database": process.env.DB_NAME || "database",
    "synchronize": false,
    "logging": false,
    "entities": [User]
}).then(async (connection) => {
    app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
}).catch(error => console.log("Couldn't connect to database! " + error));