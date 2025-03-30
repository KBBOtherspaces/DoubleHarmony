const [input, setInput] = useState('');
const [isRecording, setIsRecording] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [scrollPercentage, setScrollPercentage] = useState(0);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const chunksRef = useRef<Blob[]>([]);
const messagesEndRef = useRef<HTMLDivElement>(null);
const chatContainerRef = useRef<HTMLDivElement>(null);

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

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Rest of your recording code
  } catch (error) {
    console.error('Error accessing microphone:', error);
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
    
    {/* DOUBLE HARMONY Title */}
    <div className="absolute top-4 left-0 right-0 text-center z-20">
      <h1 className="font-sans font-bold text-6xl md:text-8xl tracking-wide" 
          style={{
            color: 'transparent',
            WebkitTextStroke: '2px white',
            textShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
        DOUBLE HARMONY
      </h1>
    </div>

    <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10 mt-24">
      {/* Removed the white background and made chat container transparent */}
      <div className="backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 border border-white border-opacity-20">
        <div className="h-[700px] flex flex-col">
          {/* Removed the header with title since we now have the big title at the top */}
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
                      ? 'bg-blue-500 bg-opacity-70 backdrop-blur-sm text-white'
                      : 'bg-white bg-opacity-50 backdrop-blur-sm text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Modified input area with transparent background */}
          <div className="p-4 border-t border-white border-opacity-20 bg-transparent">
            {isLoading && (
              <div className="flex justify-center mb-2">
                <div className="animate-bounce flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full animation-delay-200"></div>
                  <div className="w-2 h-2 bg-white rounded-full animation-delay-400"></div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                className={`p-2 rounded-full ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-white bg-opacity-50 text-gray-600 hover:bg-opacity-70'
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
  </div>
);
