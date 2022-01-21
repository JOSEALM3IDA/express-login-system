import { Entity, PrimaryColumn, Column, BaseEntity, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User"

@Entity({ name: "confirmation_token" })
export class ConfirmationToken extends BaseEntity {

    @PrimaryColumn()
    token: string;

    @Column()
    username: string;
    @OneToOne(() => User, user => user.username)
    @JoinColumn({ name: "username" })
    user: User;

    @Column()
    expiration: Date;
}
