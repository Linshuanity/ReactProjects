import React from 'react';
import Link from '@mui/material/Link';
function Home() {
  return (
    <div>
      <h1>Virus World</h1>
      <Link href="/SignIn">SignIn</Link>
      <br/>
      <Link href="/SignUp">SignUp</Link>
      <p>About us.</p>
    </div>
  );
}

export default Home;
