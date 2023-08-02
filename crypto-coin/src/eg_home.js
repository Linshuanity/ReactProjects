mport React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import PostPage from './PostPage';

const posts = [
  { id: 1, title: 'My First Post', content: 'Lorem ipsum dolor sit amet.' },
  { id: 2, title: 'My Second Post', content: 'Consectetur adipiscing elit.' },
  { id: 3, title: 'My Third Post', content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' }
];

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProfilePage name="John Doe" bio="Lorem ipsum dolor sit amet." posts={posts} />} />
        <Route path="/posts/:id" element={<PostPage posts={posts} />} />
      </Routes>
    </Router>
  );
};

export default App;

