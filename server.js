const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// =======================
// MIDDLEWARE CONFIGURATION
// =======================

// CORS - Must be first
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// =======================
// UPLOADS DIRECTORY SETUP
// =======================

// Absolute path to uploads folder
const uploadsPath = path.resolve(__dirname, 'uploads');
console.log('\n📁 Uploads directory:', uploadsPath);

// Create directory structure
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('✅ Created:', dirPath);
  }
};

// Create main uploads folder and subfolders
ensureDir(uploadsPath);
ensureDir(path.join(uploadsPath, 'carousel'));
ensureDir(path.join(uploadsPath, 'sermon'));
ensureDir(path.join(uploadsPath, 'pastor'));
ensureDir(path.join(uploadsPath, 'general'));

// Test write permissions
try {
  const testFile = path.join(uploadsPath, '.test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Write permissions: OK\n');
} catch (error) {
  console.error('❌ Write permissions: FAILED');
  console.error('⚠️  Run as Administrator!\n');
}

// =======================
// STATIC FILES SERVING
// =======================

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=0');
    
    // Set correct content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg'
    };
    
    if (contentTypes[ext]) {
      res.setHeader('Content-Type', contentTypes[ext]);
    }
  }
}));

// =======================
// MULTER CONFIGURATION
// =======================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get folder from body, query, or default to 'general'
    let folder = req.body.folder || req.query.folder || 'general';
    
    console.log('\n📥 Upload destination:');
    console.log('  - Body folder:', req.body.folder);
    console.log('  - Query folder:', req.query.folder);
    console.log('  - Using folder:', folder);
    
    const destPath = path.join(uploadsPath, folder);
    
    // Ensure folder exists
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
      console.log('  - Created folder:', destPath);
    }
    
    console.log('  - Destination:', destPath);
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    console.log('  - Filename:', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 200 * 1024 * 1024 // 200MB
  },
  fileFilter: (req, file, cb) => {
    console.log('\n📎 File received:');
    console.log('  - Name:', file.originalname);
    console.log('  - Type:', file.mimetype);
    console.log('  - Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    cb(null, true);
  }
});

// =======================
// API ROUTES
// =======================

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint accessed');
  res.json({ 
    success: true, 
    message: 'Server is running!',
    port: PORT,
    uploadsPath: uploadsPath,
    timestamp: new Date().toISOString()
  });
});

