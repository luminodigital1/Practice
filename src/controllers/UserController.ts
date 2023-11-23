import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

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

// src/controllers/UserController.ts

// ... (existing imports)

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