import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import Modal from 'react-modal';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Box, Divider, IconButton, Typography, useTheme, Button, InputBase } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import UserImage from "components/UserImage";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";

import "./post_widget.css";

const PostWidget = ({
  post_id,
  owner_id,
  owner_name,
  owner_profile,
  author_id,
  author_name,
  author_profile,
  level,
  description,
  location,
  create_date,
  expire_date,
  picturePath,
  bid_user_id,
  price,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [newComment, setNewComment] = useState('');
  const postId = post_id;
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const loggedInUserName = useSelector((state) => state.user.user_name);
  const userImagePath = useSelector((state) => state.user.picturePath);
  const [bid, setBid] = useState("");
  const [forSell, setSell] = useState(bid_user_id === owner_id);
  const [Price, setPrice] = useState(price);
  const startDate = [create_date];
  const endDate = [expire_date];

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;
  const navigate = useNavigate();
  const [commentCount, setCommentCount] = useState(comments);
  const [commentList, setCommentList] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleAddBid = async () => {
    const response = await fetch(`http://localhost:3002/posts/bid`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
          user_id: loggedInUserId, 
          post_id: postId, 
          price: bid,
          is_bid: loggedInUserId !== owner_id }),
    });
    const update = await response.json();
    setPrice(Math.max(bid, Price));
    setSell(forSell || (loggedInUserId === owner_id));
    setIsConfirmationOpen(false);
  }

  const likesCount = useSelector((state) => {
    const posts = state.posts;
    const post = posts.find((post) => post.pid === postId);
    return post ? post.likes : 0;
  });
  const isLiked = useSelector((state) => {
    const posts = state.posts;
    const post = posts.find((post) => post.pid === postId);
    return post ? post.is_liked : false;
  });
  const handleAddComment = async () => {
    // Add the new comment to the list of comments, for example:
    // You should replace this logic with your actual state management or API calls.
    if (newComment.trim() !== '') {
      // Assuming `comments` is an array, create a new array with the updated comments
      const commentObject = {
        context: newComment,
        user_name: loggedInUserName,
        user_image_path: userImagePath
      };
      setCommentList([...commentList, commentObject]);
      // Update the state or send the updated comments to your backend
      const response = await fetch(`http://localhost:3002/posts/comment`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: loggedInUserId, post_id: postId, context: newComment }),
      });
      const update = await response.json();
      setCommentCount(commentCount => commentCount + 1);
    }

    // Clear the input field after adding the comment
    setNewComment('');
  };

  const purchaseAction = async () => {

    const response = await fetch(`http://localhost:3002/posts/purchase`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
          trader_id: loggedInUserId, 
          post_id: postId, 
          user_id: bid_user_id,
          for_sell: forSell }),
    });
    const update = await response.json();
  };

  const fetchComments = async () => {
    setIsComments(!isComments);
    const response = await fetch("http://localhost:3002/posts/comments", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ post_id: postId }),
    });
    const update = await response.json();
    setCommentList(update);
  };

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3002/posts/like`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ liker_id: loggedInUserId, post_id: postId, is_liked: isLiked }),
    });
    const update = await response.json();
    dispatch(setPost({ post_id : postId, is_like : isLiked }));
  };

  function formatTimeLeft(time) {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    let formattedTime = "";
    if (days > 0) {
      formattedTime += `${days} day${days > 1 ? "s" : ""} `;
    }
    if (hours > 0) {
      formattedTime += `${hours} hr${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
      formattedTime += `${minutes} min${minutes > 1 ? "s" : ""} `;
    }

    return formattedTime.trim();
  }


  function calculateProgress(startDate, endDate) {
    const currentTime = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalTime = end.getTime() - start.getTime();
    const elapsedTime = currentTime.getTime() - start.getTime();
    const timeLeft = end - currentTime;
    const formattedTimeLeft = formatTimeLeft(timeLeft);
    const progress = (elapsedTime / totalTime) * 100;
    
    return { progress: progress.toFixed(2), timeLeft: formattedTimeLeft };
  }

  return (
    <WidgetWrapper m="1rem 0">
      <Friend
        friendId={author_id}
        name={author_name}
        subtitle={location}
        userPicturePath={author_profile}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <div style={{ position: 'relative' }}>
          <img
            width="100%"
            height="auto"
            alt="post"
            style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
            src={`http://localhost:3002/assets/${picturePath}`}
          />
          <img
            src={`http://localhost:3002/assets/${picturePath}`}
            alt="Foreground Photo"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '10%',
              height: '10%',
              zIndex: 1,
            }}
          />
        </div>

      )}
      {startDate && endDate && (() => {
        const { progress, timeLeft } = calculateProgress(startDate, endDate);

        return (
          <div style={{ flex: "1", marginLeft: "1rem" }}>
            <progress
              value={progress}
              max="100"
              style={{ width: "100%" }}
            >
            {progress}%
            </progress>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Box width="50%"
                onClick={() => {
                  navigate(`/profile/${owner_id}`);
                  navigate(0);
                }}
                onMouseOver={() => setIsHovered(true)}
                onMouseOut={() => setIsHovered(false)}
              >
                {isHovered ? (
                  <div>{owner_name}</div>
                ) : (
                  <UserImage
                    image={owner_profile}
                    size="22px"
                  />
                )}
              </Box>
              <div style={{ width: '50%', textAlign: "right"}}>
                {timeLeft} left
              </div>
            </div>
          </div>
          );
        })()}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likesCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={fetchComments}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{commentCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={purchaseAction}>
              <ShoppingCartIcon />
            </IconButton>
            <Typography
              sx={{
                color: forSell ? 'orange' : 'blue',
              }}
            >
              $ {Price} 
            </Typography>
          </FlexBetween>
          
          <FlexBetween gap="0.3rem">
            <Button
              sx={{
                backgroundColor: loggedInUserId === owner_id ? 'orange' : 'blue',
                padding: '2px 4px',
                color: 'white',
                marginLeft: '0.5rem',
              }}
              variant="contained"
              onClick={() => setIsConfirmationOpen(true)}
            >
              {loggedInUserId === owner_id ? 'Ask' : 'Bid'}
            </Button>
            <InputBase
              type="number"
              placeholder="set price"
              onChange={(e) => setBid(e.target.value)}
              value={bid}
              sx={{
                width: "5rem",
                height: "2rem",
                backgroundColor: palette.neutral.light,
                borderRadius: "1rem",
                padding: "0.5rem 0.5rem",
              }}
            />
              <Modal
                isOpen={isConfirmationOpen}
                onRequestClose={() => setIsConfirmationOpen(false)}
                ariaHideApp={false}
                className="custom-modal" // Apply your custom CSS class
              >
                <div className="custom-modal-content">
                  <p>Are you sure you want to place this bid?</p>
                  <div className="button-container">
                    <button className="yes-button" onClick={handleAddBid}>Yes</button>
                    <button className="no-button" onClick={() => setIsConfirmationOpen(false)}>No</button>
                  </div>
                </div>
              </Modal>
          </FlexBetween>
          
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="1rem">
          {commentList.map((comment, i) => (
            <Box key={`${author_name}-${i}`}>
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', p: '0.5rem' }}>
                <UserImage
                  image={comment.user_image_path}
                  size="22px"
                />
                <Box sx={{ ml: '0.5rem' }}>
                  <Typography variant="subtitle2">{comment.user_name}</Typography>
                  <Typography color={main}>{comment.context}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
          <Divider />
        </Box>
      )}
      <Box mt="1rem" display="flex" alignItems="center">
        <InputBase
          type="text"
          placeholder="leave a comment"
          value={newComment}
          onChange={(event) => {
            setNewComment(event.target.value);
          }}
          sx={{
            flex: 1
          }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddComment}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
        Send
        </Button>
      </Box>
    </WidgetWrapper>
  );
};

export default PostWidget;
