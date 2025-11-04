const API_URL = 'http://localhost:5000/api';

export const testServerConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/test`, {
      method: 'GET',
      mode: 'cors'
    });
    const data = await response.json();
    console.log('✅ Server connection test:', data);
    return data.success;
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    alert('⚠️ Backend server is not running!\n\nPlease run: node server.js');
    return false;
  }
};

export const uploadFile = async (file, folder) => {
  try {
    console.log('📤 uploadFile called with:', { 
      fileName: file.name, 
      fileSize: file.size, 
      folder: folder  // THIS IS CRITICAL
    });

    // First test if server is reachable
    const isServerRunning = await testServerConnection();
    if (!isServerRunning) {
      throw new Error('Backend server is not running. Please start it with: node server.js');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder); // CRITICAL: Must match exactly
    
    // Debug: Log FormData contents
    console.log('📦 FormData contents:');
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
    }

    console.log('🔄 Sending request to:', `${API_URL}/upload`);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Upload response:', data);

    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    // Verify the URL matches the actual file location
    console.log('🔍 Verifying URL:', data.url);

    return data.url;
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      alert('🚨 Cannot connect to server!\n\n' +
            'Make sure the backend server is running:\n' +
            '1. Open a new terminal\n' +
            '2. Run: node server.js\n' +
            '3. Try uploading again');
    }
    
    throw error;
  }
};

export const deleteFile = async (url) => {
  try {
    if (!url) {
      console.log('⚠️ No URL provided for deletion');
      return true;
    }

    console.log('🗑️ Deleting file:', url);

    const response = await fetch(`${API_URL}/delete-file`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url }),
      mode: 'cors'
    });

    const data = await response.json();
    console.log('✅ Delete response:', data);
    
    return data.success;
  } catch (error) {
    console.error('❌ Delete error:', error);
    return false;
  }
};

export const deleteFolder = async (folder) => {
  try {
    const response = await fetch(`${API_URL}/delete-folder/${folder}`, {
      method: 'DELETE',
      mode: 'cors'
    });

    const data = await response.json();
    console.log('✅ Delete folder response:', data);
    return data.success;
  } catch (error) {
    console.error('❌ Delete folder error:', error);
    return false;
  }
};