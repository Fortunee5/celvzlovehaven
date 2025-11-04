import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const [carousel, setCarousel] = useState([]);
  const [current, setCurrent] = useState(0);
  const [heroImage, setHeroImage] = useState('');
  const [churches, setChurches] = useState([]);
  const [pastors, setPastors] = useState([]);
  const [sermon, setSermon] = useState({});
  const [whatsapp, setWhatsapp] = useState('');
  const [wordpins1, setWordpins1] = useState([]);
  const [wordpins2, setWordpins2] = useState([]);
  const [currentWP1, setCurrentWP1] = useState(0);
  const [currentWP2, setCurrentWP2] = useState(0);
  const [spotify, setSpotify] = useState('');
  const [testimonies, setTestimonies] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (carousel.length > 0) setCurrent(prev => (prev + 1) % carousel.length);
    }, 4000);
    const wp1Int = setInterval(() => {
      if (wordpins1.length > 0) setCurrentWP1(prev => (prev + 1) % wordpins1.length);
    }, 2000);
    const wp2Int = setInterval(() => {
      if (wordpins2.length > 0) setCurrentWP2(prev => (prev + 1) % wordpins2.length);
    }, 2500);
    return () => { clearInterval(interval); clearInterval(wp1Int); clearInterval(wp2Int); };
  }, [carousel.length, wordpins1.length, wordpins2.length]);

  const fetchData = async () => {
    try {
      const carouselSnap = await getDocs(collection(db, 'carousel'));
      setCarousel(carouselSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));

      const heroSnap = await getDocs(collection(db, 'hero'));
      if (!heroSnap.empty) setHeroImage(heroSnap.docs[0].data().image);

      const churchSnap = await getDocs(collection(db, 'churches'));
      setChurches(churchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));

      const pastorSnap = await getDocs(collection(db, 'pastors'));
      setPastors(pastorSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));

      const sermonSnap = await getDocs(collection(db, 'sermon'));
      if (!sermonSnap.empty) setSermon(sermonSnap.docs[0].data());

      const whatsappSnap = await getDocs(collection(db, 'whatsapp'));
      if (!whatsappSnap.empty) setWhatsapp(whatsappSnap.docs[0].data().number);

      const wp1Snap = await getDocs(collection(db, 'wordpins1'));
      setWordpins1(wp1Snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const wp2Snap = await getDocs(collection(db, 'wordpins2'));
      setWordpins2(wp2Snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const spotifySnap = await getDocs(collection(db, 'spotify'));
      if (!spotifySnap.empty) setSpotify(spotifySnap.docs[0].data().link);

      const testimonySnap = await getDocs(collection(db, 'testimonies'));
      setTestimonies(testimonySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsapp}?text=Hello! I'd like to connect with CELVZ`, '_blank');
  };

  return (
    <div className="pt-24">
      {/* Carousel */}
      <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-16 mx-4 max-w-7xl lg:mx-auto">
        {carousel.map((item, idx) => (
          <div key={item.id} className={`absolute w-full h-full transition-opacity duration-1000 ${idx === current ? 'opacity-100' : 'opacity-0'}`}>
            <img src={item.url} alt={item.text} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/1200x500/14b8a6/ffffff?text=CELVZ'} />
            {item.text && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <h2 className="text-white text-4xl md:text-6xl font-black text-center px-4 animate-bounce-in bg-gradient-to-r from-teal-400 via-yellow-300 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                  {item.text}
                </h2>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hey You're Home */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 animate-bounce-in bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 bg-clip-text text-transparent" style={{fontFamily: 'Impact, sans-serif'}}>
              Hey, You're Home
            </h2>
            <p className="text-xl text-gray-700 mb-4 leading-relaxed">
              CELVZ Youth Church is where the littest youths for Jesus are being raised. The place where you discover your purpose, passion, and power to live out the God-life.
            </p>
            <p className="text-lg text-teal-600 font-semibold">
              Watch Service | Stay Connected
            </p>
          </div>
          <div>
            {heroImage && <img src={heroImage} alt="CELVZ Youth" className="rounded-3xl shadow-2xl w-full h-96 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/600x400/14b8a6/ffffff?text=CELVZ+Youth'} />}
          </div>
        </div>
      </div>

      {/* Our Churches */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent" style={{fontFamily: 'Impact, sans-serif'}}>
          Our Churches
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {churches.map((church, idx) => (
            <div key={church.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform">
              <img src={church.image} alt={church.name} className="w-full h-56 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/14b8a6/ffffff?text=Church'} />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{church.name || 'Love Haven'}</h3>
                <p className="text-gray-600">{church.location || 'Oregun, Ikeja, Lagos, Nigeria.'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Pastors */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{fontFamily: 'Impact, sans-serif'}}>
          Our Pastors
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {pastors.map((pastor, idx) => (
            <div key={pastor.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform">
              <img src={pastor.image} alt={pastor.name} className="w-full h-56 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Pastor'} />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{pastor.title || 'Group Pastor'}</h3>
                <p className="text-gray-600">{pastor.name || 'Esteemed Pastor Favour Ajunnu'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sermon Section */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {sermon.image && <img src={sermon.image} alt="Sermon" className="w-full h-64 object-cover" />}
          </div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {sermon.video && <video controls className="w-full h-64 bg-black"><source src={sermon.video} type="video/mp4" /></video>}
          </div>
        </div>
      </div>

      {/* Have we Met Yet */}
      <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
        <h2 className="text-5xl font-black mb-4 text-gray-800">Have we Met Yet?</h2>
        <button onClick={openWhatsApp} className="text-3xl font-bold text-teal-600 hover:text-teal-700 hover:scale-110 transition-transform">
          Let's Chat 💬
        </button>
      </div>

      {/* WORDPINS */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-6xl font-black text-center mb-12 bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 bg-clip-text text-transparent" style={{fontFamily: 'Impact, sans-serif'}}>
          WORDPINS
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            {wordpins1.map((img, idx) => (
              <img key={img.id} src={img.url} alt="Wordpin" className={`absolute w-full h-full object-cover transition-opacity duration-700 ${idx === currentWP1 ? 'opacity-100' : 'opacity-0'}`} onError={(e) => e.target.src = 'https://via.placeholder.com/600x400/14b8a6/ffffff?text=WordPin'} />
            ))}
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            {wordpins2.map((img, idx) => (
              <img key={img.id} src={img.url} alt="Wordpin" className={`absolute w-full h-full object-cover transition-opacity duration-700 ${idx === currentWP2 ? 'opacity-100' : 'opacity-0'}`} onError={(e) => e.target.src = 'https://via.placeholder.com/600x400/14b8a6/ffffff?text=WordPin'} />
            ))}
          </div>
        </div>
      </div>

      {/* Streamify */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-5xl font-black text-center mb-8 text-teal-600" style={{fontFamily: 'Impact, sans-serif'}}>
          Streamify
        </h2>
        {spotify && (
          <iframe src={spotify.replace('spotify.com', 'spotify.com/embed')} width="100%" height="352" frameBorder="0" allow="encrypted-media" className="rounded-2xl shadow-xl"></iframe>
        )}
      </div>

      {/* Featured Testimony */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-4xl font-black text-center mb-12 text-gray-800">
          Featured Testimony: Proof of God's Faithfulness
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonies.map((testimony, idx) => (
            <div key={testimony.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <img src={testimony.image} alt={testimony.name} className="w-full h-48 object-cover" onError={(e) => e.target.src = 'https://i.pravatar.cc/400?img=' + (idx + 1)} />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{testimony.name}</h3>
                <p className="text-gray-600 text-sm">{testimony.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;