import React from 'react'
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';

const Cards = ({ image }) => {

    const {  ServerUrl,userData, setUserData,frontendImage, setFrontendImage ,backendImage, setBackendImage, selectedImage, setSelectedImage } = useContext(UserDataContext);

  return (
    <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-navy-100 border-2 border-blue-900 rounded-2xl hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white overflow-hidden ${selectedImage === image ? 'border-4 border-white shadow-2xl shadow-blue-950' : null}`} onClick={() => {setSelectedImage(image)
        setFrontendImage(null)
        setBackendImage(null)
    }}>
      <img src={image} alt="card" className='w-full h-full object-cover' />
    </div>
  )
}

export default Cards