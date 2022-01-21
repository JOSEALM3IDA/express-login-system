import { Entity, PrimaryColumn, Column, BaseEntity, OneToOne } from "typeorm";
import { ConfirmationToken } from "./ConfirmationToken"

@Entity({ name: "user" })
export class User extends BaseEntity {

    @PrimaryColumn()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    confirmed: boolean = false;

    @OneToOne(() => ConfirmationToken, confirmationToken => confirmationToken.user)
    confirmationToken: ConfirmationToken;
}
