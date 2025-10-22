import { useContext, useState } from "react";
import bg from "../assets/virtual-assistant-circle-background-purple-gradient-disruptive-technology_53876-124676.avif";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

const SignUP = () => {

  const [showPassword, setShowPassword] = useState(false);
  const { ServerUrl,userData, setUserData } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async(e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try{
      let result = await axios.post(`${ServerUrl}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      )
      setUserData(result.data);
      setLoading(false);
      navigate('/customize');

    }catch (error){
      console.log(error);
      setUserData(null);
      setErr(error.response.data.message);
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className="w-full h-[100vh] bg-cover flex justify-center items-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <form className="w-[90%] h-[600px] max-w-[500px] bg-blue backdrop-blur shadow-lg shadow-black flex flex-col justify-center items-center gap-[20px] px-[20px]" onSubmit={handleSignup}> 
          <h1 className="text-white text-[32px] font-semibold mb-[30px]">Register to <span className="text-blue-500">Virtual Assistant</span></h1>
          <input type="text" placeholder="Enter your name" className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white px-[20px] py-[10px] placeholder-grey-300 rounded-full text-[18px]" onChange={(e)=>setName(e.target.value)} value={name}></input>
          <input type="email" placeholder="Email" className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white px-[20px] py-[10px] placeholder-grey-300 rounded-full text-[18px]" onChange={(e)=>setEmail(e.target.value)} value={email}></input>

          <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
            <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full h-full outline-none bg-transparent px-[20px] py-[10px] placeholder-grey-300 rounded-full" onChange={(e)=>setPassword(e.target.value)} value={password}></input>
            {!showPassword ? <IoEyeOutline className="cursor-pointer absolute top-[18px] right-[20px] text-white w-[23px] h-[23px]" onClick={()=> {setShowPassword(true)}}/> : <IoEyeOffOutline className="cursor-pointer absolute top-[18px] right-[20px] text-white w-[23px] h-[23px]" onClick={()=> {setShowPassword(false)}}/>}
          </div>

          {err.length > 0 && <p className="text-red-500"> *{err} </p>}
          <button className="mt-[30px] min-w-[150px] h-[60px] rounded-full bg-white text-black font-semibold text-[19px]" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</button>

          <p className="text-white text-[18px]">Already have an account ? <span className="text-blue-500 cursor-pointer" onClick={()=> navigate("/signin")}>Sign In</span></p>
        </form>
      </div>
    </>
  );
};

export default SignUP;
