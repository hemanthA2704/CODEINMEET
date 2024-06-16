import {io} from 'socket.io-client' ;

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports : ['websocket']
    }
    // console.log(process.env.REACT_APP_BACKEND_URL)
    return io(process.env.REACT_APP_BACKEND_URL,options) ;
}
// no need to add dotenv.config() for adding env file , as react by default gives it.
// we should use  REACT_APP as a prefix to the env variable