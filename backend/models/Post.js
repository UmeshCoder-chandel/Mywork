import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], default: "image" },
    thumbnail: { type: String, default: null },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, trim: true, default: "" },
    description: { type: String, default: "" },
    media: [mediaSchema],
    category: { type: String, index: true },
    location: {
      city: String,
      state: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
postSchema.index({ title: "text", description: "text" });

// compatibility virtuals for older frontend expecting .desc, .image, .video
postSchema.virtual('desc').get(function () {
  return this.description;
});
postSchema.virtual('image').get(function () {
  return this.media && this.media.length ? (this.media[0].type === 'image' ? this.media[0].url : '') : '';
});
postSchema.virtual('video').get(function () {
  return this.media && this.media.length ? (this.media[0].type === 'video' ? this.media[0].url : '') : '';
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model("Post", postSchema);
export default Post;