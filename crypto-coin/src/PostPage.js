import React from 'react';
import { Link } from 'react-router-dom';

const PostPage = ({ posts }) => {
  return (
    <div>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/gallery/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostPage;

