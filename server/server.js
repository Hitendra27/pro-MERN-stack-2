const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

let aboutMessage = "Issue Tracker API v1.0";

const issueDB = [
    {
      id: 1, status: 'New', owner: 'Ravan', effort: 5,
      created: new Date('2018-08-15'), due: undefined,
      title: 'Error in console when clicking Add',
    },
  
    {
      id: 2, status: 'Assigned', owner: 'Eddie', effort: 14,
      created: new Date('2018-08-16'), due: new Date('2018-08-30'),
      title: 'Missing bottom border on panel',
  
    },
    {
      id: 3, status: 'New', owner: 'Sanjay', effort: 7,
      created: new Date('2021-07-7'), due: new Date('2021-07-12'),
      title: 'PRO MERN FULL STACK',
    },
  ];


const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList,
    },
    Mutation: {
        setAboutMessage,
    },
};

function setAboutMessage(_, { message }) {
    return aboutMessage = message;
}

function issueList() {
    return issueDB;
}

const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers,
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' })

app.listen(3000, function(){
    console.log('App started on port 3000');
});