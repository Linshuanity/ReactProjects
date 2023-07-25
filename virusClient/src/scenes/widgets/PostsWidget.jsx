import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import { Tab, Tabs, Typography } from "@mui/material";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const [mode, setMode] = useState(0);
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const handleTabChange = (event, newValue) => {
    setMode(newValue);
  };

  const getPosts = async () => {
    const response = await fetch("http://localhost:3002/posts/all", {
      method: "POST",
      body: 5,
    });
    const data = await response.json();
    console.log(data);
    dispatch(setPosts({ posts: data }));
  };

  const getUserPosts = async () => {
    const response = await fetch(
      `http://localhost:3002/posts/${userId}/posts`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setPosts({ posts: data }));
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div style={{ marginTop: '10px' }}>
        <Tabs value={mode} onChange={handleTabChange}>
          <Tab label="My post" />
          <Tab label="My collection" />
          <Tab label="My order" />
        </Tabs>
        {mode === 2 && <Typography>My Order</Typography>}
      </div>
      {posts.map(
        ({
          pid,
          title,
          content,
          owner_id,
          owner_name,
          owner_profile,
          author_name,
          author_profile,
          status,
          create_date,
          expire_date,
          pool,
          bid_price,
          likes,
          image_path,
        }) => (
          <PostWidget
            key={pid}
            owner_id={owner_id}
            owner_name={owner_name}
            owner_profile={owner_profile}
            author_name={author_name}
            author_profile={author_profile}
            description={title}
            location= "Taipei"
            create_date= {create_date}
            expire_date= {expire_date}
            picturePath={image_path}
            price={bid_price}
            likes={likes}
            comments={[]}
          />
        )
      )}
    </>
  );
};

export default PostsWidget;
