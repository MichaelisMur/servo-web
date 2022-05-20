import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  gql,
} from "@apollo/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
    uri: "http://localhost:3000/graphql"
});
  
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors)
      if (graphQLErrors[0].message == 'Unauthorized') {
        console.log(graphQLErrors[0])
  
        Client.mutate({ variables: {"refreshToken": localStorage.getItem("refreshToken")},
          mutation: gql`mutation RefreshSession($refreshToken: String!) {
            refreshSession(refreshToken: $refreshToken) {
              accessToken
              accessTokenExpiresIn
              refreshToken
              refreshTokenExpiresIn
            }
          }`,
        }).then(result => {
          console.log("NICEEEE")
          localStorage.setItem("accessToken", result.data.refreshSession.accessToken)
          localStorage.setItem("accessTokenExpiresIn", result.data.refreshSession.accessTokenExpiresIn)
          localStorage.setItem("refreshToken", result.data.refreshSession.refreshToken)
          localStorage.setItem("refreshTokenExpiresIn", result.data.refreshSession.refreshTokenExpiresIn)
  
          window.location.reload();
        }).catch(error => {
          localStorage.clear();
          window.location.replace("/")
        })
      }
  
    if (networkError) console.log(`[Network error]: ${networkError}`);
});
  
const Client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache()
});

export default Client;