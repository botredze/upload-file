const fileService = require('../service/file.service');

const uploadFile = async (req, res) => {
  try {
    await fileService.uploadFile(req.file);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFileList = async (req, res) => {
  try {
    const listSize = req.query.list_size ||10;
    const page = req.query.page || 1;

    const fileList = await fileService.getFileList(listSize, page);
    res.json({ files: fileList });
  } catch (error) {
    console.error('Error retrieving file list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    await fileService.deleteFile(fileId);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadFile,
  getFileList,
  deleteFile,
};
