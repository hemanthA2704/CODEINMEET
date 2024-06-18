import React, { useState, useRef, useEffect } from 'react';
import Avatar from 'react-avatar';


const Client = ({ userName, roomId, socketRef }) => {

  return (
    <div className='client'>
      <Avatar name={userName} size={65} round="10px" />
      <span className='userName'>{userName}</span>
    </div>
  );
};

export default Client;
