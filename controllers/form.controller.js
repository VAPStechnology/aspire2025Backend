import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Form from "../models/form.model.js";

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
const createForm = asyncHandler(async (req, res) => {
  const { data } = req.body;
  const user = req.user._id; // from auth middleware

  const form = await Form.create({ user, data });

  res.status(201).json(new ApiResponse(201, form, 'Form created successfully'));
});

// @desc    Get all forms (Admin)
// @route   GET /api/forms
// @access  Admin
const getAllForms = asyncHandler(async (req, res) => {
  const forms = await Form.find().populate('user', 'name email');
  res.json(new ApiResponse(200, forms, 'Forms fetched successfully'));
});

// @desc    Get single form by ID
// @route   GET /api/forms/:id
// @access  Private (Owner or Admin)
const getFormsByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params; // user id
    console.log(req.user.isAdmin);
  
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
  

// @desc    Update a form
// @route   PUT /api/forms/:id
// @access  Private (Owner or Admin)
const updateForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  if (form.user.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to update this form');
  }

  if (form.submitted) {
    throw new ApiError(400, 'Cannot update a submitted form');
  }

  form.data = data;
  await form.save();

  res.json(new ApiResponse(200, form, 'Form updated successfully'));
});

// @desc    Submit a form
// @route   PATCH /api/forms/:id/submit
// @access  Private (Owner or Admin)
const submitForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  if (form.user.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to submit this form');
  }

  if (form.submitted) {
    throw new ApiError(400, 'Form already submitted');
  }

  form.submitted = true;
  form.submittedAt = new Date();
  await form.save();

  res.json(new ApiResponse(200, form, 'Form submitted successfully'));
});

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private (Owner or Admin)
const deleteForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const form = await Form.findById(id);

  if (!form) {
    throw new ApiError(404, 'Form not found');
  }

  if (form.user.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to delete this form');
  }

  await form.deleteOne();

  res.json(new ApiResponse(200, null, 'Form deleted successfully'));
});

// @desc    Get all forms of a specific user (admin or same user)
// @route   GET /api/forms/user/:userId
// @access  Private/Admin
const getFormsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to view forms of other users');
  }

  const forms = await Form.find({ user: userId }).populate('user', 'name email');

  res.json(new ApiResponse(200, forms, 'User forms fetched successfully'));
});

// @desc    Get form submission stats for logged-in user
// @route   GET /api/forms/stats/me
// @access  Private
const getUserFormStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const submitted = await Form.countDocuments({ user: userId, submitted: true });
  const pending = await Form.countDocuments({ user: userId, submitted: false });

  res.json(new ApiResponse(200, { submitted, pending }, 'User form stats fetched'));
});

// @desc    Get form submission stats for any user (Admin)
// @route   GET /api/forms/stats/:userId
// @access  Private/Admin
const getFormStatsByUserId = asyncHandler(async (req, res) => {
  const  {id}  = req.params;

  const submitted = await Form.countDocuments({ user: id, submitted: true });
  const pending = await Form.countDocuments({ user: id, submitted: false });

  res.json(new ApiResponse(200, { submitted, pending }, 'Form stats fetched for user'));
});

export {
  createForm,
  getAllForms,
  getFormsByUserId,
  updateForm,
  submitForm,
  deleteForm,
  getFormsByUser,
  getUserFormStats,
  getFormStatsByUserId,
};
