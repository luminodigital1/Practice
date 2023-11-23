// src/entities/YourEntity.ts

import { Entity, PrimaryGeneratedColumn,Unique, Column } from 'typeorm';
import bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  verified: boolean;

  @Column()
  verificationToken: string;

  constructor() {
    this.userId = 0;
    this.email = "";
    this.password = "";
    this.firstName = "";
    this.lastName = "";
    this.verified = false;
    this.verificationToken = "";
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
