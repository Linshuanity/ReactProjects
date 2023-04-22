import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './profile.css';

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
  const { profiles } = props;
  const { id } = useParams(); // Access the id parameter from the URL
  const profile = profiles.find(profile => profile.id === Number(id));

  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if the current user is already subscribed
    fetch(`http://localhost:8080/api/subscribe/${id}`)
      .then(response => response.json())
      .then(data => setSubscriberCount(data[0].result))
      .catch((error) => {
        console.error(error);
      });
    fetch(`http://localhost:8080/api/subscribe/99/${id}`)
      .then(response => response.json())
      .then((data) => {
        setIsSubscribed(data.subscribed);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  const handleSubscribeClick = () => {
    // Update the subscription status in the database
    fetch('http://localhost:8080/api/subscribe/update', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriber_id: 99,
        subscribed_id: id
      })
    })
    .then((response) => {
      setIsSubscribed(true);
    })
    .catch((error) => {
      console.error(error);
    });
  };

  const handleUnsubscribeClick = () => {
    // Update the subscription status in the database
    fetch('http://localhost:8080/api/subscribe/update', { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriber_id: 99,
        subscribed_id: id
      })
    })
    .then((response) => {
      setIsSubscribed(false);
    })
    .catch((error) => {
      console.error(error);
    });
  };
  
  return (
    <div className="Profile">
      <div className="Profile-header">
        <img src="https://www.shutterstock.com/image-vector/sample-red-square-grunge-stamp-260nw-338250266.jpg" alt="Profile" className="Profile-photo" />
        <div className="Profile-header-text">
          <h1>{profile.name}</h1>
          <p>{subscriberCount} subscribers</p>
          {!isSubscribed && <button onClick={handleSubscribeClick}>Subscribe</button>}
          {isSubscribed && <button onClick={handleUnsubscribeClick}>Unsubscribe</button>}
        </div>
      </div>
      <div className="Profile-content">
        {/* Profile content goes here */}
        <h1>Friends</h1>
          <Icons profiles={profiles} />
      </div>
    </div>
  );
}

export default Profile;

