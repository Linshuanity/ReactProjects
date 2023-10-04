import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab, Tabs, Typography } from "@mui/material";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const [mode, setMode] = useState(0);
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);

  const handleTabChange = (event, newValue) => {
    setMode(newValue);
  };

  const getPosts = async () => {
    const response = await fetch("http://localhost:3002/posts/all", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ as_user: loggedInUserId, filter_mode: mode }),
    });
    const data = await response.json();
    setPosts(data);
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
    const fetchData = async () => {
      if (isProfile) {
        await getUserPosts();
      } else {
        await getPosts();
      }
    };

    fetchData();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div style={{ marginTop: '10px' }}>
        <Tabs value={mode} onChange={handleTabChange}>
          <Tab label="My post" />
          <Tab label="My collection" />
          <Tab label="My order" />
        </Tabs>
      </div>
      {posts.map(
        ({
          pid,
          title,
          content,
          owner_uid,
          owner_name,
          owner_profile,
          author_uid,
          author_name,
          author_profile,
          level,
          status,
          create_date,
          expire_date,
          bid_user_id,
          bid_price,
          is_liked,
          likes,
          comments,
          image_path,
        }) => (
          <PostWidget
            post_id={pid}
            owner_id={owner_uid}
            owner_name={owner_name}
            owner_profile={owner_profile}
            author_id={author_uid}
            author_name={author_name}
            author_profile={author_profile}
            level={level}
            description={title}
            location= "Taipei"
            create_date= {create_date}
            expire_date= {expire_date}
            picturePath={image_path}
            bid_user_id={bid_user_id}
            price={bid_price}
            is_liked={is_liked}
            likes={likes}
            comments={comments}
          />
        )
      )}
    </>
  );
};

export default PostsWidget;
