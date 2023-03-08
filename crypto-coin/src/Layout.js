import React from "react";
import Home from './Home';
import Game from './Game';
import Post from './Post';
import Profile from './Profile';
import { Link, Routes, Route } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/game">Game</Link></li>
          <li><Link to="/post">Post</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route exact path="/" element={<Home />}></Route>
        <Route path="/game" element={<Game />}></Route>
        <Route path="/post" element={<Post />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
      </Routes>
    </div>
  );
}

export default Layout;