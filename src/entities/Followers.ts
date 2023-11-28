import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity()
@Unique(['followerUser', 'followeeUser'])
export class Followers {

  @PrimaryGeneratedColumn()
    followerId!: number;

  // Many-to-one relationship with the User entity (follower)
  @ManyToOne(() => User, user => user.follower, {onDelete: "CASCADE"})
    @JoinColumn({ name: 'followerUserId' })
    followerUser!: User;

  // Many-to-one relationship with the User entity (followee)
  @ManyToOne(() => User, user => user.followees, {onDelete: "CASCADE"})
    @JoinColumn({ name: 'followeeUserId' })
    followeeUser!: User;
}