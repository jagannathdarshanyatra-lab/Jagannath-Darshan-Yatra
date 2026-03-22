const Faq = require('../models/Faq');

/**
 * @desc    Get all active FAQs (public)
 * @route   GET /api/faqs
 * @access  Public
 */
exports.getAllFaqs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Faq.countDocuments({ isActive: true });
    const faqs = await Faq.find({ isActive: true })
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: faqs.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      faqs
    });
  } catch (err) {

    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch FAQs'
    });
  }
};

/**
 * @desc    Get all FAQs for admin (including inactive)
 * @route   GET /api/faqs/admin/all
 * @access  Private/Admin
 */
exports.getAllFaqsAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Faq.countDocuments();
    const faqs = await Faq.find().sort({ order: 1 }).skip(skip).limit(limit);
    
    res.status(200).json({
      success: true,
      count: faqs.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      faqs
    });
  } catch (err) {

    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch FAQs'
    });
  }
};

/**
 * @desc    Get single FAQ by ID
 * @route   GET /api/faqs/:id
 * @access  Private/Admin
 */
exports.getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }
    
    res.status(200).json({
      success: true,
      faq
    });
  } catch (err) {

    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to fetch FAQ'
    });
  }
};

/**
 * @desc    Create new FAQ
 * @route   POST /api/faqs
 * @access  Private/Admin
 */
exports.createFaq = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;
    
    // If no order specified, put it at the end
    let faqOrder = order;
    if (faqOrder === undefined) {
      const maxOrderFaq = await Faq.findOne().sort({ order: -1 });
      faqOrder = maxOrderFaq ? maxOrderFaq.order + 1 : 0;
    }
    
    const faq = await Faq.create({
      question,
      answer,
      order: faqOrder,
      isActive: isActive !== undefined ? isActive : true
    });
    

    
    res.status(201).json({
      success: true,
      faq
    });
  } catch (err) {

    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to create FAQ'
    });
  }
};

/**
 * @desc    Update FAQ
 * @route   PUT /api/faqs/:id
 * @access  Private/Admin
 */
exports.updateFaq = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;
    
    let faq = await Faq.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }
    
    // Update fields
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;
    
    await faq.save();
    

    
    res.status(200).json({
      success: true,
      faq
    });
  } catch (err) {

    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to update FAQ'
    });
  }
};

/**
 * @desc    Delete FAQ
 * @route   DELETE /api/faqs/:id
 * @access  Private/Admin
 */
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }
    
    await faq.deleteOne();
    

    
    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (err) {

    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to delete FAQ'
    });
  }
};

/**
 * @desc    Reorder FAQs
 * @route   PUT /api/faqs/reorder
 * @access  Private/Admin
 */
exports.reorderFaqs = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of FAQ IDs in order'
      });
    }
    
    // Update order for each FAQ
    const updatePromises = orderedIds.map((id, index) => 
      Faq.findByIdAndUpdate(id, { order: index }, { new: true })
    );
    
    await Promise.all(updatePromises);
    

    
    // Return updated list
    const faqs = await Faq.find().sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      faqs
    });
  } catch (err) {

    res.status(500).json({
      success: false,
      error: 'Server Error: Unable to reorder FAQs'
    });
  }
};
