// src/entities/YourEntity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Likes } from './Likes';

@Entity()
export class Posts {

  @PrimaryGeneratedColumn()
  postId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  // Define the many-to-one relationship with the User entity
  @ManyToOne(() => User, user => user.email)
    @JoinColumn({ name: 'PostByUser' }) // Specify the foreign key column name
    user!: User;

  @OneToMany(() => Likes, likes => likes.post)
    likes!: Likes[];

  constructor(){
    this.postId = 0;
    this.name = "";
    this.description = "";
    // this.user = new User();
  }
}
