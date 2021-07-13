import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from '../Home/Home';
import LogIn from '../LogIn/LogIn';
import './Main.css';

const Main = () => (
  <Switch> {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path='/' component={Home} />
      <Route exact path='/login' component={LogIn} />
  </Switch>
);

export default Main;
