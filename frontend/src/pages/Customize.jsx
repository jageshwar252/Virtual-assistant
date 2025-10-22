import React from 'react'
import image1 from '../assets/image1.jpeg'
import image2 from '../assets/image2.jpg'
import image3 from '../assets/image3.jpeg'
import image4 from '../assets/image4.jpeg'
import image5 from '../assets/image5.webp'
import image6 from '../assets/image6.webp'
import image7 from '../assets/image7.avif'
import Cards from '../components/Cards'
import { RiFolderUploadFill } from "react-icons/ri";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useState } from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'


const Customize = () => {

    const {  ServerUrl,userData, setUserData,frontendImage, setFrontendImage ,backendImage, setBackendImage, selectedImage, setSelectedImage } = useContext(UserDataContext);

   
    const inputImage = useRef();
    const navigate = useNavigate();

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black to-blue-950 flex justify-center items-center flex-col'>
        <IoMdArrowRoundBack className='absolute top-5 left-5 text-white cursor-pointer' onClick={()=> navigate('/')}/>
        <h1 className='text-white text-[32px] font-semibold mb-[30px]'>Select Your <span className='text-blue-500'>Assistant Image</span></h1>
      <div className='w-full max-w-[60%] flex justify-center items-center flex-wrap gap-[15px]'>
        <Cards image={image1} />
        <Cards image={image2} />
        <Cards image={image3} />
        <Cards image={image4} />
        <Cards image={image5} />
        <Cards image={image6} />
        <Cards image={image7} />

      <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-navy-500 border-2 border-blue-900 rounded-2xl hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white overflow-hidden flex justify-center items-center ${selectedImage == "input" ? 'border-4 border-white shadow-2xl shadow-blue-950' : null}`} onClick={() => {
            inputImage.current.click()
            setSelectedImage("input")
         }}>
           
           {!frontendImage &&  <RiFolderUploadFill className='text-white text-[40px]' />}
           {frontendImage && <img src={frontendImage} alt="custom" className='w-full h-full object-cover' />}

         </div>

        
      </div>
      <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
      {selectedImage && <button className="mt-[30px] min-w-[150px] h-[60px] rounded-full bg-white text-black font-semibold text-[19px]" onClick={()=> navigate('/customize2')}>Select</button>}
    </div>
  )
}

export default Customize
