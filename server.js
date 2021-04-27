const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var multer  = require('multer');

const app = express();

const imagePaths = {};
let lastFilePathToDelete = null;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.get('/', (_, res) => {
  res.sendFile(path.resolve(__dirname, './client/index.html'));
});

const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('img'), (req, res) => {
  const id = uuidv4().substring(0, 6);
  imagePaths[id] = req.file.path;
  res.send(id);
});

uploadRouter.get('/:id', (req, res) => {
  const id = req.params.id;
  if (lastFilePathToDelete !== null) {
    fs.unlinkSync(lastFilePathToDelete);
    lastFilePathToDelete = null;
  }
  if (!imagePaths[id]) {
    res.status(400).send('Invalid image id');
  } else {
    const filePath = `./${imagePaths[id]}`;
    delete imagePaths[id];
    lastFilePathToDelete = filePath;
    res.sendFile(path.resolve(__dirname, filePath));
  }
});

app.use('/upload', uploadRouter);

app.all('*', (_, res) => {
  res.redirect('/');
});

app.listen(process.env.PORT || 3001);