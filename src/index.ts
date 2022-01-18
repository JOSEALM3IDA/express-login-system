import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { pool } from "./db";
import { exit } from 'process';

const SALT_ROUNDS = 10;

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hello from the TypeScript world!</h1>');
});

app.get('/login', (req: Request, res: Response) => {
    const { username, password }: { username: string, password: string } = req.body;
    
    if (!username) {
        console.error("Error: username not a string!");
        res.sendStatus(400);
        exit(-1);
    }

    if (!password) {
        console.error("Error: password not a string!");
        res.sendStatus(400);
        exit(-1);
    }

    bcrypt.hash(password, SALT_ROUNDS, (error: Error | undefined, hash: String) => {
        if (error) {
            console.error("Error hashing password: " + error.message);
            res.sendStatus(400);
        }

        console.log("Username: " + username)
        console.log("Password hash: " + hash);

        pool.query("SELECT * FROM public.user WHERE username = $1 AND password = $2",
            [username, hash],
            (err: Error, result: any) => {
                if (err) {
                    console.error("Error selecting from database:" + err.message);
                    res.json({ success: 1, error: err.message });
                    exit(1);
                }

                if (result.fields.length == 1) res.json({ success: 0 });
                else res.json({ success: 2, error: "Wrong username or password!" })
            }
        );
    });
});

app.post('/register', (req: Request, res: Response) => {
    const { username, email, password }: {username: string, email: string, password: string} = req.body;

    if (!username) {
        console.error("Error: username not a string!");
        res.sendStatus(400);
        exit(-1);
    }

    if (!email) {
        console.error("Error: email not a string!");
        res.sendStatus(400);
        exit(-1);
    }

    if (!password) {
        console.error("Error: password not a string!");
        res.sendStatus(400);
        exit(-1);
    }

    bcrypt.hash(password, SALT_ROUNDS, (error: Error | undefined, hash: String) => {
        if (error) {
            console.error("Error hashing password: " + error.message);
            res.sendStatus(400);
        }
        
        console.log("Username: " + username)
        console.log("Email: " + email)
        console.log("Password hash: " + hash);
        
        pool.query("INSERT INTO public.user(username, email, password) VALUES ($1, $2, $3)",
            [username, email, hash],
            (err: Error, result: any) => {
                if (err) {
                    console.error("Error inserting into database: " + err.message);
                    res.json({ success: 1, error: err.message });
                    exit(1);
                }
                
                res.json({ success: 0 });
            }
        );
    });
});

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));