import React, { useContext, useState } from 'react';
import { SocketContext } from './context/SocketContext';

const App = () => {

  const [input, setInput] = useState('');
  
  const { sendMessage,messages } = useContext(SocketContext);

  const handleSend = () => {
    if (input) {
      sendMessage(input)
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3">
        <div className="h-96 overflow-y-auto p-2 border-b border-gray-300 flex flex-col gap-2">
          {messages.map((msg, index) => (
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  {msg}
                </p>
              </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Enter your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
