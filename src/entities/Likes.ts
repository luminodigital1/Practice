// src/entities/PostLike.ts

import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './User';
import { Posts } from './Post';

@Entity()
@Unique(['user', 'post'])
export class Likes {

  @PrimaryGeneratedColumn()
    likesId!: number;

  // Many-to-one relationship with User
  @ManyToOne(() => User, user => user.likes, {onDelete: "CASCADE"})
  @JoinColumn({ name: 'LikedByUser' })
    user!: User;

  // Many-to-one relationship with Post
  @ManyToOne(() => Posts, post => post.likes, {onDelete: "CASCADE"})
  @JoinColumn({ name: 'PostId' })
    post!: Posts;
}
