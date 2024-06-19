import React, { useEffect, useRef } from 'react';
import Avatar from 'react-avatar';

const Client = ({ userName, videoStream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoStream) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play();
    } else {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    }
  }, [videoStream]);

  return (
    <div className='client'>
      <div className='clientVideoContainer'>
        {videoStream ? (
          <video ref={videoRef} className='clientVideo' />
        ) : (
          <Avatar name={userName} size={100} round="10px" />
        )}
      </div>
      <span className='userName'>{userName}</span>
    </div>
  );
};

export default Client;
