const User = require("../models/uploadedUserData");
const { isValidObjectId } = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^[0-9]{10}$/;

exports.getUsers = async (req, res) => {
  try {
    let users = await User.find({ created_by: req.user.user_id });
    const formattedUsers = users.map((item) => {
      let date = new Date(item.dob);
      let year = date.getUTCFullYear();
      let month = String(date.getUTCMonth() + 1).padStart(2, "0");
      let day = String(date.getUTCDate()).padStart(2, "0");
      return {
        ...item.toObject(),
        dob: `${day}-${month}-${year}`,
      };
    });
    return res.json(formattedUsers);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching users", error: err });
  }
};

exports.updateUser = async (req, res) => {
  try {
    console.log(req.body)
    if (req.body.email && !emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (req.body.mobile && !mobileRegex.test(req.body.mobile)) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Error updating user", error: err });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log(req.params);
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting user", error: err });
  }
};
