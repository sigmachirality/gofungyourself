import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react';

const Home: NextPage = () => {
  const [room, setRoom] = useState<string>("");
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoom(e.target.value);
  }

  function handleSubmit() {
    //TODO: post the contents of room
    alert(room.trim());
    router.push(`/room/${room}`);
  }

  return (
    <>
      <h1>Join A Room</h1>
      <>
        <input 
          type="text"
          onChange={handleChange}
          value={room}
        />
        <button onClick={handleSubmit}>Join</button>
      </>
    </>
  )
}

export default Home
