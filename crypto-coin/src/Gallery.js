import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Post from './Post';
import './gallery.css';

/*
export const posts = [
  { id: 1, owner: 'Dingy', author: 'Linshuanity', title: 'Go! Go! Vrius', content: 'Join GoVirus, or I will come back with a gun.', expire_date:'2025/12/31' },
  { id: 2, owner: 'Lin', author: 'Lin', title: 'So hard', content: 'Look at that\n2\n3\n4\n5\n6', expire_date:'2023/01/31' }
];
*/
export const posts = [];

function GalleryList(props) {
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

function Gallery(props) {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Call API to get subscriber count
    fetch('http://localhost:8080/api/article/getPost')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error(error));
  }, []);

  function handleSubscribe() {
    // Call API to subscribe user
    fetch('/api/subscribe', { method: 'POST' })
      .then(response => response.json())
      .then(data => setSubscribed(data.subscribed))
      .catch(error => console.error(error));
  }

  return (
    <div className="Gallery">
      <div className="Gallery-header">
        <img src="https://picsum.photos/100" alt="Gallery" className="Gallery-photo" />
        <div className="Gallery-header-text">
          <h1>Linshuanity</h1>
          <p>{subscriberCount} subscribers</p>
          {!subscribed && <button onClick={handleSubscribe}>Subscribe</button>}
          {subscribed && <p>You are subscribed!</p>}
        </div>
      </div>
      <div className="Gallery-content">
        <GalleryList posts={posts} />
      </div>
    </div>
  );
}

export default Gallery;

