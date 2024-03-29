import React, { FunctionComponent, useEffect, useState } from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useTimer } from 'react-timer-hook';


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

interface IUser {
    score: number
    name: string
}

interface IRoom {
    users: Array<IUser>
    startGame?: () => void
}

const WaitingRoom : FunctionComponent<IRoom> = ({ users, startGame }) => {
    return <>
        <ul>
            {users.map((user, i) =>
                <li key={i}>
                    {user.name}
                </li>
            )}
        </ul>
        <button onClick={startGame} disabled={users.length <= 1}>Start Game</button>
    </>
}

const ScoreBoard : FunctionComponent<IRoom> = ({ users }) => {
    return <>
        <ul>
            {users.map((user, i) =>
                <li key={i}>
                    {user.name}: {user.score}
                </li>
            )}
        </ul>
    </>
}

interface IChatMessage {
    message: string
    sender: string
}

interface IQuestion {
    price: number
    image_url: string
}

const Room: NextPage = () => {
    const router = useRouter();
    const { number } = router.query;
    const [socket, setSocket] = useState<WebSocket>()
    const [username, setUsername] = useState<string>("");
    const [users, setUsers] = useState<Array<IUser>>([]);
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<Array<IChatMessage>>([]);
    const [started, setStarted] = useState<boolean>(false)
    const [question, setQuestion] = useState<IQuestion>()
    const [questionNumber, setQuestionNumber] = useState<number>(0)
    const [guess, setGuess] = useState<number>(0)
    const [submitted, setSubmitted] = useState<boolean>(false)


    useEffect(
        () => {
            if (typeof number === 'undefined' || username.length <= 0) return
            const socket = new WebSocket(`${process.env.NEXT_PUBLIC_HOST ? "wss" : "ws"}://${process.env.NEXT_PUBLIC_HOST ?? "127.0.0.1:8000"}/ws/room/${number}/${username}`)
            socket.onclose = e => {
                router.push('/')
            }
            setSocket(socket)
        }
        , [number, username], 
    )

    function onExpire() {
        handleSubmit();
    }

    const { seconds, restart } = useTimer({ 
        expiryTimestamp: new Date(), 
        onExpire
    });


    useEffect(() => {
        socket && (socket.onmessage = e => {
            const data = JSON.parse(e.data)
            if (data.type === 'state') {
                setStarted(data.started)
                setUsers(data.users)
            } else if (data.type === 'user') {
                started && users.sort((a: IUser, b: IUser) => b.score - a.score)
                setUsers(data.users)
            } else if (data.type === 'message') {
                setMessages([...messages, data])
            } else if (data.type === 'question') {
                const deadline = new Date()
                deadline.setSeconds(deadline.getSeconds() + 15)
                restart(deadline)
                setStarted(true)
                setSubmitted(false)
                setGuess(0)
                setQuestion(data.question)
                setQuestionNumber(questionNumber + 1)
            } else if (data.type === 'confirm') {
                setSubmitted(true)
            } else if (data.type === 'result') {
                const deadline = new Date()
                deadline.setSeconds(deadline.getSeconds() + 5)
                restart(deadline)
            } else if (data.type === 'end') {
                alert("thanks for playing!")
                router.push('/')
            }
        })
    }, [socket, messages, restart])

    useEffect(() => {
        if (!submitted || seconds) return
        socket && socket.send(JSON.stringify({
            type: 'result',
            question: questionNumber
        }))
    }, [submitted, seconds])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setMessage(e.target.value);
    }

    function handleGuess(e: React.ChangeEvent<HTMLInputElement>) {
        setGuess(Number(e.target.value));
    }

    function handleSubmit(e?: React.SyntheticEvent) {
        e && e.preventDefault();
        socket && socket.send(JSON.stringify( { type: 'guess', guess }))
    }

    function handleSend() {
        socket && socket.send(JSON.stringify({ type: 'message', message }))
    }

    function startGame() {
        socket && socket.send(JSON.stringify({ type: 'start' }))
    }

    const chat = messages.map(({ message, sender }, i) => <li key={`${message}-${i}`}>{sender}: {message}</li>)

    if (!username) {
        return <UsernameForm setUsername={setUsername} />
    }

    return (
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
                        {
                            started
                                ? <>
                                    <h1>Timer: {seconds} </h1>
                                    <ScoreBoard 
                                        users={users}
                                    />
                                    {question && <>
                                        <img src={question?.image_url} />
                                        <h1>Price: </h1>
                                        <form
                                            onSubmit={handleSubmit}
                                        >
                                            <input
                                                onChange={handleGuess}
                                                type="number" 
                                                value={guess}
                                                disabled={submitted || !seconds}
                                            />
                                        </form>
                                    </>}
                                </>
                                : <WaitingRoom
                                    startGame={startGame}
                                    users={users}
                                />
                        }
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
}

export default Room