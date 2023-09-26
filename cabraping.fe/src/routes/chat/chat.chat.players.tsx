import React from 'react';
import { User} from '../../lib/types';

type PlayersProps = {
  user: User | null;
  onInvite: (user: User) => void;
  onAccept: (user: User) => void;
  onProfile: (user: User) => void;
  onBlock: (user: User) => void;
};

const Players: React.FC<PlayersProps> = ({ user, onInvite, onAccept, onProfile, onBlock }) => {
  if (!user) return <div>Selecciona un usuario</div>;

  return (
    <div className="bg-gray-100 p-4">
      <h2 className="text-xl font-semibold mb-4">{user.name}</h2>
      <div className="space-x-2">
        <button onClick={() => onInvite(user)} className="text-blue-500">Invitar</button>
        <button onClick={() => onAccept(user)} className="text-green-500">Aceptar</button>
        <button onClick={() => onProfile(user)} className="text-gray-500">Perfil</button>
        <button onClick={() => onBlock(user)} className="text-red-500">Bloquear</button>
      </div>
    </div>
  );
};

export default Players;
