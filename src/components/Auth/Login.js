import React, {useState} from 'react'
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import firebase from '../../firebase'

import './Register.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({
        message : ''
    })
    const [loading, setLoading] = useState(false)


    const handleSubmit = (e) => {
        e.preventDefault()
        if(isFormValid(email, password)) {
            setErrors('')
            setLoading(true)
            firebase
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then(signedInUser => {
                    console.log(signedInUser)
                })
                .catch(err => {
                    console.error(err)
                    setErrors({message : err.message})
                    setLoading(false)
                })
        }
    }

    const isFormValid = (email, password) => email && password

    const checkInputError = (inputText) => {
        if(typeof errors.message === 'string') {
            return errors.message.toLowerCase().includes(inputText) 
        }
        else {
            return false
        }
    }

    return (
        
        <Grid textAlign='center' verticalAlign="middle" className='register'>
            <Grid.Column style={{maxWidth: 450}}>
                <Header 
                    as='h1' 
                    icon 
                    color='violet' 
                    textAlign='center'
                >
                    <Icon name='code branch' color='violet' />
                    Connexion
                </Header>
                <Form size='large' onSubmit={handleSubmit}>
                    <Segment stacked>

                        <Form.Input 
                            fluid 
                            name='email' 
                            icon='mail' 
                            iconPosition='left' 
                            placeholder='Adresse e-mail' 
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className={checkInputError('email') ? 'error' : ''}
                            type='email'
                            required
                        />

                        <Form.Input 
                            fluid 
                            name='password' 
                            icon='lock' 
                            iconPosition='left' 
                            placeholder='Mot de passe' 
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className={checkInputError('passe') ? 'error' : ''}
                            type='password'
                            required
                        />

                        <Button 
                            disabled={loading} 
                            className={loading ? 'loading' : ''} 
                            color='violet' 
                            fluid 
                            size='large'
                        >
                            Connexion
                        </Button>
                    </Segment>
                </Form>
                {errors.message?.length > 0 && (
                    <Message error>
                        {errors.message}
                    </Message>
                )}
                <Message>Vous n'avez pas de  compte ? <Link to='/register'>Inscription</Link></Message>
            </Grid.Column>
        </Grid>
    )
}

export default Login
