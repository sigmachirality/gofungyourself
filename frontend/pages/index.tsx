import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import ky from 'ky-universal';
import React, { ChangeEvent, FunctionComponent, useState } from 'react';

interface GameData {
  code: number
}

const CreateGame : FunctionComponent = () => {
  const [gameMode, setGameMode] = useState<string>("closest"); 
  const [numEntries, setNumEntries] = useState<number>(0);
  const router = useRouter();

  function handleChangeMode(e: React.ChangeEvent<HTMLSelectElement>) {
    setGameMode(e.target.value);
  }

  function handleChangeEntries(e: React.ChangeEvent<HTMLInputElement>) {
    const target = Number(e.target.value);
    if (target <= 0 || target > 5) return;
    setNumEntries(target);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    const data : GameData = await ky.post(`/api/game/create_game/`, {
      json: {
        mode: gameMode
      }
    }).json()
    router.push(`/room/${data.code}`)
  }

  return <form onSubmit={handleSubmit}>
    <select value={gameMode} onChange={handleChangeMode}>
      <option value="closest">Closest Wins</option>
      <option value="exact">Exact Match</option>
      <option value="bubblegum">Bubblegum Rules</option>
      <option value="meme">Always Wrong</option>
    </select>
    <input value={numEntries} onChange={handleChangeEntries} type="number" />
    <button onClick={handleSubmit}>Create Room</button>
  </form>
}

const Home: NextPage = () => {
  const [room, setRoom] = useState<string>("");
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoom(e.target.value);
  }

  function handleJoin(e: React.SyntheticEvent) {
    e.preventDefault()
    //TODO: post the contents of room
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
        <button onClick={handleJoin}>Join</button>
      </>
      <br />
      <h1>Create A Game</h1>
      <CreateGame />
    </>
  )
}

export default Home