// Upload file endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    console.log('\n🔄 Processing upload...');
    console.log('📋 Request info:');
    console.log('  - Body:', req.body);
    console.log('  - Query:', req.query);
    
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Get folder from file path (most reliable)
    const actualFolder = path.basename(path.dirname(req.file.path));
    const requestedFolder = req.body.folder || req.query.folder || 'general';
    
    // Construct file URL
    const fileUrl = `http://localhost:${PORT}/uploads/${actualFolder}/${req.file.filename}`;
    const filePath = req.file.path;
    
    console.log('\n✅ File uploaded:');
    console.log('  - Filename:', req.file.filename);
    console.log('  - Requested folder:', requestedFolder);
    console.log('  - Actual folder:', actualFolder);
    console.log('  - Full path:', filePath);
    console.log('  - URL:', fileUrl);
    console.log('  - Size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Verify file exists on disk
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log('✅ VERIFIED on disk:');
      console.log('  - Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('  - Created:', stats.birthtime);
      
      // Check folder match
      if (actualFolder !== requestedFolder) {
        console.warn('⚠️  Folder mismatch!');
        console.warn('  - Expected:', requestedFolder);
        console.warn('  - Actual:', actualFolder);
      } else {
        console.log('✅ Folder match confirmed');
      }
    } else {
      console.error('❌ CRITICAL: File not found on disk!');
      console.error('  - Path:', filePath);
      return res.status(500).json({
        success: false,
        error: 'File uploaded but not saved to disk'
      });
    }
    
    // Success response
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      path: filePath,
      folder: actualFolder,
      size: req.file.size,
      verified: true
    });
    
    console.log('✅ Upload complete!\n');
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Delete file endpoint
app.delete('/api/delete-file', (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('\n🗑️  Delete request:', url);
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'No URL provided' 
      });
    }

    // Extract relative path from URL
    const urlParts = url.split('/uploads/');
    if (urlParts.length < 2) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid URL format' 
      });
    }

    const relativePath = urlParts[1];
    const filePath = path.join(uploadsPath, relativePath);

    console.log('  - File path:', filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ File deleted successfully\n');
      res.json({ 
        success: true, 
        message: 'File deleted successfully' 
      });
    } else {
      console.log('⚠️  File not found (may already be deleted)\n');
      res.json({ 
        success: true, 
        message: 'File not found' 
      });
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Delete all files in folder
app.delete('/api/delete-folder/:folder', (req, res) => {
  try {
    const { folder } = req.params;
    const folderPath = path.join(uploadsPath, folder);

    console.log('\n🗑️  Delete folder request:', folder);
    console.log('  - Path:', folderPath);

    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        fs.unlinkSync(path.join(folderPath, file));
      });
      console.log(`✅ Deleted ${files.length} file(s)\n`);
      res.json({ 
        success: true, 
        message: `Deleted ${files.length} files` 
      });
    } else {
      console.log('⚠️  Folder not found\n');
      res.json({ 
        success: true, 
        message: 'Folder not found' 
      });
    }
  } catch (error) {
    console.error('❌ Delete folder error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// List files in folder
app.get('/api/files/:folder', (req, res) => {
  try {
    const { folder } = req.params;
    const folderPath = path.join(uploadsPath, folder);
    
    console.log('\n📂 List files request:', folder);
    console.log('  - Path:', folderPath);
    
    if (!fs.existsSync(folderPath)) {
      console.log('⚠️  Folder not found\n');
      return res.json({ 
        success: true, 
        files: [] 
      });
    }

    const files = fs.readdirSync(folderPath);
    console.log(`  - Found ${files.length} file(s)`);
    
    const fileList = files.map(file => {
      const stats = fs.statSync(path.join(folderPath, file));
      return {
        url: `http://localhost:${PORT}/uploads/${folder}/${file}`,
        filename: file,
        size: stats.size,
        sizeMB: (stats.size / 1024 / 1024).toFixed(2),
        created: stats.birthtime
      };
    });

    console.log('✅ File list sent\n');
    res.json({ 
      success: true, 
      files: fileList 
    });
  } catch (error) {
    console.error('❌ List files error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// List all files in all folders
app.get('/api/files/all', (req, res) => {
  try {
    const folders = ['carousel', 'sermon', 'pastor', 'general'];
    const allFiles = {};

    folders.forEach(folder => {
      const folderPath = path.join(uploadsPath, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        allFiles[folder] = files.map(file => ({
          url: `http://localhost:${PORT}/uploads/${folder}/${file}`,
          filename: file,
          size: fs.statSync(path.join(folderPath, file)).size
        }));
      } else {
        allFiles[folder] = [];
      }
    });

    res.json({ 
      success: true, 
      files: allFiles 
    });
  } catch (error) {
    console.error('❌ List all files error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// =======================
// ERROR HANDLING
// =======================

// 404 handler
app.use((req, res) => {
  console.log('❌ 404:', req.path);
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// =======================
// START SERVER
// =======================

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`📡 Server URL:    http://localhost:${PORT}`);
  console.log(`📁 Uploads path:  ${uploadsPath}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🖼️  Static files:  http://localhost:${PORT}/uploads/`);
  console.log('='.repeat(70));
  
  // List existing files
  console.log('\n📂 Current Files:\n');
  const folders = ['carousel', 'sermon', 'pastor', 'general'];
  
  folders.forEach(folder => {
    const folderPath = path.join(uploadsPath, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      console.log(`  ${folder.toUpperCase()}: ${files.length} file(s)`);
      if (files.length > 0) {
        files.forEach(file => {
          const stats = fs.statSync(path.join(folderPath, file));
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          console.log(`    - ${file} (${sizeMB} MB)`);
        });
      }
    } else {
      console.log(`  ${folder.toUpperCase()}: Folder not found`);
    }
  });
  
  console.log('\n✅ Server ready to accept requests!\n');
});

// Server error handler
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('\n❌ ERROR: Port 5000 is already in use!');
    console.log('\nTo fix this:');
    console.log('1. Find process: netstat -ano | findstr :5000');
    console.log('2. Kill process: taskkill /PID <PID> /F');
    console.log('3. Restart server\n');
    process.exit(1);
  } else {
    console.error('\n❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
  
  // Force close after 5 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Log uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('\n📝 Server initialized. Waiting for startup...\n');