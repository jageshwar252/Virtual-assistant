import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';

const Cards = ({ image }) => {
  const {
    setFrontendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(UserDataContext);

  const active = selectedImage === image;

  return (
    <button
      type="button"
      className={`group relative aspect-[2/3] w-[78px] overflow-hidden rounded-2xl border transition-all duration-200 sm:w-[110px] md:w-[128px] ${
        active
          ? 'border-cyan-300 shadow-[0_12px_40px_rgba(34,211,238,0.35)]'
          : 'border-slate-400/30 hover:border-cyan-300/70'
      }`}
      onClick={() => {
        setSelectedImage(image);
        setFrontendImage(null);
        setBackendImage(null);
      }}
    >
      <img src={image} alt="assistant option" className="h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-55 group-hover:opacity-35" />
    </button>
  );
};

export default Cards;
