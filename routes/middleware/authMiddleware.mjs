const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log("User is authenticated, proceeding to next handler.");
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.log("User is not authenticated, redirecting to login.");
    res.redirect('/auth/login'); // Redirect to login page if not authenticated
  }
};

export { isAuthenticated };