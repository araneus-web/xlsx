import express from 'express';
import cors from 'cors';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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

      const fileName = `${uuidv4()}.xslx`;
      const buffer = xlsxFile.buffer;
  
      fs.writeFileSync(fileName, buffer);
      const wb = xlsx.readFile(fileName);
      fs.unlinkSync(fileName);
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

app.post('/json2xlsx', async (req, res) => {
  try {
    var ws = xlsx.utils.json_to_sheet(req.body);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'students');
    const buf = xlsx.write(wb, { type:'buffer', bookType:'xlsx' });

    res.statusCode = 200;
    res.setHeader('Content-Disposition', 'attachment; filename="SheetJSNode.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.end(buf);

  } catch (error: any) {
    console.log(error);
    
    res.status(error.status ?? 500);
    res.json({
      message: error.message ?? 'Internal error',
    });
  }
});

export default app;
