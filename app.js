const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config")
const app = express();
const axios = require('axios');

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const User = require("./model/user");
const SavedJobs = require("./model/saved_jobs");

app.listen(3000, () => {
    console.log("Server running on port 3000...")
});

// mongooseDB connection
mongoose.connect(
    process.env.DB_CONNECTION, (req, res) => {
    console.log("Connection to DB established")
});

app.post("/user", async (req, res) => {
    try{
        const { first_name, last_name, email, password } = req.body;

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // If the email is already in use, respond with an error
            return res.status(400).json({ error: 'Email is already in use' });
        }

        const newUser = new User({ first_name, last_name, email, password });
        await newUser.save();
        // res.json(newUser);
        res.status(201).json({ message: 'User created successfully', user_id: newUser.user_id });

    }catch(err){
        console.error('Error creating user:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/user', async (req, res) => {
    try {
      const user_id = req.query.user_id;
      const user = await User.findOne({ user_id });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(user);
    } catch (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.put('/user', async (req, res) => {
    try {
      const userIdToUpdate = req.query.user_id;
      const emailVerification = req.body.email;
      // Check if the email is already in use
      if (emailVerification) {
        const existingUser = await User.findOne({ email: emailVerification });

        if (existingUser) {
            // If the email is already in use, respond with an error
            return res.status(400).json({ error: 'Email is already in use' });
        }
      }

      // Using findOneAndUpdate to find and update the user in one operation
      const updateFields = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: emailVerification,
        password: req.body.password,
      };
      const user = await User.findOneAndUpdate(
        { user_id: userIdToUpdate },
        { $set: updateFields }, // Use $set to update only the provided fields in req.body
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(202).json({ message: 'User updated successfully' });
    } catch (err) {
      console.error('Error updating user:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/user', async (req, res) => {
    const userIdToDelete = req.query.user_id;
  
    try {
      const deletedUser = await User.findOneAndDelete({ user_id: userIdToDelete });
  
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (err) {
      console.error('Error deleting user:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find a user with the provided email and password
        const user = await User.findOne({ email, password });

        if (user) {
        // User exists, authentication successful
        res.status(200).json({ message: 'Authentication successful', user_id: user.user_id });
        } else {
        // User not found or password incorrect
        res.status(401).json({ error: 'Authentication failed. Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during authentication:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/fetchJobs', async (req, res) => {
    try {
        const LIMIT = 30; // No of jobs to fetch
        const response = await axios.get(
        `https://api.crackeddevs.com/api/get-jobs?limit=${LIMIT}`,
        {
            headers: {
            'api-key': process.env.API_KEY, // API KEY HERE
            },
        }
        );
        const jobsData = response.data;
        res.json(jobsData);
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add another route to filter and send the results to the frontend
app.get('/filteredJobs', async (req, res) => {
    try {
      // Fetch jobs data using the /fetchJobs route
      const response = await axios.get(`http://localhost:3000/fetchJobs`);
      const jobsData = response.data;
  
      // Extract filter criteria from request query parameters
      const {
        company,
        min_salary,
        max_salary,
        location_iso,
        job_type,
        skill_levels,
        degree_required,
        technologies,
      } = req.query;
  
      // Perform filtering logic based on criteria
      const filteredJobs = jobsData.filter(job => {

        // Filtering based on image_url
        // if(job.image_url === "" || job.image_url){
        //     return false;
        // }

        // Filtering based on company
        if (company && job.company.toLowerCase() !== company.toLowerCase()) {
          return false;
        }
  
        // Filtering based on min_salary
        if (min_salary && job.min_salary_usd < Number(min_salary)) {
          return false;
        }
  
        // Filtering based on max_salary
        if (max_salary && job.max_salary_usd > Number(max_salary)) {
          return false;
        }
  
        // Filtering based on location_iso
        if (location_iso && job.location_iso.toLowerCase() !== location_iso.toLowerCase()) {
          return false;
        }
  
        if (job_type) {
            if (job.job_type === null){
                return false;
            }
            const requiredJobType = job_type.split(',');
        
            if (!requiredJobType.some(type => job.job_type.includes(type))) {
            return false;
            }
        }
  
        // Filtering based on skill_levels
        if (skill_levels && !skill_levels.split(',').includes(job.skill_level)) {
          return false;
        }
  
        // Filtering based on degree_required
        if (degree_required && job.degree_required !== (degree_required === 'true')) {
          return false;
        }
  
        // Filtering based on technologies
        if (technologies) {
            if (job.technologies === null){
                return false;
            }
            const requiredTechnologies = technologies.split(',');
        
            if (!requiredTechnologies.some(tech => job.technologies.includes(tech))) {
            return false;
            }
        }
  
  
        // If all criteria pass, include the job in the filtered result
        return true;
      });
  
      res.json(filteredJobs);
    } catch (error) {
      console.error('Error filtering jobs:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
app.post("/savedJobs", async (req, res) => {
    try{
        const user_id = req.query.user_id;
        const user = await User.findOne({ user_id });

        if (!user) {
        return res.status(404).json({ error: 'User not found' });
        }
        const first_name = user.first_name;
        const last_name = user.last_name;
        const email = user.email;
        const { job_id, title, company, min_salary_usd, max_salary_usd, location_iso, job_type, degree_required, url, technologies, resume } = req.body;
        const newSavedJob = new SavedJobs({ user_id, first_name, last_name, email, job_id, title, company, min_salary_usd, max_salary_usd, location_iso, job_type, degree_required, url, technologies, resume });
        await newSavedJob.save();
        res.status(201).json({ message: 'Job saved successfully' });
    }catch(err){
        console.error('Error saving job:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/savedJobs", async (req, res) => {
    try {
        const userId = req.query.user_id;

        // Find all saved jobs for the given user_id
        const savedJobs = await SavedJobs.find({ user_id: userId });

        res.json(savedJobs);
    } catch (error) {
        console.error('Error fetching saved jobs:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});