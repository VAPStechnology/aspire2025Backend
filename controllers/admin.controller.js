import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({isAdmin: false}).select('-password -__v'); // Exclude password and __v field
  if (!users || users.length === 0) {
    throw new ApiError(404, 'No users found');
  };
  res.json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

// Block a user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Block the user
  user.isBlocked = true;
  await user.save();

  res.json(new ApiResponse(200, user, 'User blocked successfully'));
});

// Unblock a user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Unblock the user
  user.isBlocked = false;
  await user.save();

  res.json(new ApiResponse(200, user, 'User unblocked successfully'));
});

// Delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, null, 'User deleted successfully'));
});

//clear login logs (for admin)///////////////////////////////////////////////////////


export { getUsers, blockUser, unblockUser, deleteUser };
