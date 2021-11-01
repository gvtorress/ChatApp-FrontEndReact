import React, { useEffect, useState } from 'react'

import socketIOClinet from 'socket.io-client'

import ScrollToBottom from 'react-scroll-to-bottom'

import {
    Container,
    Conteudo,
    Header,
    Form,
    Campo,
    Label,
    Input,
    Select,
    BtnAcessar,
    HeaderChat,
    ImgUsuario,
    NomeUsuario,
    ChatBox,
    ConteudoChat,
    MsgEnviada,
    DetMsgEnviada,
    TextMsgEnviada,
    MsgRecebida,
    DetMsgRecebida,
    TextMsgRecebida,
    EnviarMsg,
    CampoMsg,
    BtnEnviarMsg,
    AlertError
} from './styles/styles'

import api from './config/configApi'

import './App.css'

let socket

function App() {
    const ENDPOINT = 'http://localhost:8080/'

    const [logged, setLogged] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [userId, setUserId] = useState('')
    const [roomId, setRoomId] = useState('')
    const [message, setMessage] = useState('')
    const [messageList, setMessageList] = useState([])
    const [status, setStatus] = useState({
        type: '',
        message: ''
    })
    const [roomsList, setRoomsList] = useState([])

    useEffect(() => {
        socket = socketIOClinet(ENDPOINT)
        listRooms()
    }, [])

    useEffect(() => {
        socket.on('serverMessage', data => {
            setMessageList([...messageList, data])
        })
    })

    const listRooms = async () => {
        await api
            .get('/listRooms')
            .then(response => {
                setRoomsList(response.data.rooms)
            })
            .catch(err => {
                if (err.response) {
                    setStatus({
                        type: 'Error',
                        message: err.response.data.message
                    })
                } else {
                    setStatus({
                        type: 'Error',
                        message: 'Error: Try again later'
                    })
                }
            })
    }

    const connectRoom = async e => {
        e.preventDefault()

        const headers = {
            'Content-Type': 'application/json'
        }

        await api
            .post('/validateAccess', { email }, { headers })
            .then(response => {
                setName(response.data.user.name)
                setUserId(response.data.user.id)

                setLogged(true)
                socket.emit('room_connect', Number(roomId))
                listMessages()
            })
            .catch(err => {
                if (err.response) {
                    setStatus({
                        type: 'Error',
                        message: err.response.data.message
                    })
                } else {
                    setStatus({
                        type: 'Error',
                        message: 'Error: Try again later'
                    })
                }
            })
    }

    const listMessages = async () => {
        await api
            .get('/listMessages/' + roomId)
            .then(response => {
                setMessageList(response.data.messages)
            })
            .catch(err => {
                if (err.response) {
                    setStatus({
                        type: 'Error',
                        message: err.response.data.message
                    })
                } else {
                    setStatus({
                        type: 'Error',
                        message: 'Error: Try again later'
                    })
                }
            })
    }

    const sendMessage = async e => {
        e.preventDefault()
        const messageContent = {
            roomId: Number(roomId),
            content: {
                message,
                user: {
                    id: userId,
                    name: name
                }
            }
        }
        await socket.emit('message', messageContent)
        setMessageList([...messageList, messageContent.content])
        setMessage('')
    }

    return (
        <Container>
            {!logged ? (
                <Conteudo>
                    <Header>My chat</Header>
                    <Form onSubmit={connectRoom}>
                        {status.type === 'Error' ? (
                            <AlertError>{status.message}</AlertError>
                        ) : (
                            ''
                        )}
                        <Campo>
                            <Label>Email: </Label>
                            <Input
                                type="text"
                                name="email"
                                placeholder="Email"
                                value={email}
                                onChange={text => {
                                    setEmail(text.target.value)
                                }}
                            />
                        </Campo>
                        <Campo>
                            <Label>Room: </Label>
                            {/* <input
                        type="text"
                        name="sala"
                        placeholder="Sala"
                        value={sala}
                        onChange={text => {
                            setSala(text.target.value)
                        }}
                    /> */}

                            <Select
                                name="roomId"
                                value={roomId}
                                onChange={text => setRoomId(text.target.value)}
                            >
                                <option value="">Select</option>
                                {roomsList.map((room, key) => {
                                    return (
                                        <option key={key} value={room.id}>
                                            {room.name}
                                        </option>
                                    )
                                })}
                                {/* <option value="1">Node.js</option>
                                <option value="2">React</option>
                                <option value="3">React Native</option>
                                <option value="4">PHP</option> */}
                            </Select>
                        </Campo>

                        <BtnAcessar>Access</BtnAcessar>
                    </Form>
                </Conteudo>
            ) : (
                <ConteudoChat>
                    <HeaderChat>
                        <ImgUsuario src="icons8-dota-2-48.png" alt={name} />
                        <NomeUsuario>{name}</NomeUsuario>
                    </HeaderChat>
                    <ChatBox>
                        <ScrollToBottom className="scrollMsg">
                            {messageList.map((msg, key) => {
                                return (
                                    <div key={key}>
                                        {userId === msg.user.id ? (
                                            <MsgEnviada>
                                                <DetMsgEnviada>
                                                    <TextMsgEnviada>
                                                        {msg.user.name}:{' '}
                                                        {msg.message}
                                                    </TextMsgEnviada>
                                                </DetMsgEnviada>
                                            </MsgEnviada>
                                        ) : (
                                            <MsgRecebida>
                                                <DetMsgRecebida>
                                                    <TextMsgRecebida>
                                                        {msg.user.name}:{' '}
                                                        {msg.message}
                                                    </TextMsgRecebida>
                                                </DetMsgRecebida>
                                            </MsgRecebida>
                                        )}
                                    </div>
                                )
                            })}
                            {/* {listaMensagem.map((msg, key) => {
                            return (
                                <div key={key}>
                                    {msg.nome} : {msg.mensagem}
                                </div>
                            )
                        })} */}
                        </ScrollToBottom>
                    </ChatBox>
                    <EnviarMsg onSubmit={sendMessage}>
                        <CampoMsg
                            type="text"
                            placeholder="Mensagem"
                            value={message}
                            onChange={text => {
                                setMessage(text.target.value)
                            }}
                        />

                        <BtnEnviarMsg>Send</BtnEnviarMsg>
                    </EnviarMsg>
                </ConteudoChat>
            )}
        </Container>
    )
}

export default App
