# onelayover
## The travel app for flight attendants by flight attendants

The front-end for this project can be found here: [onelayover](https://github.com/JAWeiss89/onelayover).  

### to install, run `npm install`
Will install all dependencies

### to start server, run `node server.js`

### to test, run `jest`
## methods
### users

* `get "users/"` = (requires admin) retrieves list of all users and their limited information such as username, created_at, airline
* `get "users/id"` = (requires admin) retrieves detailed information of user. Returns 404 if no such user. 
* `post "users/"` = adds new user. Expects following data to be in body in JSON format: `first_name, last_name, email, username, airline.`
* `put "users/:id"` = (requires admin or same user) updates user information. Accepts all or any of the  following data to be in body in JSON format: `first_name, last_name, email, username, airline.` 
* `delete "users/:id"` (requires admin or same user) deletes user

### layovers (all require user authentication)
* `get "layovers/"` = retrieves list of all layovers and their limited information such as city name, country name, airport code, main-img-url
* `get "layovers/:airport_code"` = retrieves detailed information about that layover including main image and certain amount of activities. 
* `post "layovers/"`= (requires admin) adds new layover. Expects the following data to be in body in JSON format: `city_name, airport_code, country_name, currency, intl (true/false), main_img_url` 
* `patch "layovers/:airport_code"` = (requires admin) Updates layover information
* `delete "layovers/:airport_code"` = (requires admin) deletes layover

### activities (all require user authentication) 
* `get "/layovers/:airport_code/activities"` = retrieves list of all activities for that layover with basic information such as main image, title, and brief description
* `get "/layovers/:airport_code/activities/:activity_id"` = retrieves detailed information about activity
* `post "/layovers/:airport_code/activities"` = (requires admin) creates new activity
* `patch/delete "layovers/:airport_code/activities/:activity_id"` = (require admin or same user) edits/delete activity

### comments (all require user authentication)
* `get "/layovers/:airport_code/activities/:activity_id"` = retrieves all comments for certain activity
* `post "/layovers/:airport_code/activities/:activity_id"` = posts comment to activity
* `patch/delete "/layovers/:airport_code/activities/:activity_id/:comment_id"` = (requires admin or same user) edits/delete comment

### activity_photos (all requires user authentication)
* `get "/layovers/:airport_code/activities/:activity_id"` = retrieves information for all images for certain activity
* `post "/layovers/:airport_code/activities/:activity_id"` = adds new image information
* `get "/layovers/:airport_code/activities/:activity_id/:photo_id"` = (requires admin or same user) edits/delete photo