const express = require('express');
const upload = require('../config/multerConfig.js');
const { UploadExcelToDb } = require('../controller/userDataController.js');
const router = express.Router();

router.post("/upload", upload.single("file"), UploadExcelToDb);

module.exports = router;