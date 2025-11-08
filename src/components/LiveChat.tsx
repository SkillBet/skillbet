'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      username: 'System',
      message: '🎉 Welcome to SkillBet Casino! Chat with other players here.',
      timestamp: new Date(),
      isSystemMessage: true,
    },
    {
      id: 2,
      username: 'Player123',
      message: 'Just won 5 SOL on Mines! 🔥',
      timestamp: new Date(),
    },
    {
      id: 3,
      username: 'CryptoKing',
      message: 'Nice! What difficulty?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [username] = useState(`Guest${Math.floor(Math.random() * 9999)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      username,
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center text-3xl shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse"
      >
        {isOpen ? '✕' : '💬'}
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
          3
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 flex flex-col animate-slide-up">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-white font-black text-lg">Live Chat</h3>
                <p className="text-purple-100 text-xs font-semibold">342 online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${
                  msg.isSystemMessage
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : msg.username === username
                    ? 'bg-purple-500/20 border-purple-500/50 ml-8'
                    : 'bg-gray-800/50 border-gray-700/50'
                } border rounded-xl p-3 animate-slide-up`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!msg.isSystemMessage && (
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {msg.username.charAt(0)}
                    </div>
                  )}
                  <span
                    className={`font-bold text-sm ${
                      msg.isSystemMessage
                        ? 'text-blue-400'
                        : msg.username === username
                        ? 'text-purple-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-white text-sm">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700/50 bg-black/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 glass-effect border-purple-900/30 text-white text-sm px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Logged in as <span className="text-purple-400 font-bold">{username}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
