# Schoolhub_web

Web application

## Prerequisites

- `node`,`npm`,`mysql`

## Setup

- Clone the project

##### `git clone https://github.com/teamschoolhub/schoolhub_web.git`

- Enter the project directory

##### `cd schoolhub_web`

- Install dependencies

##### `npm install`

- Enter `backend` folder

##### `cd backend`

- Install dependencies

##### `npm install`

- Configure database file
  - `backened` -> `.env`
  - Use your shell or mysql interface and create database called `schoolhub`
  - Import `schema.sql` from `schoolhub_web` folder to your database.

## Run

- Start react app from `schoolhub_web` 
#####`npm start`
- Start express app from `backend` 
####`npm start`
