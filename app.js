const express = require('express')
const app = express()
module.exports = app
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())

const moviePath = path.join(__dirname, 'moviesData.db')
let db = null
const initializeMovieDbServer = async () => {
  try {
    db = await open({
      filename: moviePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at https://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB error: ${error.message}`)
  }
}
initializeMovieDbServer()

const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

function convertDirectorDbObjectToResponseObject(dbObject) {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const movieQury = `SELECT Movie_name as movieName  FROM movie `
  const movieDetails = await db.all(movieQury)
  response.send(movieDetails)
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const postMovieQuery = `INSERT INTO 
                          movie (director_id, movie_name, lead_actor) 
                          VALUES(
                                ${directorId},
                                '${movieName}',
                                '${leadActor}');`
  const postMovie = await db.run(postMovieQuery)
  const movieId = postMovie.lastID
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getmovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`
  const getMovieDetails = await db.get(getmovieQuery)
  response.send(convertMovieDbObjectToResponseObject(getMovieDetails))
})

app.put('/movies/:movieId/', async (request, response) => {
  const movieDetails = request.body
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `UPDATE 
                              movie
                            SET 
                              director_id=${directorId},
                              movie_name='${movieName}',
                              lead_actor='${leadActor}' 
                            WHERE 
                              movie_id=${movieId};`
  const updateMovieDetails = await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE FROM 
                          movie 
                        WHERE 
                          movie_id=${movieId}`
  const movieDeleted = await db.get(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const directorQury = `SELECT director_id AS directorId,director_name AS directorName FROM director;`
  const directorDetails = await db.all(directorQury)
  response.send(directorDetails)
})

app.get(`/directors/:directorId/movies/`, async (request, response) => {
  const {directorId} = request.params
  const directorQury = `SELECT movie_name as movieName FROM movie WHERE director_id=${directorId}`
  const directorDetails = await db.all(directorQury)
  response.send(directorDetails)
})
