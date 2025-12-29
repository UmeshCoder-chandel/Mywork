import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import PhoneRequest from "../models/PhoneRequest.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q || "";
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .limit(20)
      .select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    const follow = await Follow.findOneAndUpdate(
      { follower: req.user._id, following: targetId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (req.user._id.toString() !== targetId) {
      await Notification.create({
        user: targetId,
        sender: req.user._id,
        type: "follow",
      });
    }
    res.json({ follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    await Follow.findOneAndDelete({
      follower: req.user._id,
      following: req.params.id,
    });
    res.json({ message: "Unfollowed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id }).populate(
      "follower",
      "-password"
    );
    res.json({ followers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id }).populate(
      "following",
      "-password"
    );
    res.json({ following });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const suggestUsers = async (req, res) => {
  try {
    // Find users the current user already follows
    const following = await Follow.find({ follower: req.user._id }).select('following');
    const followingIds = following.map((f) => String(f.following));
    followingIds.push(String(req.user._id)); // exclude self
    // Try to suggest users in same profession first
    const me = await User.findById(req.user._id).select('profession');
    const query = {
      _id: { $nin: followingIds },
    };
    if (me && me.profession) {
      query.profession = me.profession;
    }
    let suggestions = await User.find(query).limit(5).select('-password');
    // if not enough, fill with random users
    if (suggestions.length < 5) {
      const extra = await User.find({ _id: { $nin: followingIds.concat(suggestions.map(s => String(s._id))) } }).limit(5 - suggestions.length).select('-password');
      suggestions = suggestions.concat(extra);
    }
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestPhoneNumber = async (req, res) => {
  try {
    const ownerId = req.params.id;
    if (String(ownerId) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot request your own phone number" });
    }
    const owner = await User.findById(ownerId);
    if (!owner || !owner.phone) {
      return res.status(404).json({ message: "User or phone number not found" });
    }
    // Check if there's already a pending or approved request
    const existingRequest = await PhoneRequest.findOne({
      requester: req.user._id,
      owner: ownerId,
      status: { $in: ["pending", "approved"] },
    });
    if (existingRequest) {
      if (existingRequest.status === "approved") {
        return res.json({ message: "Request already approved", phone: owner.phone });
      }
      return res.json({ message: "Request already pending", request: existingRequest });
    }
    const phoneRequest = await PhoneRequest.create({
      requester: req.user._id,
      owner: ownerId,
      status: "pending",
    });
    await Notification.create({
      user: ownerId,
      sender: req.user._id,
      type: "phone_request",
      meta: { requestId: phoneRequest._id },
    });
    res.json({ message: "Phone number request sent", request: phoneRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPhoneRequestStatus = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const request = await PhoneRequest.findOne({
      requester: req.user._id,
      owner: ownerId,
      status: { $in: ["pending", "approved"] },
    });
    if (!request) {
      return res.json({ status: "none" });
    }
    if (request.status === "approved") {
      const owner = await User.findById(ownerId).select("phone");
      return res.json({ status: "approved", phone: owner?.phone });
    }
    return res.json({ status: "pending", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approvePhoneRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await PhoneRequest.findById(requestId).populate("requester", "name");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (String(request.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to approve this request" });
    }
    request.status = "approved";
    await request.save();
    const owner = await User.findById(req.user._id).select("phone");
    await Notification.create({
      user: request.requester._id,
      sender: req.user._id,
      type: "phone_request",
      meta: { requestId: request._id, approved: true, phone: owner?.phone },
    });
    res.json({ message: "Phone request approved", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const denyPhoneRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await PhoneRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (String(request.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to deny this request" });
    }
    request.status = "denied";
    await request.save();
    res.json({ message: "Phone request denied", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

