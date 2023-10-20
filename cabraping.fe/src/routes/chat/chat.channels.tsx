import React, { useState } from 'react';
import { Channel } from '../../lib/types';

type ChanelProps = {
  users: Channel[];
  onUserSelect: (user: Channel) => void;
  usuarioSeleccionado: Channel | null;
  onAddNewUser: (userName: string) => void; // Prop para agregar un nuevo usuario
};

const Chanel: React.FC<ChanelProps> = ({ users, onUserSelect, usuarioSeleccionado, onAddNewUser, myName, onSetMyName }) => {
  const [newUserName, setNewUserName] = useState(''); // Para guardar el nombre del nuevo usuario
  const [currentName, setCurrentName] = useState(myName);  // Para gestionar el input del nombre

  const handleAddUser = () => {
    if (newUserName.trim()) {
      onAddNewUser(newUserName.trim());
      setNewUserName(''); // Reseteamos el input
    }
  };

  const handleSetName = () => {
    if (currentName.trim()) {
      onSetMyName(currentName.trim());
      // alert(`Tu nombre ahora es ${currentName.trim()}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Your name:</label>
        <input 
          type="text" 
          value={currentName} 
          onChange={e => setCurrentName(e.target.value)}
          placeholder="Enter your name"
          className="border p-2 rounded-l mr-2"
        />
        <button onClick={handleSetName} className="bg-blue-500 text-white px-4 py-2 rounded-r">Establish</button>
      </div>
      <ul >
        <h3><b>Chanels</b></h3>
        {users.map((user, index) => (
          <li 
            key={index}
            className={`cursor-pointer p-2 ${usuarioSeleccionado && usuarioSeleccionado.name === user.name ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            onClick={() => onUserSelect(user)}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chanel;

