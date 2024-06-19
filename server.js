const express = require("express") ;
const app = express();
const http = require('http');
const cors = require('cors')
const {Server} = require("socket.io");
const ACTIONS = require('./src/Actions') ;
const path = require("path");

app.use(cors({
    origin:'*',
    methods: ['GET','POST']
}));

app.use(express.static('build')) ;
app.use((req,res,next) => {
    res.sendFile(path.join(__dirname,'build','index.html'));
})

const server = http.createServer(app) ;
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (change this to specify allowed origins)
        methods: ['GET', 'POST'] // Specify allowed methods
    }
});

const userNameSocketMap = {};
const socketPeerMap = {} ;
const getAllClients = (roomId) => {
    // returns a map   
    console.log(roomId)
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            userName : userNameSocketMap[socketId],
            peerId : socketPeerMap[socketId],
            socketId : socketId,
        }  
    });
}

// const getAllPeers = (roomId) => {
//     return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
//         return {
//             peerId : socketPeerMap[socketId] ,
//             socketId : socketId
//         }
//     })
// }

io.on('connection',(socket) =>{
    console.log("socket" ,) ;
    console.log('socket connected' , socket.id) ;

    socket.on(ACTIONS.JOIN , ({roomId , userName , peerId})=>{
        userNameSocketMap[socket.id]=userName ;
        socketPeerMap[socket.id]=peerId ;
        // if a room already exists with current roomId then this socket will be added 
        // to roomId, otherwise new room will be created with roomId
        socket.join(roomId);
        const allClients = getAllClients(roomId)   
        console.log("all clients are : " , allClients)

        allClients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED ,{
                userName,
                allClients,
                socketId : socket.id
            })
        })
    }) ;
// here the work of server is to update the peerId's or all the peers.
    // socket.on(ACTIONS.PEER_JOIN , ({peerId , roomId }) => {
    //     console.log("a new peerID is " + peerId)
    //     console.log("socket id is " + socket.id) ;
    //     console.log("all peers are : " + getAllPeers(roomId))
    //     socketPeerMap[socket.id]=peerId ;
    //     io.to(socket.id).emit(ACTIONS.SYNC_PEERS , getAllPeers(roomId))
    //     socket.in(roomId).emit(ACTIONS.PEER_JOIN , {peerId , socketId : socket.id}) ;
    // });

    // socket.on(ACTIONS.PEER_LEAVE , ({peerId , roomId})=> {
    //     console.log(`a peer with id ${peerId} left`);
    //     socket.in(roomId).emit(ACTIONS.PEER_LEAVE , {peerId}) ;
    //     delete socketPeerMap[socket.id]
    // })

    socket.on(ACTIONS.CODE_CHANGE,({roomId,code}) => {
        // except current socket , request will be sent to remaining sockets present in the room
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code}) ;
    });

    socket.on(ACTIONS.LANG_CHANGE , ({roomId , language}) => {
        socket.in(roomId).emit(ACTIONS.LANG_CHANGE , {language})
    }) ;

    socket.on(ACTIONS.SYNC_CODE , ({code , language, socketId})=> {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE , {code});
        io.to(socketId).emit(ACTIONS.LANG_CHANGE , {language})
    });

    socket.on(ACTIONS.MSG , ({newMessage , roomId}) => {
        console.log(newMessage) ;
        socket.in(roomId).emit(ACTIONS.MSG,{newMessage}) ;
    } )
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

            // socket.in(roomId).emit(ACTIONS.PEER_LEAVE , {peerId : socketPeerMap[socket.id]}) ;
        })
        delete userNameSocketMap[socket.id] ;
        delete socketPeerMap[socket.id]
        socket.leave() ;
    })
});

const PORT = process.env.PORT || 5000 ;
server.listen(PORT , () => console.log(`Server running on port ${PORT}`))
