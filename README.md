# Northcoders News API

## Link to the Hosted Version

This project is hosted on Render. You can access the live API by clicking [here](https://my-nc-news-uzz7.onrender.com/api)

## About the project

This project provides a backend API to manage articles, topics, users, comments for a website.

### Key Features:

- **RESTful API Endpoints**: Implements standard HTTP methods (GET, POST, PUT/PATCH, DELETE) for CRUD operations on articles, topics, comments, and users.
- **Error Handling**: error handling mechanisms to handle unexpected errors and provide informative error messages.
- **Test-Driven Development**: tested using Jest and Supertest to ensure code quality, reliability, and maintainability.

### Technologies Used

The project was built using JavaScript, Node.js, Express, PostgreSQL.

## Getting Started

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/jjaybah/my-nc-news
   ```

2. Change git remote url to avoid accidental pushes to base project

   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```

3. Install NPM packages

   ```sh
   npm install
   ```

   Minimum required versions: Node.js > 22.8, Postgres > 14.13

4. Setup databases

   ```sh
   npm run setup-dbs
   npm run seed
   ```

5. Run tests

   ```sh
   npm test app
   ```

### Environment Variables

This project uses `.env` files to manage environment-specific configurations. These files are ignored by Git for security reasons, meaning they will not be included when cloning the repository.
Follow the steps below:

1. Create two `.env` files for your project:

- .env.test
- .env.development.

Into each, add `PGDATABASE=`, with the correct database name for that environment (see /db/setup.sql for the database names).

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
