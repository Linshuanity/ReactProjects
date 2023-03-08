import React, { useEffect, useState } from 'react';
import SignIn from './login/SignIn';
import SignUp from './login/SignUp';
import Home from './Home';
import Game from './Game';
import Post from './Post';
import Profile from './Profile';
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
        <li><Link href="/post">Post</Link></li>
        <li><Link href="/profile">Profile</Link></li>
      </ul>
    </nav>
      {
      checkUrl("SignUp") ? <SignUp></SignUp>
     :checkUrl("SignIn") ? <SignIn></SignIn>
     :checkUrl("game") ? <Game></Game>
     :checkUrl("post") ? <Post></Post>
     :checkUrl("Profile") ? <Profile></Profile>
     : <Home></Home>}
    </div>
  );
}

export default App;