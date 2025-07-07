// src/models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider: 'credentials' | 'google' | 'github';
  password?: string; // Only for credentials provider
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for static methods
export interface IUserModel extends Model<IUser> {
  createNew(userData: Partial<IUser>): IUser;
  findByEmail(email: string): Promise<IUser | null>;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  provider: { 
    type: String, 
    enum: ['credentials', 'google', 'github'], 
    required: true,
    default: 'credentials'
  },
  password: { type: String }, // Only required for credentials provider
  emailVerified: { type: Date }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users'
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Static method to create a new user
UserSchema.statics.createNew = function(userData: Partial<IUser>): IUser {
  return new this({
    id: userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: userData.email,
    name: userData.name,
    image: userData.image,
    provider: userData.provider || 'credentials',
    password: userData.password,
    emailVerified: userData.emailVerified
  });
};

// Method to find user by email
UserSchema.statics.findByEmail = function(email: string): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase() });
};

// Pre-save middleware to normalize email
UserSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Export the model
const User = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
