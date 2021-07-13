import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { LOGOUT } from '../../graphQL/mutations/logout';
import { ME } from '../../graphQL/queries/me';
import './UserMenu.css';

interface Person {
  id :string,
  name :string,
  surname :string,
  dateOfBirth ?:string,
  age :string
}

interface User {
  id :string,
  username :string,
  email ?:string,
  person :Person
}

const UserMenu = () => {

  const { data } = useQuery(ME);
  const [me, setMe] = useState<User>();
  const history = useHistory();

  const [logOut] = useMutation(LOGOUT, {
    onCompleted({logout}) {
      console.log(logout);
      if (logout === true)
        window.location.reload();
    }
  })

  useEffect(() => {
    if (data)
      setMe(data.me);
  }, [data]);

  const logInClickHandler = () =>
    history.push('/login');

  const logOutClickHandler = () =>
    logOut();

  return (
  <div className="UserMenu" data-testid="UserMenu">
    {me
      ? <DropdownButton
        title={me.username}
        id="main-nav-user-dropdown"
        className="text-light"
        menuAlign="right"
        variant="outline-light">
        <Dropdown.Item onClick={logOutClickHandler}>Wyloguj się</Dropdown.Item>
      </DropdownButton>
      : <Button className="" variant="outline-light" onClick={logInClickHandler}>
        Zaloguj Się
      </Button>}
  </div>
)};

export default UserMenu;
