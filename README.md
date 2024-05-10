# Realtime WhiteBoard App

A whiteboard app that demonstrates the feature of realtime tracking of user movements and activitie- In this application, users can create, edit, and move sticky notes. Activities of other users like mouse movement, sticky notes editing etc can be seen in real time. Below is the video that demonstrates app:

https://github.com/keyurparalkar/realtime-whiteboard-app/assets/14138515/63bf30fb-0eb3-42b2-9b68-aefdbb1cf8b8

## Inspiration

This project was inspired from [Figma real time editing](https://www.figma.com/) and [miro's](https://miro.com/) white board functionality.

## Libraries

- FrontEnd

  - [React.js](https://react.dev/)
  - [Supabasejs](https://supabase.com/docs/reference/javascript/introduction)
  - [styled-components](https://styled-components.com/docs/basics)
  - [nanoid](https://github.com/ai/nanoid)

- Backend
  - [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

## Approach

![Project_arch](https://github.com/keyurparalkar/realtime-whiteboard-app/assets/14138515/830f9074-ed3d-49bf-bc84-4231f8c6ffa9)

The project architecture is as follows:

- Whenever a new tab is opened with our project on our browser that means we need to create a new client instance of supabase. So we start by creating a client.
- Next, we create a channel so that the client gets added to that channel
- We listen for the `sync` and `leave` events of the Presence API
- On update of user activity we need to pass this data to all the other clients
- If the browser window is closed, we need to make sure that all the clients won’t contain data related to the removed client.

## Project Setup

- Backend:

  - Setup the Supabase CLI setup by following this [doc](https://supabase.com/docs/guides/cli/getting-started).

- Frontend:
  - `yarn`
  - `yarn dev`
