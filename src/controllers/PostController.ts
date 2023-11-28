import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import multer from 'multer';
import { User } from '../entities/User';
import { Posts } from '../entities/Post';
import { Likes } from '../entities/Likes';
import { Comments } from '../entities/Comments';
import { getUserInfoFromToken } from './VerifyToken';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Specify the destination folder for uploads
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Use a unique filename for each uploaded file
    }
  });
  
  const upload = multer({ storage: storage });

  export const doPost = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not found' });
      }
  
      const userInfo = getUserInfoFromToken(token);
  
      if (!userInfo) {
        return res
          .status(401)
          .json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
      }
  
      const email = userInfo.email;
      const userRepository = getRepository(User);
      const postRepository = getRepository(Posts);
      const user = await userRepository.findOne({ where: { email } });
  
      if (!user) {
        return res.status(401).json({ message: 'User does not exist' });
      }
  
      // Use the upload middleware to handle file uploads
      upload.single('file')(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'File upload failed' });
        }
  
        const { name, description } = req.body;
        const filePath = req.file?.path;
  
        // Create a new post with the file path
        const newPost = postRepository.create({
          name,
          description,
          user,
          filePath: filePath || null, // Set the filePath or null if it's not available
        });
  
        await postRepository.save(newPost);
        res.status(201).json({ message: 'New Post Created' });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'New Post Denied' });
    }
  };
  
  export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not found' });
        }
        const userInfo = getUserInfoFromToken(token);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
        }
        const userRepository = getRepository(User);
        const postRepository = getRepository(Posts);
        const email = userInfo.email;

        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const post = await postRepository.findOne({ where: { postId } });
        if (!post) {
            return res.status(401).json({ message: 'Post does not exist' });
        }

        console.log(post);

        const likeRepository = getRepository(Likes);
        let isLiking = await likeRepository.findOne({where : {
            user : {userId : user.userId},
            post : {postId: post.postId}
        }});

        if(isLiking){
            return res.status(200).json({message : 'Already Liking'});
        }

        const likesEntry = {
            user,
            post
        };
        await likeRepository.save(likesEntry);
        res.status(201).json({ message: 'Liked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Like Denied' });
    }
};


export const commentOnPost = async (req: Request, res: Response) => {
    try {
        const { postId, comment } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not found' });
        }
        const userInfo = getUserInfoFromToken(token);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
        }
        const email = userInfo.email;
        const userRepository = getRepository(User);
        const postRepository = getRepository(Posts);

        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const post = await postRepository.findOne({ where: { postId } });
        if (!post) {
            return res.status(401).json({ message: 'Post does not exist' });
        }

        if(!comment){
            return res.status(401).json({ message: 'Please add comment' });
        }

        const commentRepository = getRepository(Comments);
        
        // Ensure user and post properties are instances of User and Posts entities
        const addComment: Comments = commentRepository.create({
            user: user,
            post: post,
            comment: comment,
        });

        await commentRepository.save(addComment);
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Comment Denied' });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try
    {    
        const {post_name, post_description} = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not found' });
        }
        const userInfo = getUserInfoFromToken(token);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
        }

        const postRepository = getRepository(Posts);
        let post = await postRepository.find({where: {name: post_name, description: post_description},
            relations: ['user']}); 

        if(post.length === 0)
        {
            return res.status(200).json({message: "Post not found"});
        }
        
        if (userInfo.userId !== post[0].user.userId) {
            return res.status(403).json({ message: 'Forbidden: Only the owner can delete the post' });
        }
        await postRepository.delete({name: post_name, description: post_description});
        return res.status(200).json({message: "successfully deleted"});
    }
    catch(error){
        return res.status(202).json({error: "unable to del"});
    }
}

export const updatePost = async (req: Request, res: Response) => {
    try
    {    
        const {post_name, post_description, new_name, new_description} = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not found' });
        }
        const userInfo = getUserInfoFromToken(token);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
        }
        const postRepository = getRepository(Posts);
        let post = await postRepository.find({where: {name: post_name, description: post_description}});

        if(post.length === 0)
            {
                return res.status(200).json({message: "Post not found"});
            }
        
        if (userInfo.userId !== post[0].user.userId) {
            return res.status(403).json({ message: 'Forbidden: Only the owner can update the post' });
        }
        await postRepository.update({name: post_name, description: post_description},
            {name:new_name, description: new_description});
        return res.status(200).json({message: "successfully updated"});
    }
    catch(error){
        return res.status(202).json({error: "unable to update"});
    }
}

