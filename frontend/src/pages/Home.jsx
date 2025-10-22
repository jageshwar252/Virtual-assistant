import React, { useEffect, useRef, useState } from 'react'
import { useContext } from 'react'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from '../assets/ai.gif'
import userImg from '../assets/user.gif'
import { LuMenu } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";

const Home = () => {

    const { userData, ServerUrl, setUserData, getGeminiResponse } = useContext(UserDataContext);
    const navigate = useNavigate();
    const [listening, setListening] = useState(false);
    const [userText, setUserText] = useState("");
    const [aiText, setAiText] = useState("");
    const [ham, setHam] = useState(false);
    const isSpeakingRef = useRef(false);
    const recognitionRef = useRef(null);
    const isRecognizingRef = useRef(false);
    const synth = window.speechSynthesis;

    const handleLogout = async() => {
        try {
            const result = await axios.get(`${ServerUrl}/api/user/logout`, { withCredentials: true });
            
            setUserData(null);
            navigate('/login');
        } catch (error) {
             setUserData(null);
            console.log(error);
        }
    }

    const startRecognition = () => {
      if(!isRecognizingRef.current && !isSpeakingRef.current){
        try {
         recognitionRef.current?.start();
        
        } catch (error) {
          if( error.name !== 'InvalidStateError'){
            console.log(error);
          }
        }
      }
      }

    const speak = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
     
      isSpeakingRef.current = true;
      utterance.onend = () => {
        setAiText("");
        isSpeakingRef.current = false;
        setTimeout(() => {
          startRecognition();
        }, 800);
      }
      synth.cancel();
      synth.speak(utterance);
    }

    const handleCommand = (data) => {
      const {type, userInput, response} = data;
      speak(response);

      if(type === 'google_search'){
        const query = encodeURIComponent(userInput);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
      }
       if(type === 'youtube_search'){
        const query = encodeURIComponent(userInput);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
      }
       if(type === 'wikipedia_search'){
        const query = encodeURIComponent(userInput);
        window.open(`https://en.wikipedia.org/wiki/${query}`, '_blank');
      }
      if(type === 'open_website'){
        let url = userInput;
        if(!url.startsWith('http')){
          url = 'https://' + url;
        }
        window.open(url, '_blank');
      }
      if(type === 'current_time'){
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        speak(`The current time is ${timeString}`);
      }
      if(type === 'current_date'){
        const now = new Date();
        const dateString = now.toLocaleDateString();
        speak(`Today's date is ${dateString}`);
      }
      if(type === 'weather_info'){
        // Assuming response contains weather info
        speak(response);
      }
      if(type === 'instagram_open'){
        const query = encodeURIComponent(userInput);
        window.open(`https://www.instagram.com/explore/tags/${query}`, '_blank');
      }
      if(type === 'facebook_open'){
        const query = encodeURIComponent(userInput);
        window.open(`https://www.facebook.com/search/top?q=${query}`, '_blank');
      }
      if(type === 'twitter_open'){
        const query = encodeURIComponent(userInput);
        window.open(`https://www.twitter.com/search?q=${query}`, '_blank');
      }
      if(type === 'linkedin_open'){
        const query = encodeURIComponent(userInput);
        window.open(`https://www.linkedin.com/search/results/all/?keywords=${query}`, '_blank');
      }
      if(type === 'github_open'){
        const query = encodeURIComponent(userInput);
        window.open(`https://www.github.com/search?q=${query}`, '_blank');
      }
    }

    useEffect(()=> {

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous=true;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognitionRef.current = recognition;

      let isMounted = true;

      const startTimeout = setTimeout(() => {
        if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
         try {
           recognition.start();
         } catch (error) {
           if( error.name !== 'InvalidStateError'){
             console.log(error);
           }
         }
        }
      }, 1000);
     

      recognition.onstart = () => {
        isRecognizingRef.current = true;
        setListening(true);
      }

      recognition.onend = () => {
        isRecognizingRef.current = false;
        setListening(false);
        if(isMounted && !isSpeakingRef.current){
          setTimeout(() => {
            if(isMounted){
              try {
                recognition.start();
              } catch (error) {
                if( error.name !== 'InvalidStateError'){
                  console.log(error);
                }
              }
            }
          }, 1000);
        }
      }

      recognition.onerror = (e) => {
        console.log("Error occurred in recognition: " + e.error);
        isRecognizingRef.current = false;
        setListening(false);
        if(e.error !== 'not-aborted' && isMounted && !isSpeakingRef.current){
          setTimeout(() => {
            if(isMounted){
              try {
                recognition.start();
              } catch (error) {
                if( error.name !== 'InvalidStateError'){
                  console.log(error);
                }
              }
            }
          }, 1000);
        }
      }

      recognition.onresult = async (e) => {
        const transcript = e.results[e.results.length - 1][0].transcript.trim();

        if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
          setUserText(transcript);
          setAiText("");
          recognition.stop();
          isRecognizingRef.current = false;
          setListening(false);
          const data = await getGeminiResponse(transcript);
          handleCommand(data);
          setAiText(data.response);
          setUserText("");
        }
      }

      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}. I am ${userData.assistantName}. How can I help you today?`);
      greeting.onend = () => {
        isSpeakingRef.current = false;
        setTimeout(() => {
          startRecognition();
        }, 800);
      }
      isSpeakingRef.current = true;
      synth.speak(greeting); 


      return () => {
        isMounted = false;
        clearTimeout(startTimeout);
        recognition.stop();
        setListening(false);
        isRecognizingRef.current = false;
      }

    } ,[])

  return (
   <div className='w-full h-[100vh] bg-gradient-to-t from-black to-blue-950 flex justify-center items-center flex-col overflow-hidden'>

    <LuMenu className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
    <div className={`absolute lg:hidden top-0 w-full h-full bg-grey backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"}`} style={{ transition: "all 0.3s ease-in-out" }}>
      <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />

       <button className=" min-w-[150px] h-[60px] rounded-full bg-white text-black font-semibold text-[19px]" onClick={handleLogout}>Logout</button>
      <button className=" min-w-[150px] h-[60px] p-2 rounded-full bg-white text-black font-semibold text-[19px]" onClick={() => navigate('/customize')}>Customize Your Assistant</button>

      <div className='w-full h-[2px] bg-grey-400 '></div>
      <h1 className='text-white font-semibold text-[20px]'>History</h1>

      <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
        {userData.history?.map ((item, index) => (
          <div key={index} className='w-full h-[30px] text-[18px] text-grey-100'>
            {item}
          </div>
        ))}
      </div>


    </div>

     <button className="mt-[30px] min-w-[150px] h-[60px] hidden lg:block rounded-full absolute top-[30px] right-[30px] bg-white text-black font-semibold text-[19px]" onClick={handleLogout}>Logout</button>
      <button className="mt-[30px] min-w-[150px] h-[60px] hidden lg:block absolute top-[100px] right-[20px] p-2 rounded-full bg-white text-black font-semibold text-[19px]" onClick={() => navigate('/customize')}>Customize Your Assistant</button>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
         <img src={userData?.assistantImage} alt="Assistant" className='w-full h-full object-cover' />
      </div>
        <h1 className='text-white text-[32px] font-semibold mt-[30px]'>Hello, I am <span className='text-blue-500'>{userData?.assistantName || 'Your Assistant'}</span></h1>
        {!aiText && <img src={userImg} alt="AI" className='w-[150px] h-[150px] mt-[20px]' />}
        {aiText && <img src={aiImg} alt="User" className='w-[150px] h-[150px] mt-[20px]' />}

        <h1 className='text-white text-[25px] font-semibold mt-[25px]'>{userText?userText:aiText?aiText:null}</h1>
    </div>
  )
}

export default Home
