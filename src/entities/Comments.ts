// src/entities/PostLike.ts

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import { User } from './User';
import { Posts } from './Post';

@Entity()
export class Comments {

  @PrimaryGeneratedColumn()
    commentsId!: number;

  // Many-to-one relationship with User
  @ManyToOne(() => User, user => user, {onDelete : 'CASCADE'})
  @JoinColumn({ name: 'CommentByUser' })
    user!: User;

  // Many-to-one relationship with Post
  @ManyToOne(() => Posts, post => post.likes, {onDelete : 'CASCADE'})
  @JoinColumn({ name: 'PostId' })
    post!: Posts;

    @Column()
    comment!: string;
}