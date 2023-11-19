const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.get('/getLatestPost', (req, res) => {
  const data = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'),
  );
  // Assuming the latest post is at the end
  const latestPost = data.posts[data.posts.length - 1];
  res.json(latestPost);
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});

const upload = multer({storage: storage});

// Middleware to parse POST requests
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

app.post(
    '/updateData',
    (req, res, next) => {
      upload.array('images')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(500).send('Error uploading file.');
        } else if (err) {
          console.error('Unknown upload error:', err);
          return res.status(500).send('Unknown error.');
        }

        // If everything is fine, continue to the next middleware.
        next();
      });
    },
    (req, res) => {
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);

      fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        const jsonData = JSON.parse(data);

        // Determine the next ID
        // If there are no posts, start with ID 1
        // otherwise, increment the highest ID by 1
        const nextId = jsonData.posts.length > 0 ?
        Math.max(...jsonData.posts.map((post) => post.id)) + 1 : 1;

        const newPost = {
          id: nextId, // Use the calculated next ID here
          title: req.body.title,
          author: req.body.author,
          date: req.body.date,
          description: req.body.description,
          content: req.body.content,
          images: req.files.map((file) => file.path),
        };

        jsonData.posts.push(newPost);

        fs.writeFile(
            'data.json',
            JSON.stringify(jsonData, null, 2),
            (writeErr) => {
              if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Internal Server Error');
              }
              res.status(200).send('Post Added Successfully');
            },
        );
      });
    },
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
