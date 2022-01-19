import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class User extends BaseEntity {

    @PrimaryColumn()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    constructor(username: string, email:string, password: string) {
        super();
        this.username = username;
        this.email = email;
        this.password = password;
    }
}
