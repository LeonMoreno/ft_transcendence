import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3000, {
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: any) {

    console.log('Esto se ejecuta cuando inicia');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Hola alguien se conecto al socket 👌👌👌');

    client.join(`room_General`);
    client.join(`room_42_Quebec`);
    client.join(`room_Random`);
  }

  handleDisconnect(client: any) {
    console.log('ALguien se fue! chao chao');
  }

  @SubscribeMessage('event_join')
  handleJoinRoom(client: Socket, room: string) {
    console.log('-> join to:room_' + room);

    client.join(`room_${room}`);
  }
  
  @SubscribeMessage('ms_join')
  handleJoinMS(client: Socket, user: string) {
    console.log('-> MS to:ms_' + user);

    client.join(`ms_${user}`);
  }

  @SubscribeMessage('event_message')
  handleIncommingMessage(
    client: Socket,
    payload: { room: string; message: string; name: string },
  ) {
    const { room } = payload;

    console.log(payload);

    // Emit the message to the channel room (users in the same channel will receive it)
    // this.server.to(`room_${room}`).emit('new_message', message);
    client.to(`room_${room}`).emit('new_message', payload);
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(`room_${room}`);
  }
}
