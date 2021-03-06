//const readXlsxFile = require('read-excel-file/node');
const db = require('../models');
const UserData = require('../models/UserExcelData.js')(db.sequelize, db.Sequelize);
const Uploader = require('../models/Uploader.js')(db.sequelize, db.Sequelize);
const path = require('path');
const {schema} = require('../models/schema/schema');
const {parseExcel} = require('../lib/parseExcel');

const UploadExcelToDb = async (req, res) => {
    console.log("EXECUTING uploadExcelToDb() from userDataController.js");
    console.log(`\n\n\nBODY OF THE REQUEST:\n${req.file.filename}`);
    let filePath = path.resolve('uploads/' + req.file.filename);

    const uploaderPhone = '123454';
    let uploader;
    try {
        console.log("TRYING TO CREATE AN UPLOADER OBJECT");
        uploader = await Uploader.findOne({
            where: { phoneNo: uploaderPhone }
        });
        if(uploader === null) {
            res.status(200).json({message: "Invalid User"});
        }
    } catch(error) {
        console.log("couldn't find user/ db error");
        res.status(500).json({message: error});
    }

    try {
        console.log("TRYING TO RECEIVE THE RECORDS ARRAY FROM parseExcel()")
        let records = await parseExcel(filePath, req.body);
        console.log("RECORDS RECEIVED");
        records.forEach( row => {
            row.uploaderId = uploader.uploaderId;
        });
        console.log("uploaderID ADDED TO EACH RECORD");
        const msg = await addRecords(records);
        console.log("EXECUTED addRecords() SUCCESSFULLY");
        res.status(200).json({message: msg});
    } catch(error) {
        res.status(200).json({message: "Error reading the file!"});
    }
}

// This function creates a transaction to add all records sent as argument to the database
// When more tables are added to schema this function can be generalised for all tables
const addRecords = async (records) => {
    console.log("adding records")
    const t = await db.sequelize.transaction();
    let line;
    try {
        line = 1;
        for(let entry of records) {
            console.log(entry);
            await UserData.create(entry, { transaction: t });
            line++;
        }
        // If the execution reaches this line, the transaction has been committed successfully
        // `result` is whatever was returned from the transaction callback
        await t.commit();
        return "Successfully Uploaded!";
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        await t.rollback();
        console.log("Transaction rolled back!");
        const uiError = {}
        switch(error.name) {
            case 'SequelizeUniqueConstraintError': 
                uiError.message = "Possible duplicate value has been detected";
                break;
            case 'SequelizeValidationError':
                uiError.message = "Please check the type of data entered";
                break;
            default: 
                uiError.message = "An error occured. Please check the data entered"
        }
        console.log(error.name);
        uiError.line = line;
        return uiError;
    }
}

const getUserData = async (req, res) => {
    const uploaderPhone = '123454';
    let uploader;
    try {
        uploader = await Uploader.findOne({
            where: { phoneNo: uploaderPhone }
        });
        if(uploader === null) {
            res.status(200).json({message: "Invalid User"});
        }
    }
    catch(error) {
        console.log("couldn't find user/ db error");
        res.status(500).json({message: error});
    }

    let userDataList;
    try {
        userDataList = await UserData.findAll({
            raw: true,
            where: {
                uploaderId: uploader.uploaderId
            }
        });
    }
    catch(error) {
        res.status(500).json({message: error});
    }
    console.log(userDataList);
    res.render('viewTable',{ 
        rows: userDataList,
        columns: schema[0].columns
    });
 }

module.exports = { UploadExcelToDb, getUserData };