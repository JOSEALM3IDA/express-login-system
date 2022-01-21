import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import "reflect-metadata";
import { User } from './entity/User';
import { ConfirmationToken } from './entity/ConfirmationToken';
import { createConnection } from "typeorm";
import { randomBytes } from 'crypto';

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
            res.json({ status: 403, error: "Wrong username or password" });
            return;
        }

        if (!user.confirmed) {
            res.json({ status: 403, error: "Email awaiting confirmation" });
            return;
        }

        console.log("Successful login from user " + username);
        res.sendStatus(200);
    } catch (err: any) {
        console.log(err.message);
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }
});

app.post('/register', async (req: Request, res: Response) => {
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
            const existingUser = await User.findOne({ username })
            if (existingUser) {
                console.log(`${username}: can't register because username already exists`);
                res.json({ status: 409, error: "Username already exists" })
                return;
            }

            const user = User.create({ username, email, password: hash });
            await user.save();
            console.log("Created User: " + user.username)

            const token = randomBytes(32).toString("hex");
            const expiration = new Date(new Date().getTime() + 15*60000); // Add 15 minutes to current time

            const confirmationToken = ConfirmationToken.create({ token, username, expiration });
            await confirmationToken.save();
            console.log(`Created token ${confirmationToken.token} for email ${user.email} with expiration date ${expiration}`);
 
            res.json({ status: 201, token: token }) // Token should NOT be sent back to the user this way. This is just a proof of concept!
        } catch(err: any) {
            console.log("Error inserting into database: " + err.message);
            res.json({ status: 500, error: "Something went wrong" })
            return;
        }
    });
});

app.post("/confirm", async (req: Request, res: Response) => {
    const { token: tokenQ } = req.query;

    if (!tokenQ) {
        console.log("Error: token not a string!");
        res.json({ status: 500, error: "Something went wrong" })
        return;
    }

    const token = tokenQ as string;

    const existingToken = await ConfirmationToken.findOne(
        { token: token },
        { relations: ["user"] }
    );

    if (!existingToken) {
        console.log(`Token doesn't exist: ${token}`);
        res.json({ status: 404, error: "Non existent token" });
        return;
    }

    if (existingToken.expiration < new Date()) {
        console.log(`Token for confirmation of email ${existingToken.user.email} of user ${existingToken.user.username} has expired at the time of the request`);
        existingToken.remove();
        res.json({ status: 410, error: "Token has expired" });
        return;
    }

    existingToken.user.confirmed = true;
    existingToken.user.save();
    existingToken.remove();
    console.log(`Confirmed email ${existingToken.user.email} of user ${existingToken.user.username} with token ${existingToken.token}`);
    res.sendStatus(200);
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
    "entities": [User, ConfirmationToken]
}).then(async (connection) => {
    app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
}).catch(error => console.log("Couldn't connect to database! " + error));