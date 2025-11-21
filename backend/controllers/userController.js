// backend/controllers/userController.js

// @desc Get user profile
// @route GET /api/users/profile
const getUserProfile = async (req, res) => {
  try {
    // req.user is available due to the 'protect' middleware
    const user = await req.user.populate("resourcesUploaded");
    res.json(user);
  } catch (error) {
    console.log("ERROR :: userController :: getUserProfile :: Error", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// @desc Update user profile
// @route PUT /api/users/profile
const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    console.log("User Controller :: updateUserProfile :: Data", updates);

    // Your original file had this logic for updates:
    // if (updates.body) {
    //   req.user = { ...req.user, ...updates.body };
    // }
    // NOTE: Object.assign handles merging updates directly onto req.user (a Mongoose document),
    // which is usually cleaner than reconstructing req.user with spread syntax.
    
    // Apply updates directly to the Mongoose document
    Object.assign(req.user, updates);
    
    // If you need to handle specific nested updates or prevent certain fields from being updated,
    // you would add that logic here before saving.

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.log("ERROR :: userController :: updateUserProfile :: Error", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};