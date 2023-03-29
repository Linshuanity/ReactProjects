import Link from '@mui/material/Link';
import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import Gallery from './Gallery';
import Game from './Game';
import Home from './Home';
import SignIn from './login/SignIn';
import SignUp from './login/SignUp';
import Profile from './Profile';
import { Route, Routes } from 'react-router-dom';

function App() {
  const [currentPage, setCurrentPage] = useState('');
  const [user, setUser] = useState('');
  const checkUrl = (str) => {
    let url = currentPage.split("/")[3];
    if (typeof str !== 'string' || typeof url !== 'string') {
      return false;
    }
    return url.toUpperCase().startsWith(str.toUpperCase());
  }
  const getUser = () => {
    const cookies = new Cookies();
    if (cookies.get('user') === undefined) {
      return '';
    }
    return cookies.get('user');
  };

  useEffect(() => {
    setCurrentPage(window.location.href);
  }, []);

  return (
    <div>
      <h1>{getUser() == '' ? '' : getUser().user_name}</h1>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/game">Game</Link></li>
          <li><Link href="/profile">Profile</Link></li>
          <li><Link href="/gallery">Gallery</Link></li>
        </ul>
      </nav>
      {
          <Routes>
            <Route path="/SignUp" element={<SignUp/>} />
            <Route path="/SignIn" element={<SignIn/>} />
            <Route path="/game" element={<Game/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/gallery" element={<Gallery/>} />
            <Route path="/" element={<Home/>} />
          </Routes>
      }
      {/* <Router>
      <Routes>
        {posts.map((post) => (
          <Route key={post.id} path={`/posts/${post.id}`} element={<Post post={post} />} />
        ))}
      </Routes>
    </Router> */}
    </div>
  );
}

export default App;
