import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

const saltRounds = 10;

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hello from the TypeScript world!</h1>');
});

app.post('/register', (req: Request, res: Response) => {
    let username: any = req.query.username;
    if (typeof username !== 'string' && !(username instanceof String)) {
        res.sendStatus(400);
    }

    let email: any = req.query.email;
    if (typeof email !== 'string' && !(email instanceof String)) {
        res.sendStatus(400);
    }

    let password: any = req.query.password;
    if (typeof password !== 'string' && !(password instanceof String)) {
        res.sendStatus(400);
    }

    password = password as string;
    email = email as string;
    password = password as string;

    

    bcrypt.hash(password, saltRounds, (error: any, hash: String) => {
        if (error) res.sendStatus(400);
        
        console.log("Username: " + username)
        console.log("Email: " + email)
        console.log("Password hash: " + hash);
        res.sendStatus(200);
    });
});

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));