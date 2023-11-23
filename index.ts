const express = require("express");
import { createConnection } from 'typeorm';
import { register, login, verifyEmail, deleteUser, updateUser } from './src/controllers/UserController';
import { EntityManager } from 'typeorm';
import { User } from './src/entities/User';

const app = express();
const port = 3000;
app.use(express.json());


createConnection()
  .then((connection) => {
    console.log('Connected to the database');

  })
  .catch((error) => console.log('TypeORM connection error: ', error));


app.listen(port,()=>{
    console.log(`app started listening at ${port}`)
} )

app.post('/register', register);
app.get('/login', login);
app.get('/verify/:token', verifyEmail);
app.post('/deleteUser',deleteUser);
app.post('/updateUser',updateUser);