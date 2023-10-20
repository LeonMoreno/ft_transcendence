import React, { useState } from 'react';
import { Message, Channel } from '../../lib/types';

type MessagesContainerProps = {
  messages: Message[];
  onSendMessage: (messageText: string) => void;
  user: Channel;
  myName: string;
};

const MessagesContainer: React.FC<MessagesContainerProps> = ({ messages, onSendMessage, user, myName }) => {

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, myName);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-gray-100 p-4 flex flex-col h-full">
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`p-2 rounded ${message.isMine ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-gray-700'} mb-2`}>
            {/* {user.name}: {message.text} */}
            {/* {(myName)? (`${myName}: ${message.text}`): message.text } */}
            {(message.isMine)? (`${myName}: ${message.text}`): (`${message.name}: ${message.text}`) }
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-grow p-2 border rounded-l"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Write a message..."
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r" onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessagesContainer;
