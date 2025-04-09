const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require('express-session')
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}


const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    //You have to give a review as a request query
    const review = req.query.review;
    //get posted with the username (stored in the session) posted
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    
    if (!review || review.trim() === "") {
        return res.status(400).send("Review cannot be empty.");
    }
    if (!books[isbn]) {
        return res.status(404).send("Book with the given ISBN not found.");
    }
    

    books[isbn].reviews[username]={review: review}
    return res.status(200).send("review was added/updated");

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).send("Book was not found.");
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).send("Review was not found.");
    }

    delete books[isbn].reviews[username]

    return res.send("review was deleted.");


})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
