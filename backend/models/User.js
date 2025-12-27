import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['worker', 'client', 'admin'],
      default: 'client',
    },
    profession: {
      type: String,
      enum: [
        'Plumber', 'Electrician', 'Labour', 'Painter', 'Carpenter', 'Mason', 'Welder', 'Tile Worker', 'AC Mechanic', 'House Cleaner',
        'Gardener', 'Security Guard', 'HVAC Technician', 'Roofer', 'Flooring Specialist', 'Locksmith', 'Appliance Repair Technician', 'Landscaper', 'Pest Control Technician', 'Automotive Mechanic',
        'Bricklayer', 'Concrete Finisher', 'Cabinet Maker', 'Drywaller', 'Elevator Technician', 'Fence Installer', 'Glazier', 'Insulation Installer', 'Ironworker', 'Plasterer',
        'Pipefitter', 'Scaffold Erector', 'Sheet Metal Worker', 'Solar Panel Installer', 'Sprinkler System Installer', 'Structural Engineer', 'Tile Setter', 'Upholsterer', 'Waterproofer', 'Window Installer',
        'Cabinet Installer', 'Demolition Worker', 'Excavator Operator', 'Forklift Operator', 'Crane Operator', 'Heavy Equipment Operator', 'Spray Painter', 'Road Construction Worker', 'Sanitation Worker', 'Steel Fabricator',
        'Traffic Controller', 'Trenching Operator', 'Weld Inspector', 'Masonry Cleaner', 'HVAC Installer', 'Fire Protection Technician', 'Hazardous Material Handler', 'Insulation Technician', 'Lift Technician', 'Cable Technician'
      ],
    },
    location: {
      type: String,
    },
    experience: {
      type: Number, // in years
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    otpCode: {
      type: String,
      select: false
    },
    otpExpires: {
      type: Date,
      select: false
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

const User= mongoose.model('User', userSchema);
export default User;
