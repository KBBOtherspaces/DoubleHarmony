'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Volume2, User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  id: string;
  lines?: Array<{text: string, visible: boolean, position: number}>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Whomp is a whitty French poet whose writing is a mix of Ocean Vuong and Charles Bernstein',
      id: 'system-prompt'
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const animationTimersRef = useRef<number[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up animation timers on unmount
  useEffect(() => {
    return () => {
      animationTimersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Calculate scroll percentage for sky gradient
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const maxScroll = scrollHeight - clientHeight;
        const percentage = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
        setScrollPercentage(percentage);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Process assistant messages to create animated lines
  const processAssistantMessage = (content: string) => {
    // Split content by newlines or periods followed by space
    const textLines = content
      .split(/(?:\n+|(?<=\.)\s+)/)
      .filter(line => line.trim().length > 0)
      .map(line => ({
        text: line.trim(),
        visible: false,
        position: -100 // Start off-screen to the left
      }));
    
    return textLines;
  };

  // Animate the lines in an assistant message
  const animateLines = (messageId: string, lines: Array<{text: string, visible: boolean, position: number}>) => {
    animationTimersRef.current.forEach(timer => clearTimeout(timer));
    animationTimersRef.current = [];
    
    lines.forEach((line, index) => {
      // Animate line appearance with staggered timing
      const appearTimer = setTimeout(() => {
        setMessages(prev => {
          const updatedMessages = [...prev];
          const messageIndex = updatedMessages.findIndex(msg => msg.id === messageId);
          
          if (messageIndex !== -1 && updatedMessages[messageIndex].lines) {
            updatedMessages[messageIndex].lines![index].visible = true;
            
            // Animate position from left to center
            const positionTimer = setInterval(() => {
              setMessages(current => {
                const currentMessages = [...current];
                const msgIndex = currentMessages.findIndex(msg => msg.id === messageId);
                
                if (msgIndex !== -1 && currentMessages[msgIndex].lines && 
                    currentMessages[msgIndex].lines![index].position < 0) {
                  currentMessages[msgIndex].lines![index].position += 5;
                  
                  if (currentMessages[msgIndex].lines![index].position >= 0) {
                    currentMessages[msgIndex].lines![index].position = 0;
                    clearInterval(positionTimer);
                    
                    // After showing for some time, animate out to the right
                    const disappearTimer = setTimeout(() => {
                      const exitInterval = setInterval(() => {
                        setMessages(latest => {
                          const latestMessages = [...latest];
                          const latestMsgIndex = latestMessages.findIndex(msg => msg.id === messageId);
                          
                          if (latestMsgIndex !== -1 && latestMessages[latestMsgIndex].lines) {
                            latestMessages[latestMsgIndex].lines![index].position += 5;
                            
                            if (latestMessages[latestMsgIndex].lines![index].position > 100) {
                              // Once offscreen, make it reappear from the left
                              latestMessages[latestMsgIndex].lines![index].position = -100;
                              clearInterval(exitInterval);
                            }
                          }
                          return latestMessages;
                        });
                      }, 50);
                      
                      animationTimersRef.current.push(window.setTimeout(() => clearInterval(exitInterval), 10000));
                    }, 5000 + Math.random() * 3000); // Random time before exiting
                    
                    animationTimersRef.current.push(disappearTimer);
                  }
                }
                return currentMessages;
              });
            }, 50);
            
            animationTimersRef.current.push(window.setTimeout(() => clearInterval(positionTimer), 10000));
          }
          return updatedMessages;
        });
      }, 500 + index * 800); // Staggered appearance
      
      animationTimersRef.current.push(appearTimer);
    });
  };

  // Sky colors based on scroll percentage (0% = sunrise, 50% = midday, 100% = sunset)
  const getSkyGradient = () => {
    if (scrollPercentage < 33) {
      // Sunrise: pink/orange to light blue
      const progress = scrollPercentage / 33;
      return `linear-gradient(to bottom, 
        rgb(${255 - progress * 100}, ${193 - progress * 50}, ${203 - progress * 100}) 0%,
        rgb(${255 - progress * 75}, ${215 - progress * 20}, ${140 - progress * 70}) 40%,
        rgb(${173 + progress * 50}, ${216 + progress * 20}, ${230 + progress * 25}) 100%)`;
    } else if (scrollPercentage < 66) {
      // Midday: light blue to deeper blue
      const progress = (scrollPercentage - 33) / 33;
      return `linear-gradient(to bottom, 
        rgb(${135 - progress * 50}, ${206 - progress * 30}, ${235 - progress * 15}) 0%,
        rgb(${173 - progress * 70}, ${236 - progress * 70}, ${255 - progress * 75}) 60%,
        rgb(${223 - progress * 120}, ${245 - progress * 100}, ${255 - progress * 70}) 100%)`;
    } else {
      // Sunset: deeper blue to orange/red
      const progress = (scrollPercentage - 66) / 34;
      return `linear-gradient(to bottom, 
        rgb(${85 + progress * 170}, ${176 - progress * 80}, ${220 - progress * 120}) 0%,
        rgb(${103 + progress * 152}, ${166 - progress * 20}, ${180 - progress * 80}) 40%,
        rgb(${100 + progress * 155}, ${145 - progress * 30}, ${185 - progress * 150}) 70%,
        rgb(${177 + progress * 78}, ${153 - progress * 53}, ${80 + progress * 10}) 100%)`;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      formData.append('file', file);

      const response = await fetch('/api/speech', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      setInput(data.text);
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      alert(error.message || 'Failed to transcribe audio');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error: any) {
      console.error('Error generating speech:', error);
      alert(error.message || 'Failed to generate speech');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      id: `user-${Date.now()}`
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const assistantMessage = await response.json();
      const lines = processAssistantMessage(assistantMessage.content);
      
      const newAssistantMessage: Message = {
        role: 'assistant',
        content: assistantMessage.content,
        timestamp: Date.now(),
        id: `assistant-${Date.now()}`,
        lines: lines
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
      // Start animating the lines after a brief delay
      setTimeout(() => {
        animateLines(newAssistantMessage.id, lines);
      }, 500);
      
    } catch (error) {
      console.error('Error getting completion:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
          id: `error-${Date.now()}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: getSkyGradient() }}>
      {/* Clouds effect */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        <div className="cloud-1 absolute w-64 h-16 bg-white rounded-full" 
          style={{ 
            top: '5%', 
            left: `${10 + scrollPercentage * 0.5}%`,
            filter: 'blur(8px)',
            opacity: scrollPercentage < 80 ? 0.8 - (scrollPercentage / 100) : 0
          }}
        />
        <div className="cloud-2 absolute w-52 h-12 bg-white rounded-full" 
          style={{ 
            top: '15%', 
            left: `${50 - scrollPercentage * 0.3}%`,
            filter: 'blur(6px)',
            opacity: scrollPercentage < 85 ? 0.7 - (scrollPercentage / 120) : 0
          }}
        />
        <div className="cloud-3 absolute w-72 h-14 bg-white rounded-full" 
          style={{ 
            top: '25%', 
            left: `${30 + scrollPercentage * 0.4}%`,
            filter: 'blur(7px)',
            opacity: scrollPercentage < 90 ? 0.9 - (scrollPercentage / 100) : 0
          }}
        />
      </div>

      {/* Sun/Moon effect */}
      <div className="absolute w-20 h-20 rounded-full" 
        style={{ 
          background: scrollPercentage < 30 ? 'rgb(255, 199, 107)' : 
                     scrollPercentage < 70 ? 'rgb(255, 235, 170)' : 
                     'rgb(255, 170, 107)',
          boxShadow: scrollPercentage < 30 ? '0 0 60px rgba(255, 199, 107, 0.8)' : 
                    scrollPercentage < 70 ? '0 0 80px rgba(255, 235, 170, 0.9)' : 
                    '0 0 60px rgba(255, 170, 107, 0.8)',
          top: `${10 + scrollPercentage * 0.6}%`, 
          left: `${10 + scrollPercentage * 0.8}%`,
        }}
      />

      <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
          <div className="h-[700px] flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-800">AI Poet Chat</h1>
              <p className="text-sm text-gray-600">Chat with Whomp, the French AI poet</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={chatContainerRef}>
              {messages.slice(1).map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot size={20} className="text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`flex flex-col max-w-[70%] ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <div className="rounded-2xl p-4 bg-blue-500 text-white">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl p-4 bg-gray-100 text-gray-800 min-h-[60px] min-w-[200px]">
                        {/* Animated text for assistant messages */}
                        {message.lines ? (
                          <div className="relative overflow-hidden h-full">
                            {message.lines.map((line, idx) => (
                              <div 
                                key={idx}
                                className="transition-all duration-500 absolute whitespace-pre-wrap"
                                style={{
                                  opacity: line.visible ? 1 : 0,
                                  transform: `translateX(${line.position}%)`,
                                  top: `${idx * 28}px`,
                                  width: '100%'
                                }}
                              >
                                {line.text}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    )}
                    
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => speakText(message.content)}
                        className="mt-2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Text to speech"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                    
                    {message.timestamp && (
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot size={20} className="text-blue-600" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  disabled={isLoading}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <button
                  type="submit"
                  className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim() || isLoading}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
