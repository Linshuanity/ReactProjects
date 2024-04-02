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
  // const apiEndpoint = process.env.REACT_APP_API_ENDPOINT; // 使用環境變量
  const apiEndpoint = 'http://localhost:3002';

  const getPosts = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/posts/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ as_user: userId, login_user: loggedInUserId, filter_mode: mode }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const getUserPosts = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/posts/${userId}/posts`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      // 可以添加更多的錯誤處理邏輯
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getPosts();
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
      {posts.map((post) => (
        <PostWidget
          key={post.pid}
          post_id={post.pid}
          owner_id={post.owner_uid}
          owner_name={post.owner_name}
          owner_profile={post.owner_profile}
          author_id={post.author_uid}
          author_name={post.author_name}
          author_profile={post.author_profile}
          level={post.level}
          description={post.title}
          location="Taipei" // 需要根據實際數據進行動態設置
          create_date={post.create_date}
          expire_date={post.expire_date}
          picturePath={post.image_path}
          bid_user_id={post.bid_user_id}
          bid_price={post.bid_price}
          ask_price={post.ask_price}
          is_liked={post.is_liked}
          likes={post.likes}
          my_bid={post.my_bid}
          comments={post.comments}
        />
      ))}
    </>
  );
};

export default PostsWidget;
