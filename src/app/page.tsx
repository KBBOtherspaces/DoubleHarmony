const [input, setInput] = useState('');
const [isRecording, setIsRecording] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [scrollPercentage, setScrollPercentage] = useState(0);
const messagesEndRef = useRef(null);
const chatContainerRef = useRef(null);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
  scrollToBottom();
}, [messages]);

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
        DOUBLEHARMONY
      </h1>
    </div>

    <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10 mt-24">
      {/* Chat messages blend into background */}
      <div className="h-[700px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={chatContainerRef}>
          {messages.slice(1).map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg transition-opacity duration-700 ${
                  message.role === 'user'
                    ? 'bg-blue-500 bg-opacity-70 text-white'
                    : `bg-white bg-opacity-${isLoading ? '10' : '50'} text-gray-800`
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
);
