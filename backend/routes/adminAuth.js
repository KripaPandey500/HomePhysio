const bcrypt = require("bcrypt");
const User = require("../models/User"); // adjust path

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // STOP execution after sending response
      return res.status(401).json({ message: "Wrong email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong email or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }

    // Only this line executes if everything is correct
    return res.status(200).json({ message: "Admin login successful" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
