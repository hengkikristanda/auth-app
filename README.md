# iLimits Auth Apps

iLimits authorization and authentication API

## Features

- Authentication and Authorization to iLimits CMS Web

## Technical Requirements

This project is developed with:

- **Node JS version**: 20.11.0
- **Express JS**: 4.18.2

## List of End Point:

1. POST     /auth/users (Request to add new user)
2. GET      /auth/users/:userId? (Request to get all users or user by userId/emailAddress)
3. PUT      /auth/users/:userId (Request to update User Info)
4. POST     /auth/users/resetPassword/:userId (Request to reset password)
5. POST     /auth/users/updatePassword (Request to update password)
6. POST     /auth/users/login (Request to login)
