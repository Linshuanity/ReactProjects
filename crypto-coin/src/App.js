import Link from '@mui/material/Link';
import React, { useEffect, useState, useContext } from 'react';
//import Cookies from 'universal-cookie';
import Game from './Game';
import Home from './Home';
import SignIn from './login/SignIn';
import SignUp from './login/SignUp';
import Post from './Post';
import Profile from './Profile';
import Gallery, { posts } from './Gallery';
import { Route, Routes } from 'react-router-dom';
import { UserContext } from "./context/UserContext";

const profiles = [
  { id: 1, name: 'Linshuanity', photo: 'https://picsum.photos/100' },
  { id: 2, name: 'Jane Doe', photo: 'https://picsum.photos/100?random=1' },
  { id: 3, name: 'John Smith', photo: 'https://picsum.photos/100?random=2' }
];

function App() {
  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState('');
  const [posts, setPosts] = useState([]);
  const getUser = () => {
    // const cookies = new Cookies();
    // if (cookies.get('user') === undefined) {
    //   return '';
    // }
    // return cookies.get('user');
    console.log(user);
    return user ? user : {};
  };

  useEffect(() => {
    setCurrentPage(window.location.href);
    fetch('http://localhost:8080/api/article/getPost')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>{getUser() === '' ? '' : getUser().user_name}</h1>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/game">Game</Link></li>
          <li><Link href="/profile/1">Profile</Link></li>
          <li><Link href="/gallery">Gallery</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/game" element={<Game />} />
        <Route path="/profile/:id" element={<Profile profiles={profiles} />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/" element={<Home />} />
        {posts.map((post) => (
          <Route key={post.pid} path={`/posts/${post.pid}`} element={<Post post={post} />} />
        ))}
      </Routes>
    </div>
  );
}

export default App;
