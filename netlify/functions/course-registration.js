const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // In a real serverless setup, we would render the EJS template with Netlify functions
    // Here, we're returning the pre-rendered HTML file
    const htmlPath = path.join(__dirname, '../../public/course-registration.html');
    
    // For this demo, we'll create this file as a copy of the modified EJS template
    // In a real application, you'd want to precompile all EJS templates to HTML
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: fs.readFileSync(htmlPath, 'utf8')
    };
  } catch (error) {
    console.error('Error serving course registration page:', error);
    return {
      statusCode: 500,
      body: 'Error loading the course registration page'
    };
  }
}; 