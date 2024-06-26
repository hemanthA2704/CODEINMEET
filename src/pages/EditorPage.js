import React , {useState, useEffect, useRef} from 'react'
import { useLocation,useParams , useNavigate , Navigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import Client from '../components/Client'
import Editor from '../components/Editor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy,faRightFromBracket  } from '@fortawesome/free-solid-svg-icons';
import { initSocket } from '../socket';
import ACTIONS from '../Actions' ;
import {Toaster} from 'react-hot-toast';
import Chat from '../components/Chat';
import Me from '../components/Me'
import Peer from 'peerjs';



const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null) ;
    const langRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const peerRef = useRef(null) ;
    const [myPeerId , setMyPeerId] = useState();
    const [streams, setStreams] = useState({});

    const handleStream = (id, stream) => {
      setStreams(prevStreams => ({
        ...prevStreams,
        [id]: stream,
      }));
    };

    // const removeStream = ()
    const copyRoomId = async () => {
      try {
        await navigator.clipboard.writeText(roomId);
        toast.success('RoomID copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy ROOMID')
        console.error('Failed to copy: ', err);
      }
    }

    const leaveRoom = () => {
      navigate('/') ;
    }
    
    useEffect(() => {
        const init = async () => {
          // creates new socket and connects to server
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', handleErrors);
            socketRef.current.on('connect_failed', handleErrors);
            function handleErrors(err) {
                console.error('Socket error:', err);
                toast.error('Socket connection failed, please try again!');
                navigate('/');
            }
            
            peerRef.current =new Peer({
              config: {
                  'iceServers': [
                      { url: 'stun:stun.l.google.com:19302' }
                  ]
              }
          });
            
            peerRef.current.on('open', (peerId) => {
              console.log('My peer id is ' + peerId);
              setMyPeerId(peerId)
               // sending info to server.
              socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                userName: location.state?.userName,
                peerId
              });
            });

            socketRef.current.on(ACTIONS.JOINED , ({ allClients,userName,socketId}) => {
              console.log("All clients are" , allClients)
              if (userName!==location.state?.userName) {
                toast.success(`${userName} joined Room.`);
                console.log(`${userName} joined Room.`)
              }
              setClients(allClients);

              socketRef.current.emit(ACTIONS.SYNC_CODE , {
                code : codeRef.current,
                language : langRef.current,
                socketId
              })
            })

            socketRef.current.on(ACTIONS.DISCONNECTED , ({socketId,userName }) => {
              toast.success(`${userName} left the room`) ;
              setClients((prev)=>{
                return prev.filter((client) => client.socketId!==socketId) ;
              })
            })
        };
        init();
        // clearing function 
        return () => {
          // this function will be called if any listener unmounts
          // disconnecting socket
          socketRef.current.disconnect();
          // after disconnection deleting listeners
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
        }
    }, []);
    if (!location.state) {
        return <Navigate to="/" />;
    }
  return (
    <div className='mainWrap'>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
        <div className='leftBlock'>
          <div className='leftBlockInner'>
              <div className='brand'>
              <h2 className='brandImage'>CODEINMEET</h2>
              </div>
              <h3 className='connectedMessage'>CONNECTED</h3>
              <div className='clientsList'>
                {peerRef.current && (
                <Me
                  myUserName={location.state?.userName}
                  roomId={roomId}
                  peerRef={peerRef}
                  clients={clients}
                  handleStream={handleStream}
                  myPeerId={myPeerId}
                />
                )}
                {clients.map(({ socketId, userName, peerId }) =>
              userName !== location.state?.userName && (
                <Client
                  key={socketId}
                  userName={userName}
                  socketId={socketId}
                  peerId={peerId}
                  videoStream={streams[peerId]}
                />
              )
            )}
              </div>
          </div>

          <Chat userName={location.state?.userName} socketRef = {socketRef} roomId={roomId}/>
          
          <div className='down'>
            <button className='btn leaveRoomBtn' onClick={leaveRoom}><FontAwesomeIcon icon={faRightFromBracket} /></button>
            <button className='btn copyRoomBtn' onClick={copyRoomId}><FontAwesomeIcon icon={faCopy} /></button>
          </div>
        </div>
        <div className='editorWrap'>
          <Editor socketRef={socketRef} roomId={roomId} changeCode={(code) => {
            codeRef.current = code ;
            }}
            changeLang={(lang)=>{
              langRef.current = lang ;
            }}
          />
        </div>
    </div>
  )
}

export default EditorPage 