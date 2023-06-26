import express from 'express';
import cors from 'cors';
import multer from 'multer';

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

require('dotenv').config();

const pathToFfmpeg = require('ffmpeg-static');
ffmpeg.setFfmpegPath(pathToFfmpeg);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const app = express();

app.use(cors());
app.use(express.json());

enum FieldNames {
  Video = 'video',
  Annotations = 'annotations',
}

app.post('/save', upload.fields([{
  name: 'video', maxCount: 1,
}, {
  name: 'annotations', maxCount: 1,
}]), async (req, res) => {
  const files = req.files as { [name in FieldNames]: Express.Multer.File[] };
  if (files) {
    const inputVideoName = 'video';
    const outputVideoName = 'result.mp4';
    res.set('Content-Type', 'video/mp4');

    const videoBuffer = files.video[0].buffer;

    fs.writeFileSync(inputVideoName, videoBuffer);
    
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputVideoName)
        .outputFormat('mp4')
        .saveToFile(outputVideoName)
        .on('error', () => {
          reject();
        })
        .on('end', () => {
          resolve(null);
        });
    });

    const result = fs.readFileSync(outputVideoName);
    res.end(result, 'binary');
    fs.unlinkSync(inputVideoName);
    fs.unlinkSync(outputVideoName);

  } else {
    res.status(500);
    res.json({
      message: 'Internal error',
    });
  }
});


export default app;
