import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { Followers } from '../entities/Followers';
import { Posts } from '../entities/Post';

export const register = async (req: Request, res: Response) => {
  try {
    const userRepository = getRepository(User);
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //generete token
    const verificationToken = uuidv4();

    const user = userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verified: false,
      verificationToken
    });

    const savedUser = await userRepository.save(user);

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'ssmtp.gmail.com',
      port: 465,
      auth: {
        user: 'correctionassistant@gmail.com',
        pass: 'lpco sgpf zotp vsnk',
      },
    });

    const verificationLink = `http://localhost:3000/verify/${verificationToken}`;
    const mailOptions = {
      from: 'correctionassistant@gmail.com',
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the link: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      res.status(201).json({ message: 'User registered successfully. Check your email for verification.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Here you can generate and send a JWT token for authentication
  // For simplicity, let's send a success message for now
  return res.status(200).json({ message: 'Login successful' });
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark the user as verified and clear the verification token
    user.verified = true;
    await userRepository.save(user);

    res.status(200).json({ message: 'Email verification successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    await userRepository.remove(user);
    return res.status(401).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(600).json({ error: 'unable to remove user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    user.password = password;
    user.firstName = firstName;
    user.lastName= lastName;
    
    await userRepository.save(user);
    return res.status(401).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(600).json({ error: 'unable to update user' });
  }
};

export const followSomeone = async (req: Request, res: Response) => {
  try{
    const { followeeEmail, followerEmail } = req.body;
    const userRepository = getRepository(User);
    let email = followeeEmail;
    const followee = await userRepository.findOne({ where: { email } });
    if (!followee) {
      return res.status(401).json({ message: 'Followee not found' });
    }
    email = followerEmail;
    const follower = await userRepository.findOne({ where: { email } });
    if (!follower) {
      return res.status(401).json({ message: 'Follower not found' });
    }

    const followerRepository = getRepository(Followers);
    const entry = await followerRepository.create({
      followeeUser: followee,
      followerUser : follower
    })
    await followerRepository.save(entry);
    return res.status(300).json({message : 'Started to follow'});

  }catch(error)
  {
    return res.status(300).json({message : 'Unable to follow'});
  }
}

export const getFeed = async (req: Request, res: Response) => {
  try
  {
    const {email} = req.body;
    const userRepository = getRepository(User);
    const followersRepository = getRepository(Followers);
    const postRepository = getRepository(Posts);

    const current_user = await userRepository.findOne({where : {email}});
    if(!current_user){
      return res.status(200).json("User not found");
    }

    let feed : Posts[] = [];
    let user_posts = await postRepository.find({where: {user: {userId: current_user.userId}}});
    feed.push(...user_posts);

    let user_followees : Followers[] = [];
    let followees = await followersRepository.find({where : {followerUser : {userId: current_user.userId}}});
    user_followees.push(...followees);

    // return res.status(200).json({user_followees});

    let fetchFromFollowers: Followers[] = [];
    for (let obj of user_followees) {
      let entities = await followersRepository.find({
        where: { followerId: obj.followerId },
        relations: ['followeeUser'],
      });

      if (entities) {
        fetchFromFollowers = fetchFromFollowers.concat(entities);
      }
    }

    for(let obj of fetchFromFollowers){
      const fUserId = obj.followeeUser.userId;
      let fPosts = await postRepository.find({where: {user: {userId: fUserId}}});
      feed.push(...fPosts);
    }
    return res.status(200).json({feed});

    // console.log(`.............. ${followees}`);
    // return res.status(100).json(user_posts);

  }
  catch(error){
    return res.status(300).json({error: "internal server error"});
  }
}

export const unfollowSomeone = async (req: Request, res: Response) => {
  try{
    const { followeeEmail, followerEmail } = req.body;
    const userRepository = getRepository(User);
    let email = followeeEmail;
    const followee = await userRepository.findOne({ where: { email } });
    if (!followee) {
      return res.status(401).json({ message: 'Followee not found' });
    }

    email = followerEmail;
    const follower = await userRepository.findOne({ where: { email } });
    if (!follower) {
      return res.status(401).json({ message: 'Follower not found' });
    }
    
    const followerRepository = getRepository(Followers);
    const ifFollowing = await followerRepository.findOne({where: {followeeUser : {email : followeeEmail}, 
      followerUser : {email: followerEmail}
    }});

    if(ifFollowing){
      await followerRepository.delete({ followerId: ifFollowing.followerId});
      return res.status(200).json({message: "Unfollowing"});
    }
    return res.status(300).json({message : `To unfollow, ${followerEmail} should follow ${followeeEmail}`});

  }catch(error)
  {
    return res.status(300).json({message : 'Unable to unfollow'});
  }
}
