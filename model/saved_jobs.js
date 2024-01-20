const mongoose = require('mongoose');

const savedJobsSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        ref: 'User',
        required: true
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    job_id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
    },
    company: {
        type: String,
    },
    min_salary_usd: {
        type: Number,
    },
    max_salary_usd: {
        type: Number,
    },
    location_iso: {
        type: String,
    },
    job_type: {
        type: String,
        // enum: ['full_time','part_time','freelance','internship','co_founder'],
    },
    degree_required: {
        type: Boolean,
    },
    url: {
        type: String,
    },
    technologies: {
        type: String,
        // enum: ['html','css','react','vue','angular','node','python','typescript','nextjs','javascript','java','csharp','php','go','rust','swift','kotlin','sql','mongodb','postgres','mysql','docker','kubernetes','aws','reactnative','flutter','django','spring','laravel','web3','c++','graphql','solidity'],
    },
    resume: {
        type: Buffer, // Assuming you store the PDF as a binary buffer
    }
});

const SavedJobs = mongoose.model('SavedJobs', savedJobsSchema);

module.exports = SavedJobs;
