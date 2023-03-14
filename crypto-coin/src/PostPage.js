import React from 'react';
import { useParams } from 'react-router-dom';

const PostPage = ({ posts }) => {
  const { id } = useParams();
  const post = posts.find(post => post.id === parseInt(id));
  
  if (!post) {
    return <div>Post not found</div>;
  }
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
};

export default PostPage;

