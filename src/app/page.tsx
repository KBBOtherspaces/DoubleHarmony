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
 @@ -33,6 +35,51 @@ export default function Home() {
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
 @@ -178,16 +225,58 @@ export default function Home() {
   };
 
   return (
     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
       <div className="container mx-auto max-w-4xl px-4 py-8">
         <div className="bg-white rounded-xl shadow-xl overflow-hidden">
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
 
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
             <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={chatContainerRef}>
               {messages.slice(1).map((message) => (
                 <div
                   key={message.id}
 @@ -294,4 +383,4 @@ export default function Home() {
       </div>
     </div>
   );
 }
 }
