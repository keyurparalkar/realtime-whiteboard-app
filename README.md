# Outline

- Introduction - What is this proiject about?
- Inspiration
- Libraries used
- Approach

# Realtime WhiteBoard App

A whiteboard app that demonstrates the feature of realtime tracking of user movements and activitie- In this application, users can create, edit, and move sticky notes. Activities of other users like mouse movement, sticky notes editing etc can be seen in real time. Below is the video that demonstrates app:

video

## Inspiration

This project was inspired from Figma real time editing and miro's white board functionality.

## Libraries

- FrontEnd

  - React.js
  - Supabasejs
  - styled-components
  - nanoid

- Backend
  - Supabase(docker setup)

## Approach

project-arch-image

The project architecture is as follows:

- Whenever a new tab is opened with our project on our browser that means we need to create a new client instance of supabase. So we start by creating a client.
- Next, we create a channel so that the client gets added to that channel
- We listen for the `sync` and `leave` events of the Presence API
- On update of user activity we need to pass this data to all the other clients
- If the browser window is closed, we need to make sure that all the clients won’t contain data related to the removed client.
