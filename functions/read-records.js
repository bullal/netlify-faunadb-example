// getting a record list in a collection
const faunadb = require('faunadb'); /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_DB_SECRET
})


/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
    /* parse the string body into a useable JS object */
    const data = JSON.parse(event.body);
    console.log('Function `read-records` invoked', data);
    // get users to get the role of the user
    /* construct the fauna query */
    client.query(q.Paginate(q.Match(q.Ref(`indexes/purchases_by_product`), data.product)))
    .then(response => {
      const recordRefs = response.data;
      const getAllTodoDataQuery = recordRefs.map((ref) => {
        return q.Get(ref);
      })
      return client.query(getAllTodoDataQuery);
    })
    .then(response => {
      return client.query(q.Paginate(q.Match(q.Ref(`indexes/sales_by_product`), data.product)))
      .then(res => {
        const recordRefs = res.data;
        const getAllTodoDataQuery = recordRefs.map((ref) => {
          return q.Get(ref);
        })
        return client.query(getAllTodoDataQuery);
      })
      .then(res => {
        const simpleRecord = (records) =>  records.map(record => {
          return {
            quantity: record.data.quantity,
            unitPrice: record.data.unitPrice
          };
        });
        return {
          purchases: response.length > 0 ? simpleRecord(response) : response,
          sales: res.length > 0 ? simpleRecord(res) : res
        };
      });
    })
    .then((response) => {
      console.log('success', response);
      /* Success! return the response with statusCode 200 */
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(response)
      });
    })
    .catch((error) => {
      console.log('error', error);
      /* Error! return the error with statusCode 400 */
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify(error)
      });
    });
  }
