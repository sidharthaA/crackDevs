// const mongoose = require('mongoose');

// const userPreferencesSchema = new mongoose.Schema({
//     user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     min_salary_usd: {
//         type: Number,
//         required: true
//     },
//     max_salary_usd: {
//         type: Number,
//         required: true
//     },
//     location_iso: {
//         type: [String],
//         required: true
//     },
//     job_type: {
//         type: [String],
//         enum: ['full-time', 'part-time', 'contract'],
//         required: true
//     },
//     degree_required: {
//         type: Boolean,
//         required: true
//     },
//     technologies: {
//         type: [String],
//         required: true
//     },
//     resume: {
//         type: Buffer, // Assuming you store the PDF as a binary buffer
//         required: true
//     }
// });

// const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

// module.exports = UserPreferences;
