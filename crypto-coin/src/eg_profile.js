import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = ({ name, bio, posts }) => {
  return (
    <div>
      <h1>{name}</h1>
      <p>{bio}</p>
      <h2>Posts:</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfilePage;

