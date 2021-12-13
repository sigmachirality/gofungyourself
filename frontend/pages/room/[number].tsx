import React, { FunctionComponent, useEffect, useState } from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'


interface IUsernameForm {
    setUsername: (value: string) => void
}

const UsernameForm: FunctionComponent<IUsernameForm> = ({ setUsername }) => {
    const [value, setValue] = useState("")

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setValue(e.target.value.trim());
    }

    function handleSubmit(e: React.ChangeEvent<HTMLFormElement>) {
        e.preventDefault();
        setUsername(value);
    }

    return <form onSubmit={handleSubmit}>
        <h1>{"What's your name?"}</h1>
        <input
            type="text"
            value={value}
            onChange={handleChange}
        />
    </form>
}

interface IChatMessage {
    message: string
    sender: string
}

const Room: NextPage = () => {
    const router = useRouter();
    const { number } = router.query;
    const [username, setUsername] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<Array<IChatMessage>>([]);
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(
        () => {
            if (typeof number === 'undefined' || username.length <= 0) return
            const socket = new WebSocket(`wss://${process.env.NEXT_PUBLIC_BACKEND_URL ?? "127.0.0.1:8000"}/ws/room/${number}/${username}`)
            setSocket(socket)
        }
        , [number, username]
    )

    useEffect(() => {
        socket && (socket.onmessage = e => {
            const data = JSON.parse(e.data)
            console.log(data)
            if (data.type === 'state') {
                // TODO: set the game state
            } else if (data.type === 'message') {
                number !== 'undefined' && setMessages([...messages, data])
            }
        })
    }, [socket, messages, number])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setMessage(e.target.value);
    }

    function handleSend() {
        socket && socket.send(JSON.stringify({ message }))
    }

    const chat = messages.map(({ message, sender }, i) => <li key={`${message}-${i}`}>{sender}: {message}</li>)

    return username
        ? (
            <>
                <nav className="max-width is-flex">
                    <div className="mr-auto is-inline">
                        Code: {number}
                    </div>
                    <div className="is-inline">
                        Player: {username}
                    </div>
                </nav>
                <div className="columns is-align-content-stretch">
                    <div className="column">
                        GAME HERE
                    </div>
                    <div className="column is-one-quarter is-align-content-stretch">
                        <ul className="is-clipped is-align-content-stretch">
                            {chat}
                        </ul>
                        <input
                            type="text"
                            onChange={handleChange}
                            value={message}
                        />
                        <button onClick={handleSend}>
                            Send
                        </button>
                    </div>
                </div>
            </>
        )
        : <UsernameForm setUsername={setUsername} />
}

export default Room