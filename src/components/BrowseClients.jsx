const User = require('../models/user');
const { districtByGovernorate } = require('../constants/data');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    if (!users || users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No users found' 
      });
    }
    return res.status(200).json({ 
      success: true,
      data: { users },
      count: users.length
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

const createUser = async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide valid user information' 
      });
    }
    const user = new User(body);
    const createdUser = await user.save();
    return res.status(201).json({ 
      success: true,
      data: { user: createdUser } 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: 'Failed to create user',
      error: error.message 
    });
  }
};

const getSpecialists = async (req, res) => {
  try {
    const { governorate, district, specialty } = req.query;
    const query = { role: 'specialist', isAvailable: true };
    
    if (governorate) query.governorate = governorate;
    if (district) query.district = district;
    if (specialty) query.specialty = specialty;

    const specialists = await User.find(query)
      .select('-password -__v')
      .lean();

    res.status(200).json({
      success: true,
      data: { specialists },
      count: specialists.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch specialists',
      error: error.message 
    });
  }
};

const getClients = async (req, res) => {
  try {
    const { governorate, district, specialty, needsMySpecialty } = req.query;
    const query = { role: 'client' };
    
    // Location filters
    if (governorate) {
      if (!Object.keys(districtByGovernorate).includes(governorate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid governorate provided'
        });
      }
      query.governorate = governorate;
    }
    
    if (district) {
      if (governorate && !districtByGovernorate[governorate].includes(district)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid district for the specified governorate'
        });
      }
      query.district = district;
    }
    
    // Specialty filter
    if (needsMySpecialty === 'true' && specialty) {
      query['neededSpecialists'] = {
        $elemMatch: {
          name: specialty,
          isNeeded: true
        }
      };
    }

    const clients = await User.find(query)
      .select('-password -__v')
      .lean();

    res.status(200).json({
      success: true,
      data: { clients },
      count: clients.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

const updateNeededSpecialists = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false,
        message: 'Only clients can update needed specialists' 
      });
    }
    
    const { specialists } = req.body;
    if (!specialists || !Array.isArray(specialists)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid array of specialists'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { neededSpecialists: specialists },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update needed specialists',
      error: error.message
    });
  }
};

const updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'specialist') {
      return res.status(403).json({ 
        success: false,
        message: 'Only specialists can update availability' 
      });
    }
    
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid boolean value for availability'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  getSpecialists,
  getClients,
  updateNeededSpecialists,
  updateAvailability
};