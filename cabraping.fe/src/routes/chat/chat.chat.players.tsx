import React from 'react';
import { Channel} from '../../lib/types';

type PlayersProps = {
  user: Channel | null;
  onInvite: (user: Channel) => void;
  onAccept: (user: Channel) => void;
  onProfile: (user: Channel) => void;
  onBlock: (user: Channel) => void;
};

const Players: React.FC<PlayersProps> = ({ user, onInvite, onAccept, onProfile, onBlock }) => {
  if (!user) return <div>Select a user</div>;

  return (
    <div className="bg-gray-100 p-4">
      <h2 className="text-xl font-semibold mb-4">{user.name}</h2>
      <div className="space-x-2">
        <button onClick={() => onInvite(user)} className="text-blue-500">Invite</button>
        <button onClick={() => onAccept(user)} className="text-green-500">Accept</button>
        <button onClick={() => onProfile(user)} className="text-gray-500">Profile</button>
        <button onClick={() => onBlock(user)} className="text-red-500">Block</button>
      </div>
    </div>
  );
};

export default Players;
