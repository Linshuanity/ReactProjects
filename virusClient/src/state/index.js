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
      return {
          ...state, posts: action.payload.posts};
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post.post_id === action.payload.post_id) {
          return {
            ...post,
            isLiked: action.payload.post.isLiked, // Update is_liked
            likeCount: post.likeCount + (post.isLiked ? -1 : 1), // Update like count
          };
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

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost, setLike } =
  authSlice.actions;
export default authSlice.reducer;
