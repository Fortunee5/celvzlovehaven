export const testServer = async () => {
  try {
    console.log('🧪 Testing server connection...');
    
    const response = await fetch('http://localhost:5000/api/test');
    const data = await response.json();
    
    console.log('✅ Server response:', data);
    alert('Server is running! ' + JSON.stringify(data));
    
    // Test file listing
    const filesResponse = await fetch('http://localhost:5000/api/files/all');
    const filesData = await filesResponse.json();
    
    console.log('✅ Files on server:', filesData);
    
  } catch (error) {
    console.error('❌ Server test failed:', error);
    alert('Server is NOT running! Please start it with: npm run server');
  }
};