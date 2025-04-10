"use client";

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Mic as MicrophoneIcon, Send as SendIcon } from 'lucide-react';

export default function Home() {
  // State declarations
  const [messages, setMessages] = useState([
    { id: uuidv4(), role: 'assistant', content: 'Hello! I am DoubleHarmony, your AI poetry assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Function to get sky gradient based on time of day
  function getSkyGradient() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) {
      // Dawn
      return 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460, #e94560)';
    } else if (hour >= 8 && hour < 16) {
      // Day
      return 'linear-gradient(to bottom, #4a95ce, #63b6e0, #a1cadc)';
    } else if (hour >= 16 && hour < 19) {
      // Dusk
      return 'linear-gradient(to bottom, #1a2a6c, #b21f1f, #fdbb2d)';
    } else {
      // Night
      return 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)';
    }
  }

  // Function to handle sending messages
  function handleSendMessage() {
    if (input.trim() === '' && !isRecording) return;
    
    const userMessage = { id: uuidv4(), role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const botReply = { 
        id: uuidv4(), 
        role: 'assistant', 
        content: 'This is a placeholder response. Replace with your actual API call to get responses.' 
      };
      setMessages(prev => [...prev, botReply]);
      setIsLoading(false);
    }, 1000);
  }

  // Functions for voice recording
  function startRecording() {
    setIsRecording(true);
    // Add your actual recording logic here
    console.log('Started recording');
  }

  function stopRecording() {
    setIsRecording(false);
    // Add your actual recording stop logic here
    console.log('Stopped recording');
    
    // Simulate receiving voice input
    setInput('This is voice input placeholder');
  }

  // Render the component
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: getSkyGradient() }}>
      {/* Large outline title */}
      <div className="absolute top-4 left-0 right-0 text-center z-20">
        <h1 className="font-sans font-bold text-[10vw] tracking-wide"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px white',
              textShadow: '0 4px 8px rgba(0,0,0,0.2)',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
          DOUBLE HARMONY
        </h1>
      </div>
  
      <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10 mt-24">
        {/* Chat messages blend into background */}
        <div className="h-[700px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={chatContainerRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg transition-opacity duration-700 ${
                    message.role === 'user'
                      ? 'bg-blue-500 bg-opacity-70 text-white'
                      : 'bg-white bg-opacity-50 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
  
          {/* Input field */}
          <div className="p-4 border-t border-white border-opacity-20 bg-transparent">
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded-full ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-white bg-opacity-50 text-gray-600 hover:bg-opacity-70'
                }`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Type a message..."
                className="flex-1 py-2 px-4 border border-white border-opacity-30 bg-white bg-opacity-30 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                disabled={isLoading || isRecording}
              />
              <button
                className="p-2 bg-blue-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleSendMessage}
                disabled={isLoading || (input.trim() === '' && !isRecording)}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
