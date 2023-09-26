import React from 'react';
import { User } from '../../lib/types';

type ChanelProps = {
  users: User[];
  onUserSelect: (user: User) => void;
};

const Chanel: React.FC<ChanelProps> = ({ users, onUserSelect }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <ul>
        {users.map((user, index) => (
          <li
            key={index}
            className="cursor-pointer hover:bg-gray-200 p-2"
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
