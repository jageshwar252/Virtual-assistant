import { useContext, useState } from "react";
import bg from "../assets/virtual-assistant-circle-background-purple-gradient-disruptive-technology_53876-124676.avif";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";

const SignIN = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { ServerUrl, setUserData } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const result = await axios.post(
        `${ServerUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true, timeout: 15000 }
      );
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      console.log(error);
      setUserData(null);
      if (!error.response) {
        setErr("Cannot reach backend at http://localhost:8000. Start backend server first.");
      } else {
        setErr(error.response?.data?.message || "Unable to sign in right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center p-4 sm:p-8">
      <div className="glass-card relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl lg:grid-cols-[1.1fr_1fr]">
        <aside
          className="hidden min-h-full bg-cover bg-center p-8 lg:flex lg:flex-col lg:justify-between"
          style={{ backgroundImage: `linear-gradient(140deg, rgba(2,6,23,0.8), rgba(8,17,40,0.6)), url(${bg})` }}
        >
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">Virtual Assistant</p>
            <h2 className="heading-font mt-3 text-4xl font-semibold leading-tight text-white">
              Speak naturally.
              <br />
              Work faster.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-slate-200/85">
            Sign in to continue with your personalized voice assistant and saved conversation history.
          </p>
        </aside>

        <form className="flex flex-col gap-5 px-5 py-8 sm:px-8 sm:py-10" onSubmit={handleSignin}>
          <div>
            <p className="text-sm text-slate-300">Welcome back</p>
            <h1 className="heading-font mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Sign in to <span className="heading-gradient">Virtual Assistant</span>
            </h1>
          </div>

          <input
            type="email"
            placeholder="Email"
            className="text-input"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="text-input pr-12"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <IoEyeOffOutline className="h-5 w-5" /> : <IoEyeOutline className="h-5 w-5" />}
            </button>
          </div>

          {err.length > 0 && <p className="text-sm text-red-400">* {err}</p>}

          <button className="primary-btn mt-1 w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-slate-300 sm:text-base">
            New here?{" "}
            <button type="button" className="font-semibold text-cyan-300" onClick={() => navigate("/signup")}>
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIN;
