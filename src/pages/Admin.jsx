import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { uploadFile, deleteFile, testServerConnection } from '../api/uploadAPI';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState('carousel');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  // Carousel state
  const [carouselItems, setCarouselItems] = useState([
    { file: null, text: '' },
    { file: null, text: '' },
    { file: null, text: '' },
    { file: null, text: '' }
  ]);
  const [existingCarousel, setExistingCarousel] = useState([]);

  // Hero Image state
  const [heroImage, setHeroImage] = useState(null);
  const [existingHero, setExistingHero] = useState([]);

  // Churches state
  const [churches, setChurches] = useState([
    { file: null, name: '', location: '' },
    { file: null, name: '', location: '' },
    { file: null, name: '', location: '' }
  ]);
  const [existingChurches, setExistingChurches] = useState([]);

  // Pastors state
  const [pastors, setPastors] = useState([
    { file: null, title: '', name: '' },
    { file: null, title: '', name: '' },
    { file: null, title: '', name: '' }
  ]);
  const [existingPastors, setExistingPastors] = useState([]);

  // Sermon state
  const [sermonImg, setSermonImg] = useState(null);
  const [sermonVid, setSermonVid] = useState(null);
  const [existingSermon, setExistingSermon] = useState([]);

  // WhatsApp state
  const [whatsapp, setWhatsapp] = useState('');
  const [existingWhatsapp, setExistingWhatsapp] = useState([]);

  // Wordpins state
  const [wordpins1, setWordpins1] = useState([null, null, null]);
  const [wordpins2, setWordpins2] = useState([null, null, null]);
  const [existingWP1, setExistingWP1] = useState([]);
  const [existingWP2, setExistingWP2] = useState([]);

  // Spotify state
  const [spotify, setSpotify] = useState('');
  const [existingSpotify, setExistingSpotify] = useState([]);

  // Testimonies state
  const [testimonies, setTestimonies] = useState([
    { file: null, name: '', description: '' },
    { file: null, name: '', description: '' },
    { file: null, name: '', description: '' }
  ]);
  const [existingTestimonies, setExistingTestimonies] = useState([]);

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loggedIn) fetchData();
  }, [loggedIn, tab]);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      setServerStatus(data.success ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const fetchData = async () => {
    try {
      if (tab === 'carousel') {
        const snap = await getDocs(collection(db, 'carousel'));
        setExistingCarousel(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      } else if (tab === 'hero') {
        const snap = await getDocs(collection(db, 'hero'));
        setExistingHero(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (tab === 'churches') {
        const snap = await getDocs(collection(db, 'churches'));
        setExistingChurches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else if (tab === 'pastors') {
        const snap = await getDocs(collection(db, 'pastors'));
        setExistingPastors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else if (tab === 'sermon') {
        const snap = await getDocs(collection(db, 'sermon'));
        setExistingSermon(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (tab === 'whatsapp') {
        const snap = await getDocs(collection(db, 'whatsapp'));
        setExistingWhatsapp(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (tab === 'wordpins') {
        const wp1Snap = await getDocs(collection(db, 'wordpins1'));
        setExistingWP1(wp1Snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const wp2Snap = await getDocs(collection(db, 'wordpins2'));
        setExistingWP2(wp2Snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (tab === 'spotify') {
        const snap = await getDocs(collection(db, 'spotify'));
        setExistingSpotify(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (tab === 'testimonies') {
        const snap = await getDocs(collection(db, 'testimonies'));
        setExistingTestimonies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setLoggedIn(true);
      alert('✅ Login successful!');
    } else {
      alert('❌ Wrong password');
    }
  };

  // Upload Carousel
  const uploadCarousel = async () => {
    const itemsToUpload = carouselItems.filter(item => item.file !== null);
    if (itemsToUpload.length === 0) return alert('Select at least one image');
    if (serverStatus !== 'online') return alert('Server is offline!');

    setLoading(true);
    try {
      for (let i = 0; i < itemsToUpload.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${itemsToUpload.length}...`);
        const url = await uploadFile(itemsToUpload[i].file, 'carousel');
        await addDoc(collection(db, 'carousel'), { url, text: itemsToUpload[i].text, timestamp: Date.now() });
      }
      alert('✅ Carousel uploaded!');
      setCarouselItems([{ file: null, text: '' }, { file: null, text: '' }, { file: null, text: '' }, { file: null, text: '' }]);
      fetchData();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setLoading(false);
    setUploadProgress('');
  };

  const deleteCarouselItem = async (item) => {
    if (!window.confirm('Delete this item?')) return;
    setLoading(true);
    try {
      await deleteFile(item.url);
      await deleteDoc(doc(db, 'carousel', item.id));
      alert('✅ Deleted!');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  // Upload Hero Image
  const uploadHeroImage = async () => {
    if (!heroImage) return alert('Select an image');
    if (serverStatus !== 'online') return alert('Server is offline!');

    setLoading(true);
    try {
      setUploadProgress('Uploading hero image...');
      
      // Delete old hero images
      for (const item of existingHero) {
        await deleteFile(item.image);
        await deleteDoc(doc(db, 'hero', item.id));
      }

      const url = await uploadFile(heroImage, 'hero');
      await addDoc(collection(db, 'hero'), { image: url, timestamp: Date.now() });
      alert('✅ Hero image uploaded!');
      setHeroImage(null);
      fetchData();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setLoading(false);
    setUploadProgress('');
  };

  // Upload Churches
  const uploadChurches = async () => {
    const validChurches = churches.filter(c => c.file && c.name && c.location);
    if (validChurches.length === 0) return alert('Fill at least one church');
    if (serverStatus !== 'online') return alert('Server is offline!');

    setLoading(true);
    try {
      // Delete existing
      for (const church of existingChurches) {
        await deleteFile(church.image);
        await deleteDoc(doc(db, 'churches', church.id));
      }

      for (let i = 0; i < validChurches.length; i++) {
        setUploadProgress(`Uploading church ${i + 1}/${validChurches.length}...`);
        const url = await uploadFile(validChurches[i].file, 'churches');
        await addDoc(collection(db, 'churches'), {
          image: url,
          name: validChurches[i].name,
          location: validChurches[i].location,
          order: i,
          timestamp: Date.now()
        });
      }
      alert('✅ Churches uploaded!');
      setChurches([{ file: null, name: '', location: '' }, { file: null, name: '', location: '' }, { file: null, name: '', location: '' }]);
      fetchData();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setLoading(false);
    setUploadProgress('');
  };

  // Upload Pastors
  const uploadPastors = async () => {
    const validPastors = pastors.filter(p => p.file && p.title && p.name);
    if (validPastors.length === 0) return alert('Fill at least one pastor');
    if (serverStatus !== 'online') return alert('Server is offline!');

    setLoading(true);
    try {
      // Delete existing
      for (const pastor of existingPastors) {
        await deleteFile(pastor.image);
        await deleteDoc(doc(db, 'pastors', pastor.id));
      }

      for (let i = 0; i < validPastors.length; i++) {
        setUploadProgress(`Uploading pastor ${i + 1}/${validPastors.length}...`);
        const url = await uploadFile(validPastors[i].file, 'pastors');
        await addDoc(collection(db, 'pastors'), {
          image: url,
          title: validPastors[i].title,
          name: validPastors[i].name,
          order: i,
          timestamp: Date.now()
        });
      }
      alert('✅ Pastors uploaded!');
      setPastors([{ file: null, title: '', name: '' }, { file: null, title: '', name: '' }, { file: null, title: '', name: '' }]);
      fetchData();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setLoading(false);
    setUploadProgress('');
  };

  // Upload Sermon
  const uploadSermon = async () => {
    if (!sermonImg && !sermonVid) return alert('Select at least image or video');
    if (serverStatus !== 'online') return alert('Server is offline!');

    setLoading(true);
    try {
      let imgUrl = '', vidUrl = '';
      if (sermonImg) {
        setUploadProgress('Uploading sermon image...');
        imgUrl = await uploadFile(sermonImg, 'sermon');
      }
      if (sermonVid) {
        setUploadProgress('Uploading sermon video...');
        vidUrl = await uploadFile(sermonVid, 'sermon');
      }

      // Delete existing
      for (const sermon of existingSermon) {
        if (sermon.image) await deleteFile(sermon.image);
        if (sermon.video) await deleteFile(sermon.video);
        await deleteDoc(doc(db, 'sermon', sermon.id));
      }

      await addDoc(collection(db, 'sermon'), { image: imgUrl, video: vidUrl, timestamp: Date.now() });
      alert('✅ Sermon uploaded!');
      setSermonImg(null);
      setSermonVid(null);
      fetchData();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setLoading(false);
    setUploadProgress('');
  };

  // Upload WhatsApp
  const uploadWhatsApp = async () => {
    if (!whatsapp.trim()) return alert('Enter WhatsApp number');

    setLoading(true);
    try {
      // Delete existing
      for (const item of existingWhatsapp) {
        await deleteDoc(doc(db, 'whatsapp', item.id));
      }

      await addDoc(collection(db, 'whatsapp'), { number: whatsapp, timestamp: Date.now() });
      alert('✅ WhatsApp number saved!');
      setWhatsapp('');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  // Upload Wordpins
  const uploadWordpins = async () => {
    const valid1 = wordpins1.filter(f => f !== null);
    const valid2 = wordpins2.filter(f => f !== null);
    if (valid1.length === 0 && valid2.length === 0) return alert('Select at least one image');
    if (serverStatus !== 'online') return alert('Server is offline!');

    setLoading(true);
    try {
      // Upload Wordpins 1
      if (valid1.length > 0) {
        for (const item of existingWP1) {
          await deleteFile(item.url);
          await deleteDoc(doc(db, 'wordpins1', item.id));
        }
        for (let i = 0; i < valid1.length; i++) {
          setUploadProgress(`Uploading wordpins1 ${i + 1}/${valid1.length}...`);
          const url = await uploadFile(valid1[i], 'wordpins');
          await addDoc(collection(db, 'wordpins1'), { url, timestamp: Date.now() });
        }
      }

      // Upload Wordpins 2
      if (valid2.length > 0) {
        for (const item of existingWP2) {
          await deleteFile(item.url);
          await deleteDoc(doc(db, 'wordpins2', item.id));
        }
        for (let i = 0; i < valid2.length; i++) {
          setUploadProgress(`Uploading wordpins2 ${i + 1}/${valid2.length}...`);
          const url = await uploadFile(valid2[i], 'wordpins');
          await addDoc(collection(db, 'wordpins2'), { url, timestamp: Date.now() });
        }
      }

      alert('✅ Wordpins uploaded!');
      setWordpins1([null, null, null]);
      setWordpins2([null, null, null]);
      fetchData();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setLoading(false);
    setUploadProgress('');
  };

  // Upload Spotify
  const uploadSpotify = async () => {
    if (!spotify.trim()) return alert('Enter Spotify link');

    setLoading(true);
    try {
      for (const item of existingSpotify) {
        await deleteDoc(doc(db, 'spotify', item.id));
      }

      await addDoc(collection(db, 'spotify'), { link: spotify, timestamp: Date.now() });
      alert('✅ Spotify link saved!');
      setSpotify('');
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  // Upload Testimonies
  const uploadTestimonies = async () => {
    const validTestimonies = testimonies.filter(t => t.file && t.name && t.description);
    if (validTestimonies.length === 0) return alert('Fill at least one testimony');
    if (serverStatus !== 'online') return alert('Server is offline!');

    setLoading(true);
    try {
      // Delete existing
      for (const testimony of existingTestimonies) {
        await deleteFile(testimony.image);
        await deleteDoc(doc(db, 'testimonies', testimony.id));
      }

      for (let i = 0; i < validTestimonies.length; i++) {
        setUploadProgress(`Uploading testimony ${i + 1}/${validTestimonies.length}...`);
        const url = await uploadFile(validTestimonies[i].file, 'testimonies');
        await addDoc(collection(db, 'testimonies'), {
          image: url,
          name: validTestimonies[i].name,
          description: validTestimonies[i].description,
          order: i,
          timestamp: Date.now()
        });
      }
      alert('✅ Testimonies uploaded!');
      setTestimonies([{ file: null, name: '', description: '' }, { file: null, name: '', description: '' }, { file: null, name: '', description: '' }]);
      fetchData();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setLoading(false);
    setUploadProgress('');
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-black text-teal-600 mb-6 text-center">CELVZ Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Enter Password" required autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition font-semibold">
              Login
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">Password: admin123</p>
        </div>
      </div>
    );
  }

  const tabs = [
    'carousel', 'hero', 'churches', 'pastors', 'sermon', 
    'whatsapp', 'wordpins', 'spotify', 'testimonies'
  ];

  return (
    <div className="pt-32 max-w-7xl mx-auto px-4 pb-20">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-teal-600">Admin Dashboard</h1>
          <div className={`px-4 py-2 rounded-lg ${serverStatus === 'online' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <span className={`w-3 h-3 rounded-full inline-block mr-2 ${serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {serverStatus === 'online' ? 'Server Online' : 'Server Offline'}
          </div>
        </div>

        {uploadProgress && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
            <p className="text-blue-700 font-semibold">⏳ {uploadProgress}</p>
          </div>
        )}

        {serverStatus === 'offline' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 font-semibold">🚨 Backend Server is Not Running!</p>
            <p className="text-red-600 text-sm mt-2">Run: <code className="bg-red-100 px-2 py-1 rounded">node server.js</code></p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap text-sm ${
                tab === t ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Carousel Tab */}
        {tab === 'carousel' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Carousel Management</h2>
            
            {existingCarousel.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Current Carousel ({existingCarousel.length}):</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {existingCarousel.map((item) => (
                    <div key={item.id} className="relative bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={item.url} alt={item.text} className="w-full h-40 object-cover" />
                      {item.text && <div className="absolute bottom-12 left-0 right-0 bg-black/70 p-2 text-white text-sm">{item.text}</div>}
                      <div className="p-3 flex justify-between items-center">
                        <span className="text-xs truncate flex-1">{item.url.split('/').pop()}</span>
                        <button onClick={() => deleteCarouselItem(item)} disabled={loading}
                          className="ml-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-xs">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Add New Carousel Items:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(idx => (
                  <div key={idx} className="p-4 bg-teal-50 rounded-xl">
                    <label className="block font-semibold mb-2">Item {idx + 1}</label>
                    <input type="file" accept="image/*" 
                      onChange={e => {
                        const newItems = [...carouselItems];
                        newItems[idx].file = e.target.files[0];
                        setCarouselItems(newItems);
                      }}
                      className="w-full mb-3 px-4 py-3 rounded-xl border-2 border-teal-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white" />
                    <input type="text" placeholder="Overlay text (optional)"
                      value={carouselItems[idx].text}
                      onChange={e => {
                        const newItems = [...carouselItems];
                        newItems[idx].text = e.target.value;
                        setCarouselItems(newItems);
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    {carouselItems[idx].file && <p className="text-sm text-green-600 mt-2">✓ {carouselItems[idx].file.name}</p>}
                  </div>
                ))}
              </div>
              <button onClick={uploadCarousel} disabled={loading || serverStatus !== 'online'}
                className="mt-6 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Uploading...' : '📁 Upload Carousel'}
              </button>
            </div>
          </div>
        )}

        {/* Hero Tab */}
        {tab === 'hero' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Hero Image ("Hey, You're Home" Section)</h2>
            
            {existingHero.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Current Hero Image:</h3>
                <img src={existingHero[0].image} alt="Hero" className="w-full md:w-1/2 h-64 object-cover rounded-xl" />
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Upload New Hero Image:</h3>
              <input type="file" accept="image/*" onChange={e => setHeroImage(e.target.files[0])}
                className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white" />
              {heroImage && <p className="text-sm text-green-600 mt-2">✓ {heroImage.name}</p>}
              <button onClick={uploadHeroImage} disabled={loading || serverStatus !== 'online'}
                className="mt-4 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Uploading...' : '📁 Upload Hero Image'}
              </button>
            </div>
          </div>
        )}

        {/* Churches Tab */}
        {tab === 'churches' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Our Churches (Max 3)</h2>
            
            {existingChurches.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Current Churches:</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {existingChurches.map((church) => (
                    <div key={church.id} className="bg-gray-50 rounded-xl overflow-hidden">
                      <img src={church.image} alt={church.name} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <h4 className="font-bold">{church.name}</h4>
                        <p className="text-sm text-gray-600">{church.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Add New Churches:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="p-4 bg-teal-50 rounded-xl">
                    <label className="block font-semibold mb-2">Church {idx + 1}</label>
                    <input type="file" accept="image/*" 
                      onChange={e => {
                        const newChurches = [...churches];
                        newChurches[idx].file = e.target.files[0];
                        setChurches(newChurches);
                      }}
                      className="w-full mb-3 px-4 py-2 rounded-xl border-2 border-teal-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white file:text-sm" />
                    <input type="text" placeholder="Church Name"
                      value={churches[idx].name}
                      onChange={e => {
                        const newChurches = [...churches];
                        newChurches[idx].name = e.target.value;
                        setChurches(newChurches);
                      }}
                      className="w-full mb-2 px-4 py-2 rounded-xl border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                    <input type="text" placeholder="Location"
                      value={churches[idx].location}
                      onChange={e => {
                        const newChurches = [...churches];
                        newChurches[idx].location = e.target.value;
                        setChurches(newChurches);
                      }}
                      className="w-full px-4 py-2 rounded-xl border-2 border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                  </div>
                ))}
              </div>
              <button onClick={uploadChurches} disabled={loading || serverStatus !== 'online'}
                className="mt-6 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Uploading...' : '📁 Upload Churches'}
              </button>
            </div>
          </div>
        )}

        {/* Pastors Tab */}
        {tab === 'pastors' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Our Pastors (Max 3)</h2>
            
            {existingPastors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Current Pastors:</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {existingPastors.map((pastor) => (
                    <div key={pastor.id} className="bg-gray-50 rounded-xl overflow-hidden">
                      <img src={pastor.image} alt={pastor.name} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <h4 className="font-bold text-sm">{pastor.title}</h4>
                        <p className="text-sm text-gray-600">{pastor.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Add New Pastors:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="p-4 bg-purple-50 rounded-xl">
                    <label className="block font-semibold mb-2">Pastor {idx + 1}</label>
                    <input type="file" accept="image/*" 
                      onChange={e => {
                        const newPastors = [...pastors];
                        newPastors[idx].file = e.target.files[0];
                        setPastors(newPastors);
                      }}
                      className="w-full mb-3 px-4 py-2 rounded-xl border-2 border-purple-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:text-sm" />
                    <input type="text" placeholder="Title (e.g., Group Pastor)"
                      value={pastors[idx].title}
                      onChange={e => {
                        const newPastors = [...pastors];
                        newPastors[idx].title = e.target.value;
                        setPastors(newPastors);
                      }}
                      className="w-full mb-2 px-4 py-2 rounded-xl border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                    <input type="text" placeholder="Name"
                      value={pastors[idx].name}
                      onChange={e => {
                        const newPastors = [...pastors];
                        newPastors[idx].name = e.target.value;
                        setPastors(newPastors);
                      }}
                      className="w-full px-4 py-2 rounded-xl border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                ))}
              </div>
              <button onClick={uploadPastors} disabled={loading || serverStatus !== 'online'}
                className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Uploading...' : '📁 Upload Pastors'}
              </button>
            </div>
          </div>
        )}

        {/* Sermon Tab */}
        {tab === 'sermon' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Sermon Section</h2>
            
            {existingSermon.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Current Sermon:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {existingSermon[0].image && <img src={existingSermon[0].image} alt="Sermon" className="w-full h-48 object-cover rounded-xl" />}
                  {existingSermon[0].video && <video controls className="w-full h-48 bg-black rounded-xl"><source src={existingSermon[0].video} type="video/mp4" /></video>}
                </div>
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Upload New Sermon:</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Sermon Image</label>
                  <input type="file" accept="image/*" onChange={e => setSermonImg(e.target.files[0])}
                    className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white" />
                  {sermonImg && <p className="text-sm text-green-600 mt-2">✓ {sermonImg.name}</p>}
                </div>
                <div>
                  <label className="block font-semibold mb-2">Sermon Video</label>
                  <input type="file" accept="video/*" onChange={e => setSermonVid(e.target.files[0])}
                    className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white" />
                  {sermonVid && <p className="text-sm text-green-600 mt-2">✓ {sermonVid.name}</p>}
                </div>
              </div>
              <button onClick={uploadSermon} disabled={loading || serverStatus !== 'online'}
                className="mt-6 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Uploading...' : '📁 Upload Sermon'}
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp Tab */}
        {tab === 'whatsapp' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">WhatsApp Chat Number</h2>
            
            {existingWhatsapp.length > 0 && (
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="font-semibold">Current Number:</p>
                <p className="text-green-700">{existingWhatsapp[0].number}</p>
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Update WhatsApp Number:</h3>
              <input type="text" placeholder="e.g., 2348012345678 (no + or spaces)"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={uploadWhatsApp} disabled={loading}
                className="mt-4 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Saving...' : '💬 Save WhatsApp Number'}
              </button>
            </div>
          </div>
        )}

        {/* Wordpins Tab */}
        {tab === 'wordpins' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Wordpins Carousels (3 each)</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Wordpins 1:</h3>
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="mb-3">
                    <label className="block text-sm mb-1">Image {idx + 1}</label>
                    <input type="file" accept="image/*" 
                      onChange={e => {
                        const newWP = [...wordpins1];
                        newWP[idx] = e.target.files[0];
                        setWordpins1(newWP);
                      }}
                      className="w-full px-4 py-2 rounded-xl border-2 border-yellow-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-yellow-600 file:text-white file:text-sm" />
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-4">Wordpins 2:</h3>
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="mb-3">
                    <label className="block text-sm mb-1">Image {idx + 1}</label>
                    <input type="file" accept="image/*" 
                      onChange={e => {
                        const newWP = [...wordpins2];
                        newWP[idx] = e.target.files[0];
                        setWordpins2(newWP);
                      }}
                      className="w-full px-4 py-2 rounded-xl border-2 border-yellow-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-yellow-600 file:text-white file:text-sm" />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={uploadWordpins} disabled={loading || serverStatus !== 'online'}
              className="mt-6 bg-yellow-600 text-white px-8 py-3 rounded-xl hover:bg-yellow-700 transition font-semibold disabled:bg-gray-400">
              {loading ? 'Uploading...' : '📁 Upload Wordpins'}
            </button>
          </div>
        )}

        {/* Spotify Tab */}
        {tab === 'spotify' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Spotify Streamify Link</h2>
            
            {existingSpotify.length > 0 && (
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="font-semibold">Current Spotify Link:</p>
                <p className="text-green-700 break-all text-sm">{existingSpotify[0].link}</p>
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Update Spotify Link:</h3>
              <input type="url" placeholder="Paste Spotify playlist/album/track link"
                value={spotify}
                onChange={e => setSpotify(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button onClick={uploadSpotify} disabled={loading}
                className="mt-4 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Saving...' : '🎵 Save Spotify Link'}
              </button>
            </div>
          </div>
        )}

        {/* Testimonies Tab */}
        {tab === 'testimonies' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Testimonies (Max 3)</h2>
            
            {existingTestimonies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Current Testimonies:</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {existingTestimonies.map((testimony) => (
                    <div key={testimony.id} className="bg-gray-50 rounded-xl overflow-hidden">
                      <img src={testimony.image} alt={testimony.name} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <h4 className="font-bold">{testimony.name}</h4>
                        <p className="text-sm text-gray-600">{testimony.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-2 pt-6">
              <h3 className="font-semibold mb-4">Add New Testimonies:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="p-4 bg-blue-50 rounded-xl">
                    <label className="block font-semibold mb-2">Testimony {idx + 1}</label>
                    <input type="file" accept="image/*" 
                      onChange={e => {
                        const newTestimonies = [...testimonies];
                        newTestimonies[idx].file = e.target.files[0];
                        setTestimonies(newTestimonies);
                      }}
                      className="w-full mb-3 px-4 py-2 rounded-xl border-2 border-blue-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-sm" />
                    <input type="text" placeholder="Person's Name"
                      value={testimonies[idx].name}
                      onChange={e => {
                        const newTestimonies = [...testimonies];
                        newTestimonies[idx].name = e.target.value;
                        setTestimonies(newTestimonies);
                      }}
                      className="w-full mb-2 px-4 py-2 rounded-xl border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <textarea placeholder="Short testimony description" rows="3"
                      value={testimonies[idx].description}
                      onChange={e => {
                        const newTestimonies = [...testimonies];
                        newTestimonies[idx].description = e.target.value;
                        setTestimonies(newTestimonies);
                      }}
                      className="w-full px-4 py-2 rounded-xl border-2 border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                  </div>
                ))}
              </div>
              <button onClick={uploadTestimonies} disabled={loading || serverStatus !== 'online'}
                className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-semibold disabled:bg-gray-400">
                {loading ? 'Uploading...' : '📁 Upload Testimonies'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;