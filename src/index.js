import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import {
  ApolloProvider,
} from "@apollo/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import Client from './Client'

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <Router>
    <ApolloProvider client={Client}>
          <App />
    </ApolloProvider>
  </Router>
);