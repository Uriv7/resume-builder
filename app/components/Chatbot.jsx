"use client";

import { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { ChatBubbleLeftIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your resume assistant. I can help you write and improve your resume. What would you like help with?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending message:', userMessage); // Debug log
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from assistant');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!data.message) {
        throw new Error('Invalid response format from API');
      }

      if (data.status === 'error') {
        throw new Error(data.error || 'Unknown error occurred');
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error('Chat Error:', error); // Debug log
      setError(error.message);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}. Please try again later.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open chat"
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
      </button>

      {/* Chat dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <Dialog.Title className="text-lg font-semibold dark:text-white">
                Resume Assistant
              </Dialog.Title>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "assistant" ? 'justify-start' : 'justify-end'} mb-4`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "assistant"
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="text-red-500 text-sm mt-2 mb-4 text-center">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me about resume writing..."
                  disabled={isLoading}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default Chatbot;
