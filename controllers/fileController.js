const xlsx = require("xlsx");
const User = require("../models/uploadedUserData");
const fs = require("fs");
const path = require("path");

exports.uploadUsers = async (req, res) => {
  console.log("Uploaded File Data:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const filePath = req.file.path.replace(/\\/g, "/");
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res
        .status(400)
        .json({ message: "No sheets found in the uploaded file" });
    }

    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!rawData || rawData.length < 2) {
      return res
        .status(400)
        .json({ message: "Uploaded file is empty or incorrectly formatted" });
    }

    //change the convert date into actual date
    const isExcelDate = (value) => typeof value === "number" && value > 30000;
    const excelSerialToDate = (serial) => {
      const date = new Date((serial - 25569) * 86400000);
      return date.toISOString().split("T")[0].split("-").reverse().join("-");
    };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidMobile = (mobile) => /^\d{10}$/.test(mobile);
    const isValidDOB = (dob) => /^\d{2}-\d{2}-\d{4}$/.test(dob);

    const headers = rawData[0].map((header) => header.trim());
    let users = rawData.slice(1).map((row) => {
      return headers.reduce((obj, key, index) => {
        key = key.toLowerCase().split(" ").join("_");
        obj[key] = row[index] || "";
        if (key === "dob" && isExcelDate(row[index])) {
          obj[key] = excelSerialToDate(row[index]);
        }
        return obj;
      }, {});
    });

    let invalidUsers = [];
    users = users.map((item, index) => {
      item.gender =
        item.gender.charAt(0).toUpperCase() +
        item.gender.slice(1).toLowerCase();

      if (!isValidMobile(item.mobile)) {
        invalidUsers.push({
          row: index + 2,
          field: "mobile",
          value: item.mobile,
          error: "Invalid mobile number (must be 10 digits)",
        });
      }

      //validate email format
      if (!isValidEmail(item.email)) {
        invalidUsers.push({
          row: index + 2,
          field: "email",
          value: item.email,
          error: "Invalid email format",
        });
      }

      //validate DOB format
      if (!isValidDOB(item.dob)) {
        invalidUsers.push({
          row: index + 2,
          field: "dob",
          value: item.dob,
          error: "Invalid DOB format (must be DD-MM-YYYY)",
        });
      }
      item.created_by = req.user.user_id
      return item;
    });

    if (invalidUsers.length > 0) {
      return res.status(400).json({
        message: "Validation errors found in uploaded file",
        errors: invalidUsers,
      });
    }

    await User.insertMany(users);
    return res.json({ message: "Users imported successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error processing file", error: err.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find({created_by: req.user.user_id});

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    const formatKey = (key) => {
      return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const usersData = users.map((user) => {
      const userObj = user.toObject();
      userObj.dob = userObj.dob.toISOString().split("T")[0].split("-").reverse().join("-");
      console.log(user)
      delete userObj._id;
      delete userObj.updated_at;
      delete userObj.created_at;
      delete userObj.__v;

      const formattedUser = {};
      Object.keys(userObj).forEach((key) => {
        const newKey = formatKey(key);
        formattedUser[newKey] = userObj[key];
      });

      return formattedUser;
    });

    const worksheet = xlsx.utils.json_to_sheet(usersData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Users");

    const filePath = path.join(__dirname, "../uploads/users.xlsx");
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, "users.xlsx", (err) => {
      if (err) {
        console.error("Download Error:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
      setTimeout(() => fs.unlinkSync(filePath), 5000);
    });
  } catch (err) {
    console.error("Export Error:", err);
    res
      .status(500)
      .json({ message: "Error exporting users", error: err.message });
  }
};
