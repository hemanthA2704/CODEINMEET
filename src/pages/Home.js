import React , {useState} from 'react'
import { v4 as uuidv4 } from 'uuid';
import toast  from 'react-hot-toast' ;
import {useNavigate} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate() ;
  const [roomId , setRoomId] = useState('') ;
  const [userName , setUserName] = useState('') ;

  const createRoom = (event) => {
    event.preventDefault();
    const uniqueId = uuidv4();
    setRoomId(uniqueId);
    toast.success('Created a new ROOM ID') ;
  }

  const joinRoom = () => {
    if (! roomId || ! userName) {
      toast.error("ROOM ID & USERNAME are required");
      return;
    }


    // Redirect
    navigate(`/editor/${roomId}` , {
      // this state is used to transfer the localvariables in current page to navigated page(can use react_redux as alternative)
      state : {
        userName,
      },
    })
  }
  
  const handleKeyEnter = (event) => {
    if (event.code === "Enter") {
      joinRoom();
    }
  }

  return (
    <div className='homePageWrapper'>
    <div><Toaster
        position="top-center"
      /></div>
      <div className='formWrapper'>
        <h2 className='logo'>CODEINMEET</h2>
        <h4 className='label'>Paste your ROOM ID here</h4>
        <div className='inputForm'>
            <input type='text' className='formInput' placeholder='ROOM ID' onChange={(e) => {setRoomId(e.target.value)}} value={roomId} onKeyUp={handleKeyEnter} ></input>
            <input type='text' className='formInput' placeholder='USERNAME' onChange={(e) => {setUserName(e.target.value)}} value={userName} onKeyUp={handleKeyEnter} ></input>
            <button className='btn joinBtn' onClick={joinRoom}>Join</button>
        </div>
        <span className='createRoomMessage'>Don't have a ROOM ID ? &nbsp;
        <a onClick={createRoom} className='createRoom' href='/hello'>Create One</a>
        </span>
      </div>
    </div>
  )
}

export default Home