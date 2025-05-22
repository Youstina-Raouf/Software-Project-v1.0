const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true,
        trim: true 
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true 
    },
    role: { 
        type: String,   
        enum: ['Standard', 'Organizer', 'Admin'], 
        default: 'Standard',
        required: true 
    },
    profilePicture: { 
        type: String,
        default: 'default-profile.png'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    lastLogin: { 
        type: Date,
        default: Date.now 
    },
    otp: {
        type: String,
      },
      otpExpiry: {
        type: Date,
      },
      
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for user's full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Always hash the password for new users
    if (this.isNew || this.isModified('password')) {
        console.log('Hashing password for new/modified user...');
        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            console.log('Password hashed successfully');
            
            // Set the hashed password
            this.password = hashedPassword;
        } catch (error) {
            console.error('Error hashing password:', error);
            return next(error);
        }
    }
    next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        // Direct comparison for debugging
        console.log('Password comparison:');
        console.log('Entered password:', enteredPassword);
        console.log('Stored hashed password:', this.password);
        
        // Use bcrypt compare
        const isMatch = await bcrypt.compare(enteredPassword, this.password);
        console.log('Match result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);