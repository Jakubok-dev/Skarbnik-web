import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { FormEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { LOGIN } from '../../graphQL/mutations/login';
import { ME } from '../../graphQL/queries/me';
import './LogIn.css';

const LogIn = () => {

  const { data } = useQuery(ME);
  const history = useHistory();

  useEffect(() => {
    if (data?.me)
      history.push('/');
  }, [data]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [wrongUsernameMessage, setWrongUsernameMessage] = useState("");
  const [wrongPasswordMessage, setWrongPasswordMessage] = useState("");
  const [submitFailMessage, setSubmitFailMessage] = useState("");

  const [login, {error}] = useMutation(LOGIN, {
    onCompleted({login}) {
      console.log(JSON.stringify(login));
      if (login) 
        window.location.reload();
      else 
        setSubmitFailMessage(`Logowanie nie powiodło się`);
    }
  });

  const submitPoll:FormEventHandler = (event) => {

    event.preventDefault();

    let validated = true;

    if (username === ``) {
      setWrongUsernameMessage(`Podaj nazwę użytkownika`);
      validated = false;
    }
    else 
      setWrongUsernameMessage(``);

    if (password === ``) {
      setWrongPasswordMessage(`Podaj hasło`);
      validated = false;
    }
    else
      setWrongPasswordMessage(``);

    if (!validated)
      return;

    login({
      variables: {
        username,
        password
      }
    });

    if (error) {
      console.log(error);
      setSubmitFailMessage(`Logowanie nie powiodło się`);
    }
  }

  return (
  <div className="LogIn fs-5" data-testid="LogIn">
    <div className="container">
      <div className="row">
        <div className="form-body me-auto ms-auto mt-5 p-4 col-md-12 col-lg-10">
           <div className="fs-1 text-center">Zaloguj się</div>
           <Form className="mt-2">
             <div className="form-row">

               <Form.Group controlId="usernameGroup" className="col-md-10 ms-auto me-auto">
                 <Form.Label>Nazwa użytkownika</Form.Label>
                 <Form.Control 
                  type="text" 
                  className="form-control"
                  onChange={(event :any) => setUsername(event.target.value)} />
                  <span className="validation-fail">{wrongUsernameMessage}</span>
               </Form.Group>

               <Form.Group controlId="passwordGroup" className="form-group col-md-10 ms-auto me-auto">
                 <Form.Label>Hasło</Form.Label>
                 <Form.Control 
                  type="password" 
                  className="form-control"
                  onChange={(event :any) => setPassword(event.target.value)} />
                  <span className="validation-fail">{wrongPasswordMessage}</span>
               </Form.Group>

              <div className="text-center mt-4">
                <button 
                  id="btn-submit" 
                  type="submit" 
                  className="btn btn-primary col-md-10"
                  onClick={submitPoll}>Zaloguj</button>
                <br /><span className="validation-fail">{submitFailMessage}</span>
              </div>
             </div>
           </Form>
        </div>
      </div>
    </div>
  </div>
)};

export default LogIn;
