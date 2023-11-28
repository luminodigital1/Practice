const express = require("express");
import { createConnection } from 'typeorm';
import { register, login, verifyEmail, deleteUser, updateUser, followSomeone, getFeed, unfollowSomeone, logout, searchUser } from './src/controllers/UserController';
import { commentOnPost, deleteComment, deletePost, doPost, likePost, searchPost, unlikePost, updateComment, updatePost } from './src/controllers/PostController';

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
app.get('/logout', logout);
app.get('/verify/:token', verifyEmail);
app.post('/deleteUser',deleteUser);
app.post('/updateUser',updateUser);
app.get('/searchUser',searchUser);

app.post('/followSomeone', followSomeone);
app.post('/unfollowSomeone', unfollowSomeone);

app.get('/getFeed', getFeed);

app.post('/doPost', doPost);
app.post('/deletePost',deletePost);
app.post('/updatePost',updatePost);
app.get('/searchPost',searchPost);

app.post('/likePost', likePost);
app.post('/unlikePost',unlikePost);

app.post('/commentOnPost', commentOnPost);
app.post('/deleteComment', deleteComment);
app.post('/updateComment', updateComment);

