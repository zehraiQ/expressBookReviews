const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user)=>{
    return user.username === username;
  });
  if(userswithsamename.length > 0){
    return false;
  } else {
    return true;
  }
}

const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password);
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

// Task 6: Register a new user
regd_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "Customer successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Task 7: Login as a registered user
// Task 7: Login as a registered user
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
  
    // التحقق من مطابقة الحساب
    const validUser = users.find((user) => user.username === username && user.password === password);
    
    if (validUser) {
        // إنشاء التوكن وتخزينه في الجلسة
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
  });

// Task 8: Add or modify a book review
// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;
  
    // التحقق من أن المستخدم قام بتسجيل الدخول
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
  
    // التحقق من كتابة نص المراجعة
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }
  
    // التحقق من وجود الكتاب في قاعدة البيانات
    if (books[isbn]) {
        // إضافة أو تعديل المراجعة الخاصة بهذا المستخدم بالتحديد
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated successfully by user: ${username}` });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
  });

// Task 9: Delete a book review
// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
  
    // التحقق من تسجيل الدخول
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
  
    // التحقق من وجود الكتاب
    if (books[isbn]) {
        // التحقق مما إذا كان المستخدم يملك مراجعة لهذا الكتاب
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username]; // حذف مراجعة هذا المستخدم فقط
            return res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} have been deleted successfully.` });
        } else {
            return res.status(404).json({ message: `No reviews found for ISBN ${isbn} by user ${username}` });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
  });

module.exports = {
  authenticated: regd_users,
  isValid: isValid,
  users: users
};
