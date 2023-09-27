import React, { useState } from 'react';
import Chanel from "./chat.channels";
import MessagesContainer from "./chat.messagescontainer";
import Players from "./chat.chat.players";
import { User } from '../../lib/types';


const Chat = () => {
  const [users, setUsers] = useState<User[]>([
    { name: "General", messages: [] },
    { name: "Juan", messages: [] },
    { name: "Ana", messages: [] },
    { name: "Carlos", messages: [] },
    { name: "Luisa", messages: [] }
  ]);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState< User | null >(null);

  const [myName, setMyName] = useState('');  // Nuevo estado para el nombre del usuario

  const handleSetMyName = (name: string) => {
    setMyName(name);
    alert(`Tu nombre ahora es ${name} 😂`);
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
        {/* <Chanel users={users} onUserSelect={selectUser} usuarioSeleccionado={usuarioSeleccionado} /> */}
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
            messages={usuarioSeleccionado ? usuarioSeleccionado.messages : []}
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
