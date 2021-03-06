const multer = require('multer');
const path = require('path');

const excelFilter = (req, file, cb) => {
   if (file.originalname.endsWith(".xlsx") || file.originalname.endsWith(".csv")) {
      console.log("FILE UPLOADED WAS EITHER .xlsx or .csv, OKAY!");
      cb(null, true);
   } else {
     cb("Please upload either .xlsx or .csv files", false);
   }
 };

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      console.log("hello");
      cb(null, path.resolve('uploads/'));
   },
   filename: (req, file, cb) => {
      console.log("world");
      cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
   }
});   
   
const upload = multer({storage: storage, fileFilter: excelFilter});

module.exports = upload;