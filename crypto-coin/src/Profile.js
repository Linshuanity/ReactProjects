import React, { useState, useEffect } from 'react';
import { useParams, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostPage from './PostPage';
import './profile.css';

const posts = [
  { id: 1, title: 'German', content: 'Guten Tag.' },
  { id: 2, title: 'French', content: 'Bonjour.' },
  { id: 3, title: 'English', content: 'Hi' }
];

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
            <div key={profile.id} className="Profile-header">
              <img src={profile.photo} alt={`${profile.name}`} className={`Profile-photo`} />
              <div className="Profile-header-text">
                <h1>{profile.name}</h1>
              </div>
            </div>
          </a>
      ))}
    </ul>
    </div>
  );
}

function Profile(props) {
  //const { profiles } = props;
  //const { id } = useParams(); // Access the id parameter from the URL
  //const user = profiles.find(profile => profile.id === Number(id));

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
        <img src="https://www.shutterstock.com/image-vector/sample-red-square-grunge-stamp-260nw-338250266.jpg" alt="Profile" className="Profile-photo" />
        <div className="Profile-header-text">
          <h1>Linshuanity</h1>
          <p>{subscriberCount} subscribers</p>
          {!subscribed && <button onClick={handleSubscribe}>Subscribe</button>}
          {subscribed && <p>You are subscribed!</p>}
        </div>
      </div>
      <div className="Profile-content">
        {/* Profile content goes here */}
        <h1>Friends</h1>
        <Router>
          <Routes>
            <Route path="/profile" element={<Icons profiles={profiles} />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default Profile;