export const unlikePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not found' });
        }
        const userInfo = getUserInfoFromToken(token);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
        }

        const email = userInfo.email;
        const userRepository = getRepository(User);
        const postRepository = getRepository(Posts);

        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const post = await postRepository.findOne({ where: { postId } });
        if (!post) {
            return res.status(401).json({ message: 'Post does not exist' });
        }

        const likeRepository = getRepository(Likes);
        const entry = await likeRepository.findOne({where : 
            {user: {userId: user.userId}, 
            post : {postId: post.postId}}})
        
        if(entry){
            await likeRepository.delete({likesId: entry.likesId});
            return res.status(201).json({ message: 'Unliked' });
        }
        return res.status(201).json({ message: 'To unlike, first like the post' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Like Denied' });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { postId, comment } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not found' });
        }
        const userInfo = getUserInfoFromToken(token);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
        }
        const userRepository = getRepository(User);
        const postRepository = getRepository(Posts);
        const email = userInfo.email;

        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const post = await postRepository.findOne({ where: { postId } });
        if (!post) {
            return res.status(401).json({ message: 'Post does not exist' });
        }

        const commentRepository = getRepository(Comments);
        if(comment){
            const findComment = await commentRepository.find({
                where: {
                  comment: comment,
                  user: { userId: user.userId },
                  post: { postId: post.postId }
                } , relations : ['user', 'post']
              });
            
            if (userInfo.userId !== findComment[0].user.userId) {
                return res.status(403).json({ message: 'Forbidden: Only the owner can delete comment' });
            }
            if(findComment[0]){
                for(let cmt of findComment){
                    await commentRepository.delete({commentsId: cmt.commentsId});
                }
                return res.status(201).json({ message: 'Comment successfully deleted' });
            }
            return res.status(201).json({ message: 'Comment not found' });
        }

        const findComment = await commentRepository.find({where: {user: {userId: user.userId},
            post: {postId: post.postId}
            }});
        for(let cmt of findComment){
            await commentRepository.delete({commentsId: cmt.commentsId});
        }
        return res.status(201).json({ message: 'Comment successfully deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Comment Denied to delete' });
    }
};

export const updateComment = async (req: Request, res: Response) => {
    try {
        const { postId, comment } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token not found' });
        }
        const userInfo = getUserInfoFromToken(token);

        if (!userInfo) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
        }
        const userRepository = getRepository(User);
        const postRepository = getRepository(Posts);
        const email = userInfo.email;

        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const post = await postRepository.findOne({ where: { postId } });
        if (!post) {
            return res.status(401).json({ message: 'Post does not exist' });
        }

        const commentRepository = getRepository(Comments);
        if(comment){
            const findComment = await commentRepository.find({
                where: {
                  user: { userId: user.userId },
                  post: { postId: post.postId }
                }, relations : ['user', 'post']
              });
              
            if (userInfo.userId !== findComment[0].user.userId) {
                return res.status(403).json({ message: 'Forbidden: Only the owner can delete comment' });
            }
            if(findComment[0]){
                for(let cmt of findComment){
                    await commentRepository.update({commentsId: cmt.commentsId},{comment:comment});
                }
                return res.status(201).json({ message: 'Comment successfully updated' });
            }
            return res.status(201).json({ message: 'Comment not found' });
        }
        return res.status(201).json({ message: 'Please add comment' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Comment Denied to delete' });
    }
};

export const searchPost = async (req: Request, res: Response) =>{
    try{
      const {keyword} = req.body;
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
          return res.status(401).json({ message: 'Unauthorized: Token not found' });
      }
      const userInfo = getUserInfoFromToken(token);
  
      if (!userInfo) {
          return res.status(401).json({ message: 'Unauthorized: Invalid token or userId not found in cache' });
      }
      
      if(!keyword){
        return res.status(500).json({messade: 'Please enter something to search'});
      }
  
      const postRepository = getRepository(Posts);
  
      const searchResult:  Pick<Posts, 'name' | 'description'>[] = await postRepository.createQueryBuilder('post')
      .select(['name', 'description', 'user.email'])
      .leftJoin('post.user','user')
      .where('post.name LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('post.description LIKE :keyword', { keyword: `%${keyword}%` })
      .getRawMany();    
  
      res.status(201).json({searchResult});
    }
    catch(error){
      res.status(200).json({error: 'unable to search post'});
    }
  }