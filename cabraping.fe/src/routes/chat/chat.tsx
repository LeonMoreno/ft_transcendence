import React, { useState, useEffect } from 'react';
import Chanel from "./chat.channels";
import MessagesContainer from "./chat.messagescontainer";
import Players from "./chat.chat.players";
import { User } from '../../lib/types';

import useWebSocket from 'react-use-websocket';


const Chat = () => {

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState< User | null >(null);
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket('ws://localhost:8080/');
  const [myName, setMyName] = useState<string>('default');

  const [users, setUsers] = useState<User[]>([
    { chanel:  'General', name: "General", messages: [] },
    { chanel: 'no', name: "Juan", messages: [] },
    { chanel: 'no', name: "Ana", messages: [] },
    { chanel: 'no', name: "Carlos", messages: [] },
    { chanel: 'no', name: "Luisa", messages: [] }
  ]);

  useEffect(() => {

    if (lastMessage && typeof lastMessage.data === 'string' && lastMessage.data[0] == '{') {
      const receivedData = JSON.parse(lastMessage.data);


      const updatedUsers = users.map(user => {
        if (user.name === "General") {
          return {
            ...user,
            messages: [...user.messages, { text: receivedData.text, isMine: false }]
          };
        }
        return user;
      });

      setUsers(updatedUsers);

      const updatedSelectedUser = updatedUsers.find(user => user.name === usuarioSeleccionado.name);
      setUsuarioSeleccionado(updatedSelectedUser);

    }
  }, [lastMessage]);


  const handleSetMyName = (name: string) => {
    setMyName(name);
  };

  const handleSendMessage = (messageText: string) => {
    if (!usuarioSeleccionado) return;

    const updatedUsers = users.map(user => {
      if (user.name === usuarioSeleccionado.name) {
        return {
          ...user,
          messages: [...user.messages, { text: messageText, isMine: true }]
        };
      }
      return user;
    });

    setUsers(updatedUsers);

    // Here is the key change: we are updating the selecteduser reference
    const updatedSelectedUser = updatedUsers.find(user => user.name === usuarioSeleccionado.name);
    setUsuarioSeleccionado(updatedSelectedUser);


    // Envía el mensaje al servidor WebSocket
    // sendJsonMessage({ name: myName, text: messageText });
    sendJsonMessage({
      channel: usuarioSeleccionado.name,
      name: myName,
      text: messageText,
    });
  };

  const handleInvite = (user: User) => {
    console.log(`Invitando a ${user.name} a jugar.`);
  };

  const handleAccept = (user: User) => {
    console.log(`Aceptando la invitación de ${user.name}.`);
  };

  const handleProfile = (user: User) => {
    console.log(`Viendo el perfil de ${user.name}.`);
  };

  const handleBlock = (user: User) => {
    console.log(`Bloqueando a ${user.name}.`);
  };

  const selectUser = (user: User) => {
    setUsuarioSeleccionado(user);
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
