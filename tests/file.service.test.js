const fs = require('fs');
const path = require('path');
const fileService = require('../service/file.service');
const File = require('../models/file');

jest.mock('fs');
jest.mock('path');
jest.mock('../models/file');

describe('File Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadFile', () => {
        it('should upload a file successfully', async () => {
            const mockFile = {
                originalname: 'test.jpg',
                filename: 'test123.jpg',
                mimetype: 'image/jpeg',
                size: 1024,
            };

            await fileService.uploadFile(mockFile);

            expect(File.createFile).toHaveBeenCalledWith(
                mockFile.originalname,
                mockFile.filename,
                mockFile.mimetype,
                mockFile.size,
                expect.any(Date)
            );
        });

        it('should throw an error when file upload fails', async () => {
            const mockFile = {
                originalname: 'test.jpg',
                filename: 'test123.jpg',
                mimetype: 'image/jpeg',
                size: 1024,
            };

            File.createFile.mockImplementation(() => {
                throw new Error('Internal server error');
            });

            await expect(fileService.uploadFile(mockFile)).rejects.toThrow('Internal server error');
            expect(File.createFile).toHaveBeenCalledWith(
                mockFile.originalname,
                mockFile.filename,
                mockFile.mimetype,
                mockFile.size,
                expect.any(Date)
            );
        });
    });

    describe('getFileList', () => {
        it('should return a list of files', async () => {
            const mockListSize = 10;
            const mockPage = 1;
            const mockFileList = [
                { originalname: 'file1.txt', filename: 'file1.txt', mimetype: 'text/plain', size: 100 },
                { originalname: 'file2.jpg', filename: 'file2.jpg', mimetype: 'image/jpeg', size: 200 },
            ];

            File.getAllFiles.mockResolvedValue(mockFileList);

            const result = await fileService.getFileList(mockListSize, mockPage);

            expect(result).toEqual(mockFileList);
            expect(File.getAllFiles).toHaveBeenCalledWith(mockListSize, (mockPage - 1) * mockListSize);
        });

        it('should throw an error when retrieving file list fails', async () => {
            const mockListSize = 10;
            const mockPage = 1;

            File.getAllFiles.mockImplementation(() => {
                throw new Error('Internal server error');
            });

            await expect(fileService.getFileList(mockListSize, mockPage)).rejects.toThrow('Internal server error');
            expect(File.getAllFiles).toHaveBeenCalledWith(mockListSize, (mockPage - 1) * mockListSize);
        });
    });

    describe('deleteFile', () => {
        it('should delete a file successfully', async () => {
            const mockFileId = 'file123';
            const mockFile = {
                fileId: mockFileId,
                originalname: 'test.jpg',
                filename: 'test123.jpg',
                mimetype: 'image/jpeg',
                size: 1024,
            };

            File.getFileById.mockResolvedValue(mockFile);
            fs.unlink.mockImplementation((filePath, callback) => {
                callback(null);
            });
            File.deleteFileById.mockResolvedValue(true);

            await fileService.deleteFile(mockFileId);

            expect(File.getFileById).toHaveBeenCalledWith(mockFileId);
            expect(fs.unlink).toHaveBeenCalledWith(path.join('./uploads', mockFile.filename), expect.any(Function));
            expect(File.deleteFileById).toHaveBeenCalledWith(mockFileId);
        });

        it('should throw an error when file is not found', async () => {
            const mockFileId = 'file123';

            File.getFileById.mockResolvedValue(null);

            await expect(fileService.deleteFile(mockFileId)).rejects.toThrow('File not found');
            expect(File.getFileById).toHaveBeenCalledWith(mockFileId);
        });

        it('should throw an error when file deletion fails', async () => {
            const mockFileId = 'file123';
            const mockFile = {
                fileId: mockFileId,
                originalname: 'test.jpg',
                filename: 'test123.jpg',
                mimetype: 'image/jpeg',
                size: 1024,
            };

            File.getFileById.mockResolvedValue(mockFile);
            fs.unlink.mockImplementation((filePath, callback) => {
                callback(new Error('Internal server error'));
            });

            await expect(fileService.deleteFile(mockFileId)).rejects.toThrow('Internal server error');
            expect(File.getFileById).toHaveBeenCalledWith(mockFileId);
            expect(fs.unlink).toHaveBeenCalledWith(path.join('./uploads', mockFile.filename), expect.any(Function));
        });

        it('should throw an error when file deletion from database fails', async () => {
            const mockFileId = 'file123';
            const mockFile = {
                fileId: mockFileId,
                originalname: 'test.jpg',
                filename: 'test123.jpg',
                mimetype: 'image/jpeg',
                size: 1024,
            };

            File.getFileById.mockResolvedValue(mockFile);
            fs.unlink.mockImplementation((filePath, callback) => {
                callback(null);
            });
            File.deleteFileById.mockResolvedValue(false);

            await expect(fileService.deleteFile(mockFileId)).rejects.toThrow('Error deleting file from database');
            expect(File.getFileById).toHaveBeenCalledWith(mockFileId);
            expect(fs.unlink).toHaveBeenCalledWith(path.join('./uploads', mockFile.filename), expect.any(Function));
            expect(File.deleteFileById).toHaveBeenCalledWith(mockFileId);
        });
    });
});
