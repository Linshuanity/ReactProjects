import React, { useState, useEffect } from 'react';
import Post from './Post';
import Link from '@mui/material/Link';
import './home.css';

const profiles = [
  { id: 1, name: 'Linshuanity', photo: 'https://picsum.photos/100' },
  { id: 2, name: 'Jane Doe', photo: 'https://picsum.photos/100?random=1' },
  { id: 3, name: 'John Smith', photo: 'https://picsum.photos/100?random=2' }
];

function Icons({ profiles }) {
  return (
    <div>
    <ul>
      {profiles.map(profile => (
          <a href={`/profile/${profile.id}`}>
            <div key={profile.id} className="Nav-header">
              <img src={profile.photo} alt={`${profile.name}`} className="Nav-photo"/>
              <div className="Nav-header-text">
                <h1>{profile.name}</h1>
              </div>
            </div>
          </a>
      ))}
    </ul>
    </div>
  );
}

function PostList(props) {
  const { posts } = props;

  return (
    <ul>
      {posts.map((post) => (
        <div key={post.pid}>
          <a href={`/posts/${post.pid}`}>
            <Post
              creator={post.author}
              owner={post.owner}
              expire_date={post.expire_date}
              contentText={post.content}
              contentImage="https://picsum.photos/500"
              ownerImage="https://picsum.photos/50"
              creatorImage="https://picsum.photos/50"
            />
          </a>
        </div>
      ))}
    </ul>
  );
}

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="Profile-content">
          <Icons profiles={profiles} />
      </div>
    </div>
  );
};

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Call API to get subscriber count
    fetch('http://localhost:8080/api/article/getPost')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="Home">
      <div>
        <h1>Virus World</h1>
        <Link href="/SignIn">SignIn</Link>
        <br/>
        <Link href="/SignUp">SignUp</Link>
        <p>About us.</p>
      </div>
      <div className="Sidebar">
        <Sidebar/>
      </div>
      <div className="Home-content">
        <PostList posts={posts} />
      </div>
    </div>
  );
}

export default Home;
