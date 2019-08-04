// getting a record list in a collection
const faunadb = require('faunadb') /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_DB_SECRET
})


/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
    /* parse the string body into a useable JS object */
    const data = JSON.parse(event.body)
    console.log('Function `todo-create` invoked', data)
    // get users to get the role of the user
    /* construct the fauna query */
    client.query(q.Paginate(q.Match(q.Ref(`indexes/${data.collection}_by_product`), data.product)))
    .then(response => response.data.map(record => client.query(q.Get(record))))
    .then((response) => {
      console.log('success', response)
      /* Success! return the response with statusCode 200 */
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(response)
      })
    })
    .catch((error) => {
      console.log('error', error)
      /* Error! return the error with statusCode 400 */
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify(error)
      })
    })
  }
