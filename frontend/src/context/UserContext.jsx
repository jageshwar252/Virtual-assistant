import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
export const UserDataContext = createContext();

const UserContext = ({ children }) => {

    const ServerUrl =
      import.meta.env.VITE_SERVER_URL ||
      (import.meta.env.DEV ? "https://virtual-assistant-9s8u.onrender.com" : "https://virtual-assistant-9s8u.onrender.com");
    const [userData, setUserData] = useState(null);
     const [frontendImage, setFrontendImage] = useState(null);
        const [backendImage, setBackendImage] = useState(null);
        const [selectedImage, setSelectedImage] = useState(null);

    const handleCurrentUser = async() => {
        try {
            const result = await axios.get(`${ServerUrl}/api/user/current`,
                { withCredentials: true}
            )
            setUserData(result.data);
            console.log(result.data);
        } catch (error) {
            console.log(error);
        }
    }

    const getGeminiResponse = async ( command ) => {
      try {
        const result = await axios.post(
          `${ServerUrl}/api/user/asktoassistant`,
          { command },
          { withCredentials: true, timeout: 20000 }
        );
        return result.data;
      } catch (error) {
        console.log(error);
        return {
          type: "general",
          userInput: command,
          response: error.response?.data?.response || "I could not process that right now. Please try again.",
          debug: error.response?.data?.debug || error.message
        };
      }
    }

    useEffect(()=>{
        handleCurrentUser();
    },[])


    const value = {
        ServerUrl,userData, setUserData,frontendImage, setFrontendImage ,backendImage, setBackendImage, selectedImage, setSelectedImage, getGeminiResponse
    }


  return (
    <div>
      <UserDataContext.Provider value={value}>
        {children}
      </UserDataContext.Provider>
    </div>
  )
}

export default UserContext
