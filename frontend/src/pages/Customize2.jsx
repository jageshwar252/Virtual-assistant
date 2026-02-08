import { useState, useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const Customize2 = () => {
  const { userData, backendImage, selectedImage, ServerUrl, setUserData } = useContext(UserDataContext);
  const [assistantname, setassistantname] = useState(userData?.assistantName || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    if (!assistantname.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('assistantName', assistantname.trim());

      if (backendImage) {
        formData.append('assistantImage', backendImage);
      } else {
        formData.append('imageUrl', selectedImage);
      }

      const result = await axios.post(`${ServerUrl}/api/user/update`, formData, { withCredentials: true });
      setUserData(result.data);
      navigate('/');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
      <button
        className="secondary-btn absolute left-4 top-4 z-20 flex items-center gap-2 px-4 py-2 text-sm sm:left-6 sm:top-6"
        onClick={() => navigate('/customize')}
      >
        <IoMdArrowRoundBack className="h-5 w-5" /> Back
      </button>

      <section className="glass-card relative z-10 w-full max-w-2xl rounded-3xl p-6 sm:p-10">
        <h1 className="heading-font text-center text-2xl font-semibold text-white sm:text-4xl">
          Choose Your <span className="heading-gradient">Assistant Name</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-300 sm:text-base">
          Pick a short memorable name you can call naturally in your voice interactions.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <input
            type="text"
            placeholder="Assistant Name"
            className="text-input"
            onChange={(e) => setassistantname(e.target.value)}
            value={assistantname}
            maxLength={40}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            className="primary-btn min-w-36"
            disabled={loading || !assistantname.trim()}
            onClick={handleUpdateAssistant}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Customize2;
