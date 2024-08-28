const CONSTANTS = require("../utils/constants");
let authService = require(`./authService`);
const messageService = require("./messageService");
module.exports = async (io)=> {
    // console.log(io);
    io.use(authService.validateUserSocket);

    io.on('connection',async(socket)=>{
        console.log('connection check',socket.id);
        socket.on(CONSTANTS.SOCKET_EVENTS.SEND_MESSAGE,async (data)=>{
           let message =  await messageService.cerate(data);
           io.to(data.chatId).emit(CONSTANTS.SOCKET_EVENTS.NEW_MESSAGE, message);
        });

        socket.on(CONSTANTS.SOCKET_EVENTS.JOIN_RROM,(data)=>{
            socket.join(data.room);
        });
    })
    

}