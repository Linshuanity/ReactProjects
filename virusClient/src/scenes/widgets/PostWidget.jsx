import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Box, Divider, IconButton, Typography, useTheme, InputBase } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import UserImage from "components/UserImage";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  price,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const [bid, setBid] = useState("");
  const startDate = "2023-05-18";
  const endDate = "2023-07-18";

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;
  const navigate = useNavigate();

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
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
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
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
            src={`http://localhost:3001/assets/${picturePath}`}
          />
          <img
            src={`http://localhost:3001/assets/${picturePath}`}
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
                  navigate(`/profile/${postUserId}`);
                  navigate(0);
                }}
                onMouseOver={() => setIsHovered(true)}
                onMouseOut={() => setIsHovered(false)}
              >
                {isHovered ? (
                  <div>{name}</div>
                ) : (
                  <UserImage
                    image={userPicturePath}
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
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton >
              <ShoppingCartIcon />
            </IconButton>
            <Typography>$ {price}</Typography>
          </FlexBetween>
          
          <FlexBetween gap="0.3rem">
            <Typography
                sx={{
                    color: loggedInUserId === postUserId ? "orange" : "blue",
                    marginLeft: "0.5rem",
                }}
            >
            {loggedInUserId === postUserId ? "Ask" : "Bid"}
            </Typography>
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
          </FlexBetween>
          
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box key={`${name}-${i}`}>
              <Divider />
              <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
                {comment}
              </Typography>
            </Box>
          ))}
          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
