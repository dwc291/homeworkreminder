# Homework Reminder

## Overview

Keeping track of all your homeworks, projects and exams can be stressful. It's easy to forget something and miss a deadline. That's where Homework Reminder comes in.

Homework Reminder is a web app that allows users to keep track of all their homeworks/projects and exams. Users can register and login. Once logged in, they can add the different classes they are taking, and a list of homeworks or projects with their due dates. Once they are done with the homework, they can be checked off and will no longer show on their list. They will be able to view their homeworks by class or all of them on a single page. They can also add exam dates which they can check on a seperate page.

## Data Model

The application will store Users, Classes, Homeworks and Exams

* users will have multiple lists of classes
* each list will contain homeworks and exams for that specific class by embedding

An Example User:

```javascript
{
  username: "dwc291",
  hash: // a password hash,
  lists: // an array of references to List documents
}
```

An Example Class List with Embedded Homeworks and Exams:

```javascript
{
  user: // a reference to a User object
  className: "AIT",
  homeworks: [
    { name: "Final Project", dueDate: "04/01/2020", checked: false},
    { name: "Homework 6", dueDate: "04/01/2020", checked: true},
  ],
  exams: [
    { name: "Midterm", date: "03/30/2020", checked: true},
    { name: "Final", date: "05/11/2020", checked: false},
  ]
}
```

## [Link to Commented First Draft Schema](db.js) 

https://github.com/nyu-csci-ua-0480-008-spring-2020/dwc291-final-project/blob/0efd70f120f19c2ec285a71d775f568acf42aa42/src/db.js#L2

## Wireframes

(___TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc._)

/list/create - page for creating a new shopping list

![list create](documentation/list-create.png)

/list - page for showing all shopping lists

![list](documentation/list.png)

/list/slug - page for showing specific shopping list

![list](documentation/list-slug.png)

## Site map

(___TODO__: draw out a site map that shows how pages are related to each other_)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

## User Stories or Use Cases

1. as non-registered user, I can register a new account with the site.
2. as a user, I can log in to the site.
3. as a user, I can create a homework list, classes list and exam list.
4. as a user, I can view all of the homeworks exams or classes as a single list.
5. as a user, I can view homeworks or exams by class.
5. as a user, I can add homeworks, exams or classes to its corresponding existing list.
6. as a user, I can cross off homeworks and exams in its corresponding existing list.

## Research Topics

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
* (3 points) Perform client side form validation using custom JavaScript
    * I'm going to write my own code for client side form validation

8 points total out of 8 required points


## [Link to Initial Main Project File](app.js) 

https://github.com/nyu-csci-ua-0480-008-spring-2020/dwc291-final-project/blob/0efd70f120f19c2ec285a71d775f568acf42aa42/src/app.js#L1

## Annotations / References Used

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)

