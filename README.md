# onelayover
## The travel app for flight attendants by flight attendants

The front-end for this project can be found here: [onelayover](https://github.com/JAWeiss89/onelayover).  

### to install, run `npm install`

### to start server, run `node server.js`

### to test, run `jest`

##authentication and authorization
* For all `get` requests requiring authentication/authorization, pass along the _token in the header of the request.
* For all other requests, pass along _token in body of request along with any other requirements expected by that route.

## methods
### users 

* `get "users/"` = _requires admin_. Retrieves list of all users and their limited information such as username, created_at, airline
* `get "users/id"` = _requires authentication_. Retrieves detailed information of user. Returns 404 if no such user. 
* `post "users/"` = Adds new user. Expects following data to be in body in JSON format: `first_name, last_name, email, username, airline.`
* `patch "users/:id"` = _requires admin or same user_ updates user information. Accepts all or any of the  following data to be in body in JSON format: `first_name, last_name, email, username, airline.` 
* `delete "users/:id"` _requires admin or same user_ deletes user

### layovers - _all layover routes require at least authentication_.
* `get "layovers/"` = retrieves list of all layovers and their limited information such as city name, country name, airport code, main-img-url
* `get "layovers/:airport_code"` = retrieves detailed information about that layover including main image and certain amount of activities. 
* `post "layovers/"`= _requires admin_. adds new layover. Expects the following data to be in body in JSON format: `city_name, airport_code, country_name, currency, intl (true/false), main_img_url` 
* `patch "layovers/:airport_code"` = _requires admin_. Updates layover information
* `delete "layovers/:airport_code"` = _requires admin_. deletes layover

### activities - _all activity routes require user authentication_ 
* `get "/layovers/:airport_code/activities"` = retrieves list of all activities for that layover with basic information such as main image, title, and brief description
* `get "/layovers/:airport_code/activities/:activity_id"` = retrieves detailed information about activity
* `post "/layovers/:airport_code/activities"` =  creates new activity
* `patch/delete "layovers/:airport_code/activities/:activity_id"` = (require admin or same user) edits/delete activity

### comments - _all require user authentication_
* `get "/layovers/:airport_code/activities/:activity_id"` = retrieves all comments for certain activity
* `post "/layovers/:airport_code/activities/:activity_id"` = posts comment to activity
* `patch/delete "/layovers/:airport_code/activities/:activity_id/:comment_id"` = (requires admin or same user) edits/delete comment

### activity_photos - _all require user authentication_
* `get "/layovers/:airport_code/activities/:activity_id"` = retrieves information for all images for certain activity
* `post "/layovers/:airport_code/activities/:activity_id"` = adds new image information
* `get "/layovers/:airport_code/activities/:activity_id/:photo_id"` = (requires admin or same user) edits/delete photo