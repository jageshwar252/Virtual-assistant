import image1 from '../assets/image1.jpeg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpeg';
import image4 from '../assets/image4.jpeg';
import image5 from '../assets/image5.webp';
import image6 from '../assets/image6.webp';
import image7 from '../assets/image7.avif';
import Cards from '../components/Cards';
import { RiFolderUploadFill } from 'react-icons/ri';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useRef, useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Customize = () => {
  const {
    setFrontendImage,
    setBackendImage,
    frontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(UserDataContext);

  const inputImage = useRef();
  const navigate = useNavigate();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  return (
    <div className="page-shell relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
      <button
        className="secondary-btn absolute left-4 top-4 z-20 flex items-center gap-2 px-4 py-2 text-sm sm:left-6 sm:top-6"
        onClick={() => navigate('/')}
      >
        <IoMdArrowRoundBack className="h-5 w-5" /> Back
      </button>

      <section className="glass-card relative z-10 w-full max-w-5xl rounded-3xl p-5 sm:p-8">
        <h1 className="heading-font text-center text-2xl font-semibold text-white sm:text-4xl">
          Select Your <span className="heading-gradient">Assistant Image</span>
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-300 sm:text-base">
          Pick one of the curated options or upload your own image. The selected image will be used across your assistant profile.
        </p>

        <div className="mt-7 grid grid-cols-4 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-8">
          <Cards image={image1} />
          <Cards image={image2} />
          <Cards image={image3} />
          <Cards image={image4} />
          <Cards image={image5} />
          <Cards image={image6} />
          <Cards image={image7} />

          <button
            type="button"
            className={`group relative aspect-[2/3] w-[78px] overflow-hidden rounded-2xl border transition-all duration-200 sm:w-[110px] md:w-[128px] ${
              selectedImage === 'input'
                ? 'border-cyan-300 shadow-[0_12px_40px_rgba(34,211,238,0.35)]'
                : 'border-slate-400/30 hover:border-cyan-300/70'
            }`}
            onClick={() => {
              inputImage.current.click();
              setSelectedImage('input');
            }}
          >
            {!frontendImage ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900/70">
                <RiFolderUploadFill className="h-8 w-8 text-cyan-300" />
                <span className="text-xs font-semibold text-slate-300">Upload</span>
              </div>
            ) : (
              <img src={frontendImage} alt="custom" className="h-full w-full object-cover" />
            )}
          </button>
        </div>

        <input type="file" accept="image/*" ref={inputImage} hidden onChange={handleImage} />

        <div className="mt-8 flex justify-center">
          <button
            className="primary-btn min-w-36"
            onClick={() => navigate('/customize2')}
            disabled={!selectedImage}
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
};

export default Customize;
