import React from 'react'
import { useState } from 'react'
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { useContext } from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';


const Customize2 = () => {

    const {userData, backendImage, selectedImage, ServerUrl, setUserData} = useContext(UserDataContext);
    const [assistantname, setassistantname] = useState(userData?.assistantName || '');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpdateAssistant = async () => {
        setLoading(true);
        try {
            let formData = new FormData();
            formData.append('assistantName', assistantname);
            if(backendImage){
                formData.append('assistantImage', backendImage);
            }else {
                formData.append('imageUrl', selectedImage);
            }
            

            const result = await axios.post(`${ServerUrl}/api/user/update`,formData, {withCredentials: true})

            setUserData(result.data);
            setLoading(false);
            navigate('/');

        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black to-blue-950 flex justify-center items-center flex-col relative'>
        <IoMdArrowRoundBack className='absolute top-5 left-5 text-white cursor-pointer' onClick={()=> navigate('/customize')}/>
        <h1 className='text-white text-[32px] font-semibold mb-[30px]'>Select Your <span className='text-blue-500'>Assistant Name</span></h1>

        <input type="text" placeholder="Assistant Name" className="w-full max-w-[400px] h-[60px] outline-none border-2 border-white bg-transparent text-white px-[20px] py-[10px] placeholder-grey-300 rounded-full text-[18px]" onChange={(e) => setassistantname(e.target.value)} value={assistantname}></input>

        {assistantname && <button className="mt-[30px] min-w-[150px] h-[60px] rounded-full bg-white text-black font-semibold text-[19px]" disabled={loading} onClick={handleUpdateAssistant}>{loading? 'Loading...' : 'Select'}</button>}
    </div>
  )
}

export default Customize2


