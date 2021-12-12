import type { NextPage } from 'next'
import { useState } from 'react';
import ky from 'ky-universal';

const Home: NextPage = () => {
  const [room, setRoom] = useState<string>("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoom(e.target.value);
  }

  function handleSubmit() {
    //TODO: post the contents of room
    alert(room.trim());
  }

  return (
    <>
      <h1>Join A Room</h1>
      <input 
        type="text"
        onChange={handleChange}
        value={room}
      />
      <button onClick={handleSubmit} />
    </>
  )
}

export default Home
