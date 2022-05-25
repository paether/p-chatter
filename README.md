My own implementation of a chat application.

## Main Features

- Login and Register into the app, using passportjs with express cookie sessions for auth.
- Search for and add users and friends.
- Real time chatting with socket.io
- Notifications of unread messages when user is offline and/or chat is not currently open.
- Online status of friends displayed.

## Challanges

- The hardest part was handling multiple conversations concurrently while the user is capable of adding new friends and then updating the UI concurrently. Multiple iteration of the that specific codebase was needed as I was adding more and more capabilites to make sure no useless re-renders of the components were happening.
- The session handling of PassportJS / Express with socket.io to keep users logged in even when the page is refreshed. I had to dig deep into documentations on how to synchronize express-passport-socketio login/logout sessions with cookies which took multiple days.
- Figuring out the special types/interfaces needed for TypeScript which was cumbersome but very worth it in during testing and when adding new capabilites to the app.

## Tech stack

- TypeScript
- React
- Node / Express
- Socket.io
- PassportJS
- CSS
- HTML5

## Planned future improvements

- The app is currently optimized for desktop only, mobile version would need an almost new design with lot of collapsable UI elements.
- Widen friends request functions based on user input and add a seperate UI for accepting/declining the requests.
- Create group chats where user can add multiple friends.
