import { React ,useEffect, useRef, useState } from 'react'
import 'react-chat-elements/dist/main.css'
import {MessageList} from 'react-chat-elements'
import ACTIONS from '../Actions';

const ChatBox = ({userName , socketRef , roomId}) => {
    const messageListRef = useRef(null);
    const [message , setMessage] = useState('') ;
    const [messages, setMessages] = useState([]);

    const sendMessage = ()=> {
      if (message.length!==0){
        const newMessage = {
          text : message ,
          date : new Date() ,
          title : userName
        };
        setMessage('');
        setMessages((prevMessages) =>[
          ...prevMessages ,
          newMessage
        ]);
        socketRef.current.emit(ACTIONS.MSG , {newMessage , roomId}) ;
        console.log('message sent')
        return () => {  
          socketRef.current.off(ACTIONS.MSG);
        }
      }
    }

    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        sendMessage() ;
      }
    }

    useEffect(() => {
      if (socketRef.current) {
      socketRef.current.on(ACTIONS.MSG,({newMessage}) => {
        console.log(newMessage)
        setMessages((prevMessages)=>[
          ...prevMessages,
          newMessage
        ])
      })
    }
    },[socketRef.current])

    useEffect(() => {
        if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);
    
  return (
    <div>
        <div className='chatBox'>
            <h3 className='chatHeading'>Chats</h3>
            <div ref={messageListRef} className='message-list'>
              <MessageList
                  dataSource={messages.map(({title , date , text}) => {
                    return  {
                    position: title === userName ? 'right' : 'left',
                    title : title === userName ? `${userName} (you)` : title ,
                    type: 'text',
                    text: text,
                    date: date,
                    }
                })}
              />
            </div>
        </div>
        <div className='down'>
              <div className='sendBox'>
                <input className='messageBox' placeholder='Type your message...' value={message} onChange={(e)=>setMessage(e.target.value)} onKeyUp={handleKeyPress}></input>
                <button className="sendButton" onClick={sendMessage}>
                  <img src="\send.png" alt="Send" className="sendIcon"></img>
                </button>
              </div>
        </div>
    </div>
  )
}

export default ChatBox