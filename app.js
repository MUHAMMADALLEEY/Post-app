const express = require('express');
const cookieParser = require('cookie-parser');
const usermodel = require('./models/user');
const postmodel = require('./models/post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render("index");
});

app.get('/login', (req, res) => {
  res.render("login");
});

app.post('/register', async (req, res) => {
  let { username, name, age, email, password } = req.body;

  // Check if user already exists
  const user = await usermodel.findOne({ email });
  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let newUser = await usermodel.create({
        username,
        name,
        age,
        email,
        password: hash
      });

      let token = jwt.sign({ email, userid: newUser._id }, "shhhh");
      res.cookie("token", token);
      res.send("User registered successfully");
    });
  });
});

app.post('/login', async (req, res) => {
  let { email, password } = req.body;
  const user = await usermodel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email, userid: user._id }, "shhhh");
      res.cookie("token", token);
       res.redirect('/profile');
// res.send("Tekh a tara gal kam")   
} else {
      res.status(400).json({ message: 'Invalid email or password akha khol k likh' });
    }
  });
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect("/login");
});

// Profile page (protected route)
app.get('/profile', Islogin, async(req, res) => {
//   res.render("profile", { user: req.user }); 
   // Render profile page with user data

   let user=await usermodel.findOne({email:req.user.email}).populate("posts");
   //console.log(user);
 res.render("profile",  {user})
});
app.get('/like/:id', Islogin, async (req, res) => {
  try {
    // Find the post by its ID and populate the 'user' field (author of the post)
    let post = await postmodel.findOne({ _id: req.params.id }).populate("user");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Check if the user has already liked the post
    const userIndex = post.likes.indexOf(req.user._id);

    if (userIndex === -1) {
      // If the user hasn't liked the post, 
      post.likes.push(req.user._id);
    } else {
    // remove their like
      post.likes.splice(userIndex, 1);
    }

    // Save the post with the updated 'likes' array
    await post.save();

    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post('/post', Islogin, async(req, res) => {
    //who's logged in
       let userss=await usermodel.findOne({email:req.user.email});
    let post=await postmodel.create({
        user:userss._id,
        content:req.body.content,
    });
    //user ko btana h us na post ki h
    userss.posts.push(post._id);
    await userss.save();
    res.redirect('/profile');
    });

    app.get('/edit/:id', Islogin, async (req, res) => {
      try {
        // Find the post by its ID and populate the 'user' field (author of the post)
        let post = await postmodel.findOne({ _id: req.params.id }).populate("user");
            if (!post) {
          return res.status(404).send("Post not found");
        }
    
        // Ensure that the logged-in user is the author of the post
        if (post.user._id.toString() !== req.user.userid.toString()) {
          return res.status(403).send("You are not authorized to edit this post");
        }
            res.render("edit", { post });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    });

    
    app.post('/update/:id', Islogin, async (req, res) => {
      try {
        let post = await postmodel.findOne({ _id: req.params.id });
  
    
        post.content = req.body.content;  // Update only the content field
    
        await post.save();
    
        res.redirect("/profile");
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    });
    

// Middleware to check if user is logged in liek s Protected route
function Islogin(req, res, next) {
  if (!req.cookies.token) {
    // return res.redirect('/login');
      // Redirect if token is missing
 res.send("Please Login First");
    }

  else{try {
    let data = jwt.verify(req.cookies.token, "shhhh");
    req.user = data;  // Store user data in the request
    next();  // Proceed to the profile page
  } catch (err) {
    return res.redirect('/login');  
  }}
}


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
