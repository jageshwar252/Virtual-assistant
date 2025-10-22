import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
export const UserDataContext = createContext();

const UserContext = ({ children }) => {

    const ServerUrl = "http://localhost:8000";
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
        const result = await axios.post(`${ServerUrl}/api/user/asktoassistant`, { command}, { withCredentials: true });
        return result.data;
      } catch (error) {
        console.log(error);
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
