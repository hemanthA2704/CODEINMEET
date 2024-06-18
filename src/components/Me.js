import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import Avatar from 'react-avatar';
import Peer from 'peerjs';
import ACTIONS from '../Actions';

const Me = ({ userName, myUserName, roomId, socketRef }) => {
    const [videoStatus, setVideoStatus] = useState(false);
    const [micStatus, setMicStatus] = useState(false);
    

    const handleMic = () => {
        setMicStatus((status) => !status);
      };
    
      const handleVideo = () => {
        setVideoStatus((status) => !status);
      };
      const peerRef = useRef(null);
      const myPeerIdRef = useRef(null);
      const allPeersRef = useRef([]);
    
      
      useEffect(() => {
        if (!peerRef.current) {
          const peer = new Peer();
          peerRef.current = peer;
    
          peer.on('open', (peerId) => {
            console.log('My peer id is ' + peerId);
            myPeerIdRef.current = peerId;
            socketRef.current.emit(ACTIONS.PEER_JOIN, { peerId, roomId });
          });
    
          peer.on('close', () => {
            socketRef.current.emit(ACTIONS.PEER_LEAVE, { peerId: myPeerIdRef.current, roomId });
          });
    
          socketRef.current.on(ACTIONS.PEER_JOIN, ({ peerId }) => {
            console.log("A user with this peerId joined: " + peerId);
            allPeersRef.current = [...allPeersRef.current, peerId];
            console.log("Current peers:", allPeersRef.current);
          });
    
          socketRef.current.on(ACTIONS.PEER_LEAVE, ({ peerId }) => {
            allPeersRef.current = allPeersRef.current.filter((id) => id !== peerId);
            console.log("Current peers:", allPeersRef.current);
          });
        }
    
        return () => {
          if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null; // Ensure the ref is reset
          }
        };
      }, [roomId, socketRef.current]);
    
  
  return (
    <div className='client'>
      <Avatar name={userName} size={30} round="10px" />
      <span className='userName'>{userName === myUserName ? `${userName} (me)` : userName}</span>
      <div className='audVidBtns'>
        <button className='btns mic' onClick={handleMic}>
          <FontAwesomeIcon icon={micStatus ? faMicrophone : faMicrophoneSlash} />
        </button>
        <button className='btns video' onClick={handleVideo}>
          <FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} />
        </button>
      </div>
    </div>
  )
}

export default Me