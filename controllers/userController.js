const User = require("../models/uploadedUserData");

exports.getUsers = async (req, res) => {
  try {
    console.log(req.user)
    let users = await User.find({created_by: req.user.user_id});
    const formattedUsers = users.map((item) => {
      let date = new Date(item.dob);
      let year = date.getUTCFullYear();
      let month = String(date.getUTCMonth() + 1).padStart(2, "0");
      let day = String(date.getUTCDate()).padStart(2, "0");
      return {
        ...item.toObject(),
        dob: `${day}-${month}-${year}`
      };
    });
    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log(req.params)
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err });
  }
};
