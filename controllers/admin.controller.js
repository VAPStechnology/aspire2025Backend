import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Form from '../models/form.model.js';
import ContactMessage from '../models/contact.model.js';
import UserDocument from '../models/userDocument.model.js';

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
const clearLoginLogs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  // Clear login logs
  user.loginLogs = [];
  await user.save();
  res.json(new ApiResponse(200, null, 'Login logs cleared successfully'));
}
);
//clear login logs (for admin)///////////////////////////////////////////////////////
 const clearLoginLogsAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  // Clear login logs
  user.loginLogs = [];
  await user.save();
  res.json(new ApiResponse(200, null, 'Login logs cleared successfully'));
}
);

// Get all forms of a user////////////////////////////////////////////////////////
const getFormsByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params; // user id

  // Find all forms where form.user == userId
  const forms = await Form.find({ user: id }).populate('user', 'name email');

  if (!forms || forms.length === 0) {
    throw new ApiError(404, 'No forms found for this user');
  }

  // Only allow the user themselves or admin to see
  if (id.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to view these forms');
  }

  res.json(new ApiResponse(200, forms, 'Forms fetched successfully'));
});

// delete form of a user////////////////////////////////////////////////////////
const deleteFormByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params; // user id

  // Find the form by ID
  const form = await Form.findById(id);
  if (!form) {
    throw new ApiError(404, 'Form not found');
  } 
  // Only allow the user themselves or admin to delete
  if (form.user.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to delete this form');
  }
  // Delete the form
  await Form.findByIdAndDelete(id);
  res.json(new ApiResponse(200, null, 'Form deleted successfully'));
}
);

/// get contact us data of user by using contact message model and controller  //////////////////////////////////////////////////////////////////

const getContactUsByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params; // user id

  // Find all contact messages where contactMessage.user == userId
  const contactMessages = await ContactMessage.find({ user: id }).populate('user', 'name email');

  if (!contactMessages || contactMessages.length === 0) {
    throw new ApiError(404, 'No contact messages found for this user');
  }

  // Only allow the user themselves or admin to see
  if (id.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to view these contact messages');
  }

  res.json(new ApiResponse(200, contactMessages, 'Contact messages fetched successfully'));
});
// get all contact us messages of all users by using contact message  //////////////////////////////////////////////////////////////////
const getAllContactUs = asyncHandler(async (req, res) => {
  const contactMessages = await ContactMessage.find().populate('email', 'name email');

  if (!contactMessages || contactMessages.length === 0) {
    throw new ApiError(404, 'No contact messages found');
  }

  res.json(new ApiResponse(200, contactMessages, 'Contact messages fetched successfully'));
});

// delete contact us data of user by using contact message model and controller  ////////////////////////////////////////////////////////////////// 
const deleteContactUsByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params; // user id

  // Find the contact message by ID
  const contactMessage = await ContactMessage.findById(id);
  if (!contactMessage) {
    throw new ApiError(404, 'Contact message not found');
  } 
  // Only allow the user themselves or admin to delete
  if (req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to delete this contact message');
  }
  // Delete the contact message
  await ContactMessage.findByIdAndDelete(id);
  res.json(new ApiResponse(200, null, 'Contact message deleted successfully'));
}
);

/////////////////////////////////////////////////////////////////////////////////////////////

// get user  register request data which is not register by admin by using user model and  user controller  //////////////////////////////////////////////////////////////////
const getUserRegisterRequest = asyncHandler(async (req,res)=>{
  const users = await UserDocument.find({isRegistered: false});
  // .select('-password -__v'); // Exclude password and __v field
  if (!users || users.length === 0) {
    throw new ApiError(404, 'No new users found');
  };
  res.json(new ApiResponse(200, users, 'Users retrieved successfully'));  

});
// delete user register request data which is not register by admin by using user model and  user controller  //////////////////////////////////////////////////////////////////
const deleteUserRegisterRequest = asyncHandler(async (req,res)=>{
  const { id } = req.params;
  const user = await UserDocument.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json(new ApiResponse(200, null, 'User deleted successfully'));
});







export { getUsers, blockUser, unblockUser, deleteUser, 
  clearLoginLogs, clearLoginLogsAdmin, getFormsByUserId, deleteFormByUserId,
  getContactUsByUserId, getAllContactUs, deleteContactUsByUserId,
  getUserRegisterRequest, deleteUserRegisterRequest
};
