import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (`${post['pid']}` == action.payload.post_id) {
          post.is_liked = !action.payload.is_like; // Update is_liked
          post.likes = post.likes +(action.payload.is_like ? -1 : 1); // Update like count
        }
        return post;
      });
      state.posts = updatedPosts;
    },
    setPostCommentCount: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (`${post['pid']}` == action.payload.post_id) {
          post.commentCount = action.payload.commentCount;
        }
        return post;
      });
      state.posts = updatedPosts;
    },
    setLike: (state, action) => {
      const _id = action.payload._id;
      const is_liked = action.payload.is_liked;

      // Use the map function to create a new array of posts with the updated likes_count
      const updatedPosts = state.posts.map((post) => {
        if (post._id === _id) return { ...post, likes: post.likes + (is_liked ? -1 : 1) };
        return post;
      });
      // Update the posts array in the state with the updatedPosts array
      state.posts = updatedPosts;
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost, setPostCommentCount, setLike } =
  authSlice.actions;
export default authSlice.reducer;
