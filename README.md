# Northcoders News API

## Packages

To run this project locally you will need to run `npm install` to install required packages

## Environment Variables

This project uses `.env` files to manage environment-specific configurations. These files are ignored by Git for security reasons, meaning they will not be included when cloning the repository.
Follow the steps below:

Create two `.env` files for your project:

- .env.test
- .env.development.

Into each, add `PGDATABASE=`, with the correct database name for that environment (see /db/setup.sql for the database names).

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
