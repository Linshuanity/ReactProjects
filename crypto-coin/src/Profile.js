import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostPage from './PostPage';
import './profile.css';

const posts = [
  { id: 1, title: 'German', content: 'Guten Tag.' },
  { id: 2, title: 'French', content: 'Bonjour.' },
  { id: 3, title: 'English', content: 'Hi' }
];

function Profile(props) {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Call API to get subscriber count
    fetch('http://localhost:3000/api/subscriberCount')
      .then(response => response.json())
      .then(data => setSubscriberCount(data.count))
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
    <div className="Profile">
      <div className="Profile-header">
        <img src="https://picsum.photos/100" alt="Profile" className="Profile-photo" />
        <div className="Profile-header-text">
          <h1>Linshuanity</h1>
          <p>{subscriberCount} subscribers</p>
          {!subscribed && <button onClick={handleSubscribe}>Subscribe</button>}
          {subscribed && <p>You are subscribed!</p>}
        </div>
      </div>
      <div className="Profile-content">
        {/* Profile content goes here */}
        <h1>Linshuanity</h1>
        <Router>
          <Routes>
            <Route path="/profile" element={<PostPage name="John Doe" bio="Lorem ipsum dolor sit amet." posts={posts} />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default Profile;

