import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import Avatar from 'react-avatar';

const Me = ({ myUserName, roomId, peerRef, clients, handleStream ,myPeerId }) => {
  const [videoStatus, setVideoStatus] = useState(false);
  const [micStatus, setMicStatus] = useState(false);
  const videoRef = useRef(null);

  const handleMic = () => {
    setMicStatus((status) => !status);
  };

  const handleVideo = () => {
    if (videoStatus) {
      stopVideoStream();
    } else {
      startVideoStream();
    }
    setVideoStatus((status) => !status);
  };

  const startVideoStream = () => {
    navigator.mediaDevices.getUserMedia({ video: true , audio : micStatus })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        clients.forEach(({ peerId }) => {
          if (peerId !== myPeerId) {
            peerRef.current.call(peerId, stream);
          }
        });
      })
      .catch(err => console.error(err));
  };

  const stopVideoStream = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
    handleStream(myPeerId, null);
  };

  useEffect(() => {
    if (peerRef.current) {
      peerRef.current.on('call', call => {
        call.answer();
        call.on('stream', remoteStream => {
          handleStream(call.peer, remoteStream);
        });
      });
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null; // Ensure the ref is reset
      }
    };
  }, [roomId, peerRef]);

  return (
    <div className='client'>
      <div className='videoContainer'>
        {videoStatus ? (
          <video ref={videoRef} className='myVideo' muted />
        ) : (
          <Avatar name={myUserName} size={65} round="10px" />
        )}
      </div>
      <span className='userName'>{myUserName + ' (you)'}</span>
      <div className='audVidBtns'>
        <button className='btns mic' onClick={handleMic}>
          <FontAwesomeIcon icon={micStatus ? faMicrophone : faMicrophoneSlash} />
        </button>
        <button className='btns video' onClick={handleVideo}>
          <FontAwesomeIcon icon={videoStatus ? faVideo : faVideoSlash} />
        </button>
      </div>
    </div>
  );
};

export default Me;
