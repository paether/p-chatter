# Chatter app

My own implementation of a chat application.

## Features

- Login and Register into the app, using passportjs with express cookie sessions for auth.
- Search for and add users and friends.
- Real time chatting with socket.io

## Tech stack

- TypeScript
- React
- Node / Express
- Socket.io
- PassportJS
- CSS
- HTML5

##Challanges

- The hardest part was about handling multiple conversations concurrently while the user is capable of adding new friends and then updating the UI concurrently
- The session handling of PassportJS / Express to keep users logged in even when the page is refreshed
- Figuring out the special types/interfaces needed for TypeScript
- Since the app uses multiple states which depend on each other the code had to be refactored multiple times to evade useless re-renders of React components

##TODO

- The app is currently optimized for desktop only, mobile version would need lot of collapsable UI elements
- Handle friends requests based on user input and add a seperate UI for accepting/declining friend requests
- Create group chats where user can add multiple friends
