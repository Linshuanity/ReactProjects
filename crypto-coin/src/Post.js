import React, { useState } from 'react';
import Modal from 'react-modal';

import NumberInputButton from './Number';
import './post.css';

Modal.setAppElement('#root');

const Post = ({ creator, owner, deadline, contentText, contentImage, creatorImage, ownerImage }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);

  const openModal = (e) => {
    e.stopPropagation();
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLikes(likes + 1);
  };

  const handleDislike = (e) => {
    e.stopPropagation();
    setDislikes(dislikes + 1);
  };

  const handleComment = (e) => {
    e.stopPropagation();
    setShowCommentInput(!showCommentInput);
  };

  return (
    <div className="post-container" onClick={openModal}>
      <div className="post-header">
        <img className="post-creator-img" src={creatorImage} alt="Profile" />
        <span className="creator-name">{creator}</span>
        <img className="post-owner-img" src={ownerImage} alt="Owner" />
      </div>
      <div className="post-image-container">
        <img className="post-image" src={contentImage} alt="Post content" />
      </div>
      <div className="post-actions">
        <button className="post-action-btn" onClick={handleLike}>
          <span className="post-like">❤️</span> {likes}
        </button>
        <button className="post-action-btn" onClick={handleDislike}>
          <span className="post-dislike">🥊</span> {dislikes}
        </button>
        <button className="post-action-btn" onClick={handleComment}>
          <span className="post-comment">💬</span>
        </button>
        <p>{deadline}</p>
      </div>
      <div className="post-text">
        <p>{contentText}</p>
      </div>
      <div className="number-input-button">
        <NumberInputButton/>
      </div>
      
      {showCommentInput && (
        <div className="comment-input-container">
          <label htmlFor="comment-input">Write a comment:</label>
          <input className="comment-input" id="comment-input" type="text" />
        </div>
      )}
{/* 
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>{creator}</h2>
        <p>{owner}</p>
        <p>{deadline}</p>
        <p>{contentText}</p>
        <img src={contentImage} alt="Post content" />
        <button onClick={closeModal}>Close</button>
      </Modal> */}
    </div>
  );
};

export default Post;
