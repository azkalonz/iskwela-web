import React, { Component } from "react";
import { useAuth0 } from "../react-auth0-spa.js";

function Home() {
  const { loading, user } = useAuth0();
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Welcome {user && user.nickname + "!"}</h1>
    </div>
  );
}

export default Home;
