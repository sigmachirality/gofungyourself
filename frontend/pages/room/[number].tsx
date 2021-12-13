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
        <h1>What's your name?</h1>
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
            const socket = new WebSocket(`ws://${process.env.BACKEND_URL ?? "127.0.0.1:8000" }/ws/room/${number}/${username}`)
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
                number !== 'undefined' && setMessages([...messages, JSON.parse(e.data)])
            }
        })
    }, [socket, messages])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setMessage(e.target.value);
    }

    function handleSend() {
        console.log(message)
        socket && socket.send(JSON.stringify({
            message
        }))
        console.log("sent")
    }

    return username
        ? (
            <>
                <h1>
                    Code: {number}
                    <br />
                    Player: {username}
                </h1>
                <div className="columns is-align-content-stretch">
                    <div className="column">
                        GAME HERE
                    </div>
                    <div className="column">
                        <input
                            type="text"
                            onChange={handleChange}
                            value={message}
                        />
                        <button onClick={handleSend}>
                            Send
                        </button>
                        <br />
                        <ul>
                            {
                                messages.map(({ message, sender }, i) => <li key={`${message}-${i}`}>{sender}: {message}</li>)
                            }
                        </ul>
                    </div>
                </div>
            </>
        )
        : <UsernameForm setUsername={setUsername} />
}

export default Room