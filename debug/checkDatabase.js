require('dotenv').config();
const mongoose = require('mongoose');
const Script = require('../models/Script');

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Check for education video
        const educationVideo = await Script.findOne({
            'picture': 'Education/education_3.mp4'
        });
        console.log('Education video found:', !!educationVideo);
        if (educationVideo) {
            console.log('Video details:');
            console.log('- PostID:', educationVideo.postID);
            console.log('- Path:', educationVideo.picture);
            console.log('- Class:', educationVideo.class);
        }

        // List all video paths
        console.log('\nAll video paths:');
        const allVideos = await Script.find({}, 'postID picture class');
        allVideos.forEach(doc => {
            console.log(`ID: ${doc.postID}, Path: ${doc.picture}, Class: ${doc.class}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

checkDatabase();