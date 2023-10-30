import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(server: any): void;
    handleConnection(client: any, ...args: any[]): void;
    handleDisconnect(client: any): void;
    handleJoinRoom(client: Socket, room: string): void;
    handleJoinMS(client: Socket, user: string): void;
    handleIncommingMessage(client: Socket, payload: {
        room: string;
        message: string;
        name: string;
    }): void;
    handleRoomLeave(client: Socket, room: string): void;
}
