const fs = require('fs');
const path = require('path');
const File = require('../models/file');

const uploadFile = async (file) => {
  try {
    const { originalname, filename, mimetype, size } = file;
    const uploadDate = new Date();

    await File.createFile(originalname, filename, mimetype, size, uploadDate);
  } catch (error) {
    console.error('Error during file upload:', error);
    throw 'Internal server error';
  }
};

const getFileList = async (listSize = 10, page = 1) => {
  try {
    const offset = (page - 1) * listSize;
    const fileList = await File.getAllFiles(listSize, offset);
    return fileList;
  } catch (error) {
    console.error('Error retrieving file list:', error);
    throw 'Internal server error';
  }
};

const deleteFile = async (fileId) => {
  try {
    const file = await File.getFileById(fileId);
    if (!file) {
      throw 'File not found';
    }

    const filePath = path.join('./uploads', file.filename);
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        throw 'Internal server error';
      }

      const deleted = await File.deleteFileById(fileId);
      if (!deleted) {
        throw 'Error deleting file from database';
      }
    });
  } catch (error) {
    console.error('Error during file deletion:', error);
    throw 'Internal server error';
  }
};

module.exports = {
  uploadFile,
  getFileList,
  deleteFile,
};
