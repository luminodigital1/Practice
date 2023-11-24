import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity()
@Unique(['followerUser', 'followeeUser'])
export class Followers {

  @PrimaryGeneratedColumn()
    followerId!: number;

  // Many-to-one relationship with the User entity (follower)
  @ManyToOne(() => User, user => user.follower)
    @JoinColumn({ name: 'followerUserId' })
    followerUser!: User;

  // Many-to-one relationship with the User entity (followee)
  @ManyToOne(() => User, user => user.followees)
    @JoinColumn({ name: 'followeeUserId' })
    followeeUser!: User;
}


// import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
// import { User } from './User';
 
// @Entity()
// export class Followers {
//   @PrimaryGeneratedColumn()
//     id!: number;
 
//   @Column()
//     userId!: number;
 
//   @Column()
//     followerId!: number;
 
//   @ManyToMany(() => User, user => user.follower)
//     @JoinTable({
//         name: 'user_followers',
//         joinColumn: {
//             name: 'userId',
//             referencedColumnName: 'id',
//         },
//         inverseJoinColumn: {
//             name: 'followerId',
//             referencedColumnName: 'id',
//         },
//     })
//     followers!: User[];
// }