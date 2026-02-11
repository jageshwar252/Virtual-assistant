import React, { useEffect, useRef, useState, useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from '../assets/ai.gif';
import userImg from '../assets/user.gif';
import { LuMenu } from 'react-icons/lu';
import { RxCross1 } from 'react-icons/rx';

const Home = () => {
  const { userData, ServerUrl, setUserData, getGeminiResponse } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [aiText, setAiText] = useState('');
  const [ham, setHam] = useState(false);
  const isSpeakingRef = useRef(false);
  const isActivatedRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const assistantVoiceRef = useRef(null);
  const [isActivated, setIsActivated] = useState(false);
  const synth = window.speechSynthesis;

  const pickAssistantVoice = () => {
    const voices = synth.getVoices();
    if (!voices?.length) return null;

    const preferredNames = ['Google UK English Female', 'Samantha', 'Karen', 'Moira', 'Ava', 'Aria', 'Jenny', 'Zira'];

    for (const name of preferredNames) {
      const exact = voices.find((v) => v.name === name);
      if (exact) return exact;
    }

    return (
      voices.find(
        (v) =>
          v.lang?.toLowerCase().startsWith('en') &&
          /(female|samantha|karen|moira|ava|aria|jenny|zira)/i.test(v.name)
      ) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
      voices[0]
    );
  };

  const configureUtterance = (utterance) => {
    if (!assistantVoiceRef.current) {
      assistantVoiceRef.current = pickAssistantVoice();
    }

    if (assistantVoiceRef.current) {
      utterance.voice = assistantVoiceRef.current;
    }

    utterance.rate = 0.9;
    utterance.pitch = 0.95;
    utterance.volume = 1;
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${ServerUrl}/api/user/logout`, { withCredentials: true });
      setUserData(null);
      navigate('/signin');
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    if (!isRecognizingRef.current && !isSpeakingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== 'InvalidStateError') {
          console.log(error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    configureUtterance(utterance);

    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText('');
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    if (!data) {
      speak('I did not get a response. Please try again.');
      return;
    }

    const { type, userInput, response, debug } = data;
    if (debug) {
      console.warn('Assistant debug:', debug);
    }
    if (response) {
      speak(response);
    }

    if (type === 'google_search') {
      const query = encodeURIComponent(userInput || '');
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }

    if (type === 'youtube_search' || type === 'youtube_play') {
      const query = encodeURIComponent(userInput || '');
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

    if (type === 'calculator_open') {
      window.open('https://www.google.com/search?q=calculator', '_blank');
    }

    if (type === 'instagram_open') {
      window.open('https://www.instagram.com', '_blank');
    }

    if (type === 'facebook_open') {
      window.open('https://www.facebook.com', '_blank');
    }
  };

  useEffect(() => {
    assistantVoiceRef.current = pickAssistantVoice();
    synth.onvoiceschanged = () => {
      assistantVoiceRef.current = pickAssistantVoice();
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiText('Speech recognition is not supported in this browser.');
      return () => {
        synth.onvoiceschanged = null;
      };
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && isActivatedRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
            } catch (error) {
              if (error.name !== 'InvalidStateError') {
                console.log(error);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (e) => {
      console.log('Error occurred in recognition: ' + e.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (e.error !== 'not-aborted' && isMounted && isActivatedRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
            } catch (error) {
              if (error.name !== 'InvalidStateError') {
                console.log(error);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setUserText(transcript);
        setAiText('');
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data?.response || 'I could not process that request.');
        setUserText('');
      }
    };

    const activateAssistant = () => {
      if (!isMounted || isActivatedRef.current) return;
      isActivatedRef.current = true;
      setIsActivated(true);
      window.removeEventListener('pointerdown', activateAssistant);
      window.removeEventListener('keydown', activateAssistant);

      const greeting = new SpeechSynthesisUtterance(
        `Hello ${userData.name}. I am ${userData.assistantName}. How can I help you today?`
      );
      configureUtterance(greeting);
      greeting.onend = () => {
        isSpeakingRef.current = false;
        setTimeout(() => {
          startRecognition();
        }, 800);
      };
      isSpeakingRef.current = true;
      synth.speak(greeting);
    };

    window.addEventListener('pointerdown', activateAssistant);
    window.addEventListener('keydown', activateAssistant);

    return () => {
      isMounted = false;
      window.removeEventListener('pointerdown', activateAssistant);
      window.removeEventListener('keydown', activateAssistant);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      synth.onvoiceschanged = null;
    };
  }, []);

  return (
    <div className="page-shell relative min-h-screen p-4 sm:p-6 lg:p-8">
      <button
        className="secondary-btn absolute right-4 top-4 z-20 lg:hidden"
        onClick={() => setHam(true)}
        aria-label="Open menu"
      >
        <LuMenu className="h-5 w-5" />
      </button>

      <div
        className={`fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          ham ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setHam(false)}
      />

      <aside
        className={`glass-card fixed right-0 top-0 z-40 flex h-full w-[82%] max-w-sm flex-col gap-5 rounded-l-3xl p-5 transition-transform duration-300 lg:hidden ${
          ham ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button className="self-end text-slate-100" onClick={() => setHam(false)} aria-label="Close menu">
          <RxCross1 className="h-5 w-5" />
        </button>

        <button className="primary-btn w-full" onClick={handleLogout}>
          Logout
        </button>
        <button className="secondary-btn w-full" onClick={() => navigate('/customize')}>
          Customize Assistant
        </button>

        <div className="h-px w-full bg-slate-700/80" />

        <div className="flex min-h-0 flex-1 flex-col">
          <h2 className="heading-font text-lg font-semibold text-white">History</h2>
          <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
            {userData.history?.length ? (
              userData.history.map((item, index) => (
                <p key={index} className="rounded-xl bg-slate-800/65 px-3 py-2 text-sm text-slate-200">
                  {item}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-400">No history yet.</p>
            )}
          </div>
        </div>
      </aside>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.45fr_0.95fr]">
        <section className="glass-card rounded-3xl p-5 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Voice assistant is</p>
              <p className={`heading-font text-lg font-semibold ${listening ? 'text-cyan-300' : 'text-slate-100'}`}>
                {listening ? 'Listening now' : 'Standing by'}
              </p>
            </div>
            <span className="rounded-full border border-slate-400/30 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-200">
              {userData?.name || 'User'}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-[220px] w-[170px] overflow-hidden rounded-[2rem] border border-slate-300/20 bg-slate-900 shadow-[0_22px_70px_rgba(3,6,20,0.55)] sm:h-[320px] sm:w-[230px]">
              <img src={userData?.assistantImage} alt="Assistant" className="h-full w-full object-cover" />
            </div>

            <h1 className="heading-font mt-6 text-2xl font-semibold text-white sm:text-4xl">
              Hello, I am <span className="heading-gradient">{userData?.assistantName || 'Your Assistant'}</span>
            </h1>

            <div className="mt-5 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/60 ring-1 ring-slate-300/20 sm:h-28 sm:w-28">
              <img
                src={aiText ? aiImg : userImg}
                alt={aiText ? 'assistant speaking' : 'user waiting'}
                className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
              />
            </div>

            <p className="mt-5 min-h-12 max-w-2xl text-sm text-slate-200 sm:text-lg">
              {userText || aiText || (isActivated ? 'Call your assistant name to start speaking.' : 'Click or press any key once to activate the assistant.')}
            </p>
          </div>
        </section>

        <aside className="glass-card hidden rounded-3xl p-5 lg:flex lg:h-[calc(100vh-4rem)] lg:min-h-0 lg:flex-col">
          <button className="primary-btn w-full" onClick={handleLogout}>
            Logout
          </button>
          <button className="secondary-btn mt-3 w-full" onClick={() => navigate('/customize')}>
            Customize Assistant
          </button>

          <div className="my-5 h-px w-full bg-slate-700/80" />

          <h2 className="heading-font text-xl font-semibold text-white">History</h2>
          <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {userData.history?.length ? (
              userData.history.map((item, index) => (
                <p key={index} className="rounded-xl bg-slate-800/65 px-3 py-2 text-sm text-slate-200">
                  {item}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-400">No history yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
