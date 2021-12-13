import { useEffect, useState } from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const Room: NextPage = () => {
    const router = useRouter();
    const { number } = router.query;
    const [message, setMessage] = useState<string>("");
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(
        () => {
            const socket = new WebSocket(`ws://${process.env.BACKEND_URL ?? "127.0.0.1:8000" }/ws/room/${number}`)
            socket.onmessage = e => alert(e.data)
            socket.onopen = () => socket.send(JSON.stringify({
                message: "test"
            }))
            setSocket(socket)
        }
        , [number]
    )

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

    return (
        <div className="columns">
            <div className="column">
                Room: {number}
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
            </div>
        </div>
    )
}

export default Room