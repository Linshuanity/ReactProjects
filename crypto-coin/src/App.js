import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './login/SignIn';
import SignUp from './login/SignUp';
import Home from './Home';
import Game from './Game';
import Post from './Post';
import Profile from './Profile';
import Gallery, { posts } from './Gallery';
import Link from '@mui/material/Link';

function App() {
  const [currentPage, setCurrentPage] = useState('');

  const checkUrl = (str) => {
    let url = currentPage.split("/")[3];
    if (typeof str !== 'string' || typeof url !== 'string') {
        return false;
    }
    return url.toUpperCase().startsWith(str.toUpperCase());
  }

  useEffect(() => {
    setCurrentPage(window.location.href);
  }, []);

  return (
    <div>
    <nav>
      <ul>
      <li><Link href="/">Home</Link></li>
        <li><Link href="/game">Game</Link></li>
        <li><Link href="/profile">Profile</Link></li>
        <li><Link href="/gallery">Gallery</Link></li>
      </ul>
    </nav>
      {
      checkUrl("SignUp") ? <SignUp></SignUp>
     :checkUrl("SignIn") ? <SignIn></SignIn>
     :checkUrl("game") ? <Game></Game>
     :checkUrl("profile") ? <Profile></Profile>
     :checkUrl("gallery") ? <Gallery></Gallery>
     : <Home></Home>}
    <Router>
      <Routes>
        {posts.map((post) => (
          <Route key={post.id} path={`/posts/${post.id}`} element={<Post post={post} />} />
        ))}
      </Routes>
    </Router>
    </div>

  );
}

export default App;
