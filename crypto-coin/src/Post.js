import React, { useState } from "react";
import "./post.css";

const Post = () => {
  const [comment, setComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleAddComment = () => {
    setComments([...comments, comment]);
    setComment("");
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    isLiked ? setLikes(likes - 1) : setLikes(likes + 1);
  };

  const handleDislikeClick = () => {
    setDislikes(dislikes + 1);
  };

  return (
    <div className="post-container">
      <div className="post-header">
        <img
          className="post-authoravatar"
          src="https://picsum.photos/100"
          alt="avatar"
        />
        <div className="post-authorname">Dingy (Author)</div>
        <img
          className="post-owneravatar"
          src="https://picsum.photos/200"
          alt="avatar"
        />
        <div className="post-ownername">Linshuanity (Owner)</div>
      </div>
        <h2>GoVirus is awesome</h2>
        <p>Join govirus, or I'll come back with a gun </p> 
        <img className="post-image" src="https://picsum.photos/300" alt="post" />
      <div className="post-interactions">
        <div className="post-like-container">
          <button className="post-like-button" onClick={handleLikeClick}>
            {isLiked ? "Unlike" : "Like"}
          </button>
          <div className="post-like-count">{likes} likes</div>
          <button className="post-dislike-button" onClick={handleDislikeClick}>
            Dislike
          </button>
          <div className="post-dislike-count">{dislikes} dislikes</div>
        </div>
        <div className="post-comment-container">
          <input
            className="post-comment-input"
            placeholder="Add a comment"
            value={comment}
            onChange={handleCommentChange}
          />
          <button className="post-comment-button" onClick={handleAddComment}>
            Post
          </button>
        </div>
      </div>
      <div className="post-comments">
        {comments.map((comment, index) => (
          <div key={index} className="post-comment">
            <span className="post-comment-username">Hacker: </span>
            {comment}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;
