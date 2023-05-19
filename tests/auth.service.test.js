const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../service/auth.service');
const User = require('../models/user');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models/user');

describe('Authentication Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signin', () => {
        it('should return access and refresh tokens when signin is successful', async () => {
            const mockUserId = 'user123';
            const mockPassword = 'password';
            const mockHashedPassword = 'hashedPassword';
            const mockAccessToken = 'accessToken';
            const mockRefreshToken = 'refreshToken';

            bcrypt.compare.mockResolvedValue(true);
            User.getUserById.mockResolvedValue({ id: mockUserId, password: mockHashedPassword });
            jwt.sign.mockReturnValueOnce(mockAccessToken);
            jwt.sign.mockReturnValueOnce(mockRefreshToken);

            const result = await authService.signin(mockUserId, mockPassword);

            expect(result).toEqual({ accessToken: mockAccessToken, refreshToken: mockRefreshToken });
            expect(User.getUserById).toHaveBeenCalledWith(mockUserId);
            expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
            expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUserId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
            expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUserId }, process.env.REFRESH_TOKEN_SECRET);
        });

        it('should throw an error when signin fails', async () => {
            const mockUserId = 'user123';
            const mockPassword = 'password';

            bcrypt.compare.mockResolvedValue(false);
            User.getUserById.mockResolvedValue({ id: mockUserId, password: 'hashedPassword' });

            await expect(authService.signin(mockUserId, mockPassword)).rejects.toThrow('Authentication failed. Invalid username or password.');
            expect(User.getUserById).toHaveBeenCalledWith(mockUserId);
            expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, 'hashedPassword');
        });
    });

    describe('renewToken', () => {
        it('should return a new access token when renewing token is successful', async () => {
            const mockRefreshToken = 'refreshToken';
            const mockDecodedToken = { userId: 'user123' };
            const mockAccessToken = 'newAccessToken';

            jwt.verify.mockReturnValueOnce(mockDecodedToken);
            jwt.sign.mockReturnValueOnce(mockAccessToken);

            const result = await authService.renewToken(mockRefreshToken);

            expect(result).toEqual({ accessToken: mockAccessToken });
            expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            expect(jwt.sign).toHaveBeenCalledWith({ userId: mockDecodedToken.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
        });

        it('should throw an error when renewing token fails', async () => {
            const mockRefreshToken = 'refreshToken';

            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid refresh token');
            });

            await expect(authService.renewToken(mockRefreshToken)).rejects.toThrow('Invalid refresh token');
            expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        });
    });

    describe('signup', () => {
        it('should return access and refresh tokens when signup is successful', async () => {
            const mockUserId = 'user123';
            const mockPassword = 'password';
            const mockHashedPassword = 'hashedPassword';
            const mockAccessToken = 'accessToken';
            const mockRefreshToken = 'refreshToken';

            User.getUserById.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue(mockHashedPassword);
            User.createUser.mockResolvedValue(mockUserId);
            jwt.sign.mockReturnValueOnce(mockAccessToken);
            jwt.sign.mockReturnValueOnce(mockRefreshToken);

            const result = await authService.signup(mockUserId, mockPassword);

            expect(result).toEqual({ accessToken: mockAccessToken, refreshToken: mockRefreshToken });
            expect(User.getUserById).toHaveBeenCalledWith(mockUserId);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(User.createUser).toHaveBeenCalledWith(mockUserId, mockHashedPassword);
            expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUserId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
            expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUserId }, process.env.REFRESH_TOKEN_SECRET);
        });

        it('should throw an error when signup fails', async () => {
            const mockUserId = 'user123';
            const mockPassword = 'password';

            User.getUserById.mockResolvedValue({ id: mockUserId });

            await expect(authService.signup(mockUserId, mockPassword)).rejects.toThrow('User already exists');
            expect(User.getUserById).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('deactivateToken', () => {
        it('should deactivate the token successfully', async () => {
            const mockRefreshToken = { refreshToken: 'refreshToken'}

            await authService.deactivateToken(mockRefreshToken);

            expect(User.deactivateToken).toHaveBeenCalledWith(mockRefreshToken, { $unset: { refreshToken: 1 } });
        });

        it('should throw an error when token deactivation fails', async () => {
            const mockRefreshToken = { refreshToken: 'refreshToken'};

            User.deactivateToken.mockImplementation(() => {
                throw new Error('Token deactivation failed');
            });

            await expect(authService.deactivateToken(mockRefreshToken)).rejects.toThrow('Token deactivation failed');
            expect(User.deactivateToken).toHaveBeenCalledWith(mockRefreshToken, { $unset: { refreshToken: 1 } });
        });
    });
});
