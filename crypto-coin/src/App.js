import React, { useEffect, useState } from 'react';
import SignIn from './login/SignIn';
import SignUp from './login/SignUp';
import Home from './Home';
import Game from './Game';
import Post from './Post';

function App() {
  const [currentPage, setCurrentPage] = useState('');

  const checkUrl = (str) => {
    let url = currentPage.split("/")[3];
    if (typeof str !== 'string' || typeof url !== 'string') {
        return false;
    }
    return str.toUpperCase() === url.toUpperCase();
  }

  useEffect(() => {
    setCurrentPage(window.location.href);
  }, []);

  return (
    <div>
      {
      checkUrl("SignUp") ? <SignUp></SignUp>
     :checkUrl("SignIn") ? <SignIn></SignIn>
     :checkUrl("game") ? <Game></Game>
     :checkUrl("post") ? <Post></Post>
     : <Home></Home>}
    </div>
  );
}

export default App;