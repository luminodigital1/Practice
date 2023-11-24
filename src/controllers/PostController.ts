import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Posts } from '../entities/Post';
import { Likes } from '../entities/Likes';
import { Comments } from '../entities/Comments';

export const doPost = async (req: Request, res: Response) => {
    try {
        const { email, name, description } = req.body;
        const userRepository = getRepository(User);
        const postRepository = getRepository(Posts);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'User do not exist' });
        }
        const newPost = postRepository.create({
            name,
            description,
            user
          });
      
        await postRepository.save(newPost);
        res.status(501).json({message: 'New Post Created' });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: 'New Post Denied' });
    }
  };
  
  export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId, email } = req.body;
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

        console.log(post);

        const likeRepository = getRepository(Likes);
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
        const { postId, email, comment } = req.body;
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
        const postRepository = getRepository(Posts);
        let post = await postRepository.find({where: {name: post_name, description: post_description}});

        if(!post[0])
            {
                return res.status(200).json({message: "Post not found"});
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
        const postRepository = getRepository(Posts);
        let post = await postRepository.find({where: {name: post_name, description: post_description}});

        if(!post[0])
            {
                
                return res.status(200).json({message: "Post not found"});
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
        const { postId, email } = req.body;
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
        const { postId, email, comment } = req.body;
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

        const commentRepository = getRepository(Comments);
        if(comment){
            const findComment = await commentRepository.find({
                where: {
                  comment: comment,
                  user: { userId: user.userId },
                  post: { postId: post.postId }
                }
              });
            
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
        const { postId, email, comment } = req.body;
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

        const commentRepository = getRepository(Comments);
        if(comment){
            const findComment = await commentRepository.find({
                where: {
                  user: { userId: user.userId },
                  post: { postId: post.postId }
                }
              });
            
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