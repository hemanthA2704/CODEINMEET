const express = require("express") ;
const app = express();
const http = require('http');
const {Server} = require("socket.io");
const ACTIONS = require('./src/Actions')
const server = http.createServer(app) ;
const io = new Server(server);

const userNameSocketMap = {};
const getAllClients = (roomId) => {
    // returns a map   
    console.log(roomId)
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            userName : userNameSocketMap[socketId],
            socketId : socketId
        }  
    });
}

io.on('connection',(socket) =>{
    console.log('socket connected' , socket.id) ;
    socket.on(ACTIONS.JOIN , ({roomId , userName})=>{
        userNameSocketMap[socket.id]=userName ;
        // if a room already exists with current roomId then this socket will be added 
        // to roomId, otherwise new room will be created with roomId
        socket.join(roomId);
        const allClients = getAllClients(roomId)   
        console.log(allClients)

        allClients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED ,{
                userName,
                allClients,
                socketId : socket.id
            })
        })
    }) ;

    socket.on(ACTIONS.CODE_CHANGE,({roomId,code}) => {
        // except current socket , request will be sent to remaining sockets present in the room
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code}) ;
    });

    socket.on(ACTIONS.SYNC_CODE , ({code , socketId})=> {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE , {code});
    });
    // before completely disconnecting this event will be triggered
    // if anyone removing tab or navigating to other tab this (socket will be deleted if tab closes)
    socket.on('disconnecting' , ()=> {
        // gives all the room related to socket
        const rooms = Array.from(socket.rooms) ;
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED , {
                socketId : socket.id ,
                userName : userNameSocketMap[socket.id]
            })
        })
        delete userNameSocketMap[socket.id] ;
        socket.leave() ;
    })
});

const PORT = process.env.PORT || 5000 ;
server.listen(PORT , () => console.log(`Server running on port ${PORT}`))
