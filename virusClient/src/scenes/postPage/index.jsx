import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostWidget from "scenes/widgets/PostWidget";
import MissionWidget from "scenes/widgets/MissionWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";

const PostPage = () => {
  const [post, setPost] = useState(null);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);
  const { postId } = useParams();

  const getPost = async () => {
    const response = await fetch(`http://localhost:3002/posts/${postId}`, {
      method: "POST",
      body: JSON.stringify({ post_id: postId }),
    });
    const data = await response.json();
    console.log("getPost data" + data);
    console.log("getPost data" + data.pid);
    setPost(data);
  };

  useEffect(() => {
    getPost();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={_id} picturePath={picturePath} />
        </Box>
        <Box flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          <PostWidget
          post_id={post==null?'':post.pid}
          owner_id={post==null?'':post.owner_uid}
          owner_name={post==null?'':post.owner_name}
          owner_profile={post==null?'':post.owner_profile}
          author_id={post==null?'':post.author_uid}
          author_name={post==null?'':post.author_name}
          author_profile={post==null?'':post.author_profile}
          level={post==null?'':post.level}
          description={post==null?'':post.title}
          location= "Taipei"
          create_date= {post==null?'':post.create_dat}
          expire_date= {post==null?'':post.expire_date}
          picturePath={post==null?'':post.image_path}
          bid_user_id={post==null?'':post.bid_user_id}
          price={post==null?'':post.bid_price}
          is_liked={post==null?'':post.is_liked}
          likes={post==null?'':post.likes}
          comments={post==null?'':post.comments}
        />
        </Box>
        {isNonMobileScreens && (
          <Box flexBasis="26%">
            <MissionWidget />
            <Box m="2rem 0" />
            <FriendListWidget userId={_id} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PostPage;
