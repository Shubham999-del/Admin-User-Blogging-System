<h2>Run 'server.js' to start the application
<h3>Created a nodeJS application using mongoDB as database <br> Authentication as well as authorization has been implemented.<br> The project has the following features : <br><br>
1. An admin, who can perform user management<br><br>
2. For admin (Admin protected routes):<br>
<pre>a. Admin can perform CRUD on users
b. Admin can assign password to each added user
c. Admin can filter users list by 3 filters :-
<pre>i. active/inactive users
ii. Users created in last week, last month or date range </pre></pre><br>
3. For user (User protected routes):
<pre>a. User can login and upload his/her blogs on the portal
b. User can list all blogs posted by him/her with filters as follows :
<pre> i.  Date filter - last week, last month or date range (start date to end date)
 ii. Users can follow each other to see blogs ( eg : User A can follow User B to check A’s blog posts )
 iii.Users can see followers/followings list as well</pre></pre><br><br>
<h3>Mongoose model consists of three entities :- 
<ul>user : containing info about the user<br>
post: containing info about the post including userId of its owner<br>
user_following : containing tuples (A,B)showing user A is being followed by user B where A and B are userId
