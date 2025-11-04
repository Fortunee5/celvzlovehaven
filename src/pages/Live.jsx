import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Live = () => {
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLive();
  }, []);

  const fetchLive = async () => {
    try {
      const snap = await getDocs(collection(db, 'live'));
      if (!snap.empty) {
        setLiveUrl(snap.docs[0].data().url);
      }
    } catch (error) {
      console.error("Error fetching live URL:", error);
    }
    setLoading(false);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Handle different YouTube URL formats
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : '';
  };

  const embedUrl = getEmbedUrl(liveUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-teal-600 mb-8 text-center">Live Stream</h1>
      
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="w-full h-96 md:h-[500px] bg-teal-50 flex items-center justify-center">
            <p className="text-teal-600 text-xl">Loading...</p>
          </div>
        ) : embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe 
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Live Stream"
            />
          </div>
        ) : (
          <div className="relative h-96 md:h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800"
              alt="Pastor Chris" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white text-3xl font-bold mb-2">No Live Stream Currently</p>
                <p className="text-white text-lg">Check back later for our next broadcast</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {embedUrl && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">🔴 Live stream is active</p>
        </div>
      )}
    </div>
  );
};

export default Live;