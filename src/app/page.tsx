export default function Home() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [animationLines, setAnimationLines] = useState<{text: string, visible: boolean, position: number}[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // New function for animating poet responses
  const animatePoetResponse = (content: string) => {
    // Split content into lines
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Initialize animation state
    setAnimationLines([]);
    let currentLineIndex = 0;
    let position = -100; // Start off-screen
    let direction = 1; // 1 for entering, -1 for exiting
    let delay = 0;
    
    // Animation function
    const animate = () => {
      if (currentLineIndex >= lines.length) {
        animationRef.current = null;
        return;
      }
      
      if (delay > 0) {
        delay--;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Update position
      position += 2 * direction;
      
      // Update animation state
      setAnimationLines(prevLines => {
        const newLines = [...prevLines];
        
        // Update current line
        if (newLines[currentLineIndex]) {
          newLines[currentLineIndex].position = position;
          
          // Check if line has completed its movement
          if ((direction === 1 && position >= 0) || (direction === -1 && position <= -100)) {
            if (direction === 1) {
              // Line has entered fully, prepare to exit after a delay
              direction = -1;
              delay = 50; // Delay before exiting
            } else {
              // Line has exited, move to next line
              currentLineIndex++;
              direction = 1;
              position = -100; // Reset position for next line
              
              // Add next line if available
              if (currentLineIndex < lines.length) {
                newLines[currentLineIndex] = {
                  text: lines[currentLineIndex],
                  visible: true,
                  position: position
                };
              }
            }
          }
        } else if (currentLineIndex < lines.length) {
          // Add first line if we're just starting
          newLines[currentLineIndex] = {
            text: lines[currentLineIndex],
            visible: true,
            position: position
          };
        }
        
        return newLines;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Rest of the existing code
      // ...
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Update the handleSendMessage to use the animation effect
  const handleSendMessage = async () => {
    if (input.trim() === '' && !isRecording) return;
    
    // Save the current input and clear it
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    // Add user message
    const userMessageId = Date.now().toString();
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: currentInput
    };
    
    // Update messages state with user message
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      // Simulate API call or use your actual API call
      // For demonstration, I'm using a timeout
      setTimeout(() => {
        const botResponse = "Voici un poème pour toi.\n\nLes nuages dansent,\nComme des pensées vagabondes,\nDans le ciel de l'esprit.\n\nLe soleil se lève,\nIlluminant les recoins sombres,\nDe nos âmes errantes.\n\nLe temps s'écoule,\nComme une rivière silencieuse,\nVers l'océan de l'éternité.";
        
        // Add bot message
        const botMessageId = (Date.now() + 1).toString();
        const botMessage = {
          id: botMessageId,
          role: 'assistant',
          content: botResponse
        };
        
        // Update messages state with bot message
        setMessages(prevMessages => [...prevMessages, botMessage]);
        
        // Start the animation for the bot's response
        animatePoetResponse(botResponse);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
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
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="poet-response relative overflow-hidden">
                        {/* Regular content (visible but may be faded out during animation) */}
                        <div className={`transition-opacity duration-1000 ${animationLines.length > 0 ? 'opacity-0' : 'opacity-100'}`}>
                          {message.content.split('\n').map((line, index) => (
                            <div key={index} className="mb-1">
                              {line || '\u00A0'}
                            </div>
                          ))}
                        </div>
                        
                        {/* Animated lines */}
                        {animationLines.map((line, index) => (
                          <div 
                            key={`anim-${index}`} 
                            className="absolute top-0 left-0 w-full transition-transform duration-300 ease-in-out"
                            style={{ 
                              transform: `translateX(${line.position}%)`,
                              opacity: line.position > -90 && line.position < -10 ? 
                                      0.5 + Math.abs((line.position + 50) / 100) : 1
                            }}
                          >
                            {line.text || '\u00A0'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              {isLoading && (
                <div className="flex justify-center mb-2">
                  <div className="animate-bounce flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-200"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-400"></div>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  className={`p-2 rounded-full ${
                    isRecording
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <MicrophoneIcon className="w-5 h-5" />
                  ) : (
                    <MicrophoneIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || isRecording}
                />
                <button
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
}
