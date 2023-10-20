import React, { useState, useEffect } from 'react';
import Chanel from "./chat.channels";
import MessagesContainer from "./chat.messagescontainer";
import Players from "./chat.chat.players";
import { Channel } from '../../lib/types';
import io from 'socket.io-client';
const Chat = () => {

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState< Channel | null >(null);
  const [socket, setSocket] = useState(null);
  const [myName, setMyName] = useState<string>('default');
  const [users, setUsers] = useState<Channel[]>([
    { chanel:  'General', name: "General", messages: [] },
    { chanel:  '42_Quebec', name: "42 Quebec", messages: [] },
    { chanel:  'Random', name: "Random", messages: [] },
  ]);

  useEffect(() => {
    const newSocket = io('ws://localhost:81'); // Replace with your WebSocket server URL
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Handle incoming messages for the selected channel
  useEffect(() => {
    if (socket && usuarioSeleccionado) {
      socket.on('new_message', (payload) => {

        console.log('⬇️ Received new_message:', payload);
        // Process and update your state with the received message

        const updatedUsers = users.map(channel => {
          if (channel.chanel === payload.room) {
            console.log(`->> update Channel:${channel.name}`);
            console.log(channel);

            return {
              ...channel,
              messages: [...channel.messages, { text: payload.message, isMine: false, name: payload.name }]
            };
          }
          return channel;
        });

        setUsers(updatedUsers);

        const updatedSelectedUser = updatedUsers.find(channel => channel.chanel === usuarioSeleccionado.chanel);
        setUsuarioSeleccionado(updatedSelectedUser);
      });
    }
  }, [socket, users, usuarioSeleccionado]);

  const sendMessageToServer = (messageText: string) => {
    if (socket && usuarioSeleccionado) {
      socket.emit('event_message', {
        room: usuarioSeleccionado.chanel,
        message: messageText,
        name: myName,
      });
    }
  };

  const joinChannel = (channelName: string) => {
    if (socket) {
      socket.emit('event_join', channelName);
    }
  }

  const handleSetMyName = (name: string) => {
    setMyName(name);
  };

  const handleSendMessage = (messageText: string, myName: string) => {

    if (!usuarioSeleccionado) return;

    console.log("handleSendMessage");
    

    const updatedUsers = users.map(channel => {
      if (channel.chanel === usuarioSeleccionado.chanel) {
        return {
          ...channel,
          messages: [...channel.messages, { text: messageText, isMine: true, name: myName}]
        };
      }
      return channel;
    });

    setUsers(updatedUsers);

    const updatedSelectedUser = updatedUsers.find(channel => channel.chanel === usuarioSeleccionado.chanel);
    setUsuarioSeleccionado(updatedSelectedUser);

    sendMessageToServer(messageText);
  };

  const handleInvite = (channel: Channel) => {
    console.log(`Inviting ${channel.name} to play.`);
  };

  const handleAccept = (channel: Channel) => {
    console.log(`Accepting the invitation from ${channel.name}.`);
  };

  const handleProfile = (channel: Channel) => {
    console.log(`Viewing the profile of ${channel.name}.`);
  };

  const handleBlock = (channel: Channel) => {
    console.log(`Blocking ${channel.name}.`);
  };

  const selectUser = (channel: Channel) => {
    console.log("setUsuarioSeleccionado:");
    console.log(channel);

    if (channel.chanel != 'no')
    {
      joinChannel(channel.chanel);
    }
    setUsuarioSeleccionado(channel);
  };

  const handleAddNewUser = (userName: string) => {
    const newUser = { name: userName, messages: [] };
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="w-1/4 bg-white border-r">
        <Chanel
          users={users}
          onUserSelect={selectUser}
          usuarioSeleccionado={usuarioSeleccionado}
          onAddNewUser={handleAddNewUser}
          myName={myName}
          onSetMyName={handleSetMyName}
        />
      </div>
      <div className="w-1/2 p-4">
          <MessagesContainer
            // messages={usuarioSeleccionado ? usuarioSeleccionado.messages : []}
            messages={usuarioSeleccionado ? usuarioSeleccionado.messages : []}
            user={usuarioSeleccionado ? usuarioSeleccionado: null}
            myName={myName}
            onSendMessage={handleSendMessage}
          />

      </div>
      <div className="w-1/4 bg-white border-l">
        <Players
          user={usuarioSeleccionado}
          onInvite={handleInvite}
          onAccept={handleAccept}
          onProfile={handleProfile}
          onBlock={handleBlock}
        />
      </div>
    </div>
  );
};

export default Chat;
