import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Main from './components/Main/Main';
import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import Navbar from './components/Navbar/Navbar';
import { useEffect, useState } from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
import { config } from './config';

import './styles/dark-theme.css';
const stylesList = document.querySelectorAll(`style`);
const darkTheme = stylesList[stylesList.length-1];
darkTheme.id = "dark-theme-style"

const getBackendLink = ():string => {

  const backendprotocol = config.IS_BACKEND_HTTPS === true ? "https" : "http";

  if (config.BACKEND_DOMAIN_IS_THE_SAME_AS_THIS_APP === true)
    return `${backendprotocol}://${window.location.hostname}:${config.BACKEND_PORT}/graphql`;

  return config.BACKEND_URL;
}

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, path }) => {
      return alert(`Graphql error ${message}`);
    });
  }
});

const link = from([
  errorLink,
  new HttpLink({ uri: getBackendLink(), credentials: 'include' })
])

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

function App() {

  const [cookies, setCookie] = useCookies(['user-preferences']);
  const [darkMode, setDarkMode] = useState(
    cookies.darkMode === 'false' ? false : true
  );

  if (cookies.darkMode !== 'true' && cookies.darkMode !== 'false')
    setCookie(`darkMode`, true, { maxAge: 31556926 /* a 1 year */ });

  useEffect(() => {
    if (darkMode && !document.querySelector(`#dark-theme-style`)) {
      document.querySelector(`head`)!.appendChild(darkTheme);
    }
    else if (!darkMode && document.querySelector(`#dark-theme-style`)) {
      darkTheme.remove();
    }

    setCookie(`darkMode`, darkMode, { maxAge: 31556926 /* a 1 year */ });
  }, [darkMode]);

  const darkModeToggle = () => setDarkMode(!darkMode);

  return (
    <div className="App">
      <CookiesProvider />
      <ApolloProvider client={client}>
        <Navbar darkModeToggleHandler={darkModeToggle} darkModeVariable={darkMode} />
        <Main></Main>
      </ApolloProvider>
    </div>
  );
}

export default App;