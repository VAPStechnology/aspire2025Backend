import Agreement from '../models/agreement.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const submitAgreement = asyncHandler(async (req, res) => {
  const { agreementText, signature, formId } = req.body;
  const userId = req.user?._id; // assuming user is authenticated and available via middleware

  // === Validation ===
  if (!agreementText?.trim() || !signature?.trim()) {
    throw new ApiError(400, 'Agreement text and signature are required.');
  }

  // === Create Agreement ===
  const agreement = await Agreement.create({
    user: userId,
    form: formId || undefined,
    agreementText,
    signature,
  });

  res.status(201).json(new ApiResponse(201, agreement, 'Agreement submitted successfully.'));
});

const getAgreementsByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params; // user id

  // Find all agreements where agreement.user == userId
  const agreements = await Agreement.find({ user: id }).populate('user', 'name email');

  if (!agreements || agreements.length === 0) {
    throw new ApiError(404, 'No agreements found for this user');
  }

  // Only allow the user themselves or admin to see
  if (id.toString() !== req.user._id.toString() && req.user.isAdmin !== true) {
    throw new ApiError(403, 'Not authorized to view these agreements');
  }

  res.json(new ApiResponse(200, agreements, 'Agreements fetched successfully'));
});

export { submitAgreement, getAgreementsByUserId };
