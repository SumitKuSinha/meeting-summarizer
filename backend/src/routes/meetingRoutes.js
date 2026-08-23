import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  processMeetingAudio,
  getAllMeetings,
  getMeetingById,
  deleteMeeting
} from '../controllers/meetingController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Configure Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Allowed audio file extensions and mime types
const allowedExtensions = ['.mp3', '.wav', '.m4a'];
const allowedMimeTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid audio file format. Only .mp3, .wav, and .m4a files are allowed.'), false);
  }
};

// Multer upload middleware with 25MB limit
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB
  },
  fileFilter
});

const router = Router();

// Middleware wrapper to handle Multer validation errors cleanly
const uploadSingleAudio = (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds the 25MB maximum limit.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    next();
  });
};

// Route: POST /api/meetings/process - Upload and process audio file
router.post('/process', uploadSingleAudio, processMeetingAudio);

// Route: GET /api/meetings - Get all saved meetings
router.get('/', getAllMeetings);

// Route: GET /api/meetings/:id - Get single meeting details by ID
router.get('/:id', getMeetingById);

// Route: DELETE /api/meetings/:id - Delete a meeting by ID
router.delete('/:id', deleteMeeting);

export default router;
