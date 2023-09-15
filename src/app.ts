import express from 'express';
import cors from 'cors';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';

const FormData = require('form-data');

require('dotenv').config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const app = express();

app.use(cors());
app.use(express.json());

app.post('/xlsx2json', upload.single('xlsx'), async (req, res) => {
  try {
    
    const xlsxFile = req.file;

    if (xlsxFile) {

      const inputFileName = 'file.xslx';
      const buffer = xlsxFile.buffer;
  
      fs.writeFileSync(inputFileName, buffer);
      const wb = xlsx.readFile(inputFileName);
      fs.unlinkSync(inputFileName);
      res.json(xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
  
    } else {
      res.status(500);
      res.json({
        message: 'Internal error',
      });
    }
  } catch (error: any) {
    console.log(error);
    
    res.status(error.status ?? 500);
    res.json({
      message: error.message ?? 'Internal error',
    });
  }
});


export default app;
