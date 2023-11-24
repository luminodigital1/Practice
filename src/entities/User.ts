// src/entities/YourEntity.ts

import { Entity, PrimaryGeneratedColumn,OneToMany, Column, ManyToMany } from 'typeorm';
import bcrypt from 'bcrypt';
import { Likes } from './Likes';
import { Posts } from './Post';
import { Followers } from './Followers';

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

  @OneToMany(() => Posts, posts => posts.postId)
  posts!: Posts[]

  @OneToMany(() => Likes, likes => likes.user)
  likes!: Likes[];

  // One user can have multiple followers
  @OneToMany(() => Followers, follower => follower)
  follower!: Followers[];

  // One user can be followed by multiple users
  @OneToMany(() => Followers, follower => follower.followeeUser)
  followees!: Followers[];

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
