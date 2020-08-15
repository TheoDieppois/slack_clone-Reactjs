import React, {useState} from 'react'
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import firebase from '../../firebase'
import md5 from 'md5'

import './Register.css'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [errors, setErrors] = useState({
        message : ''
    })
    const [loading, setLoading] = useState(false)
    const [usersRef, setUsersRef] = useState(firebase.database().ref('users'))



    const handleSubmit = (e) => {
        e.preventDefault()
        if(isFormValid()) {
            setErrors('')
            setLoading(true)
            firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .then(createUser => {
                    console.log(createUser)
                    createUser.user.updateProfile({
                        displayName: username,
                        photoURL: `http://gravatar.com/avatar/${md5(createUser.user.email)}?=identicon`
                    })
                    .then(() => {
                        saveUser(createUser)
                        .then(() => {
                            console.log('user saved')
                        })
                        .catch(err => {
                            console.error(err)
                            setErrors({message : err.message})
                        })
                    })
                    .catch(err => {
                        setErrors({message : err.message})
                        setLoading(false)
                    })
                })
                .catch(err => {
                    setErrors({message : err.message})
                    setLoading(false)
                })
        }
    }

    const isFormValid = () => {
        let error

        if(isFormEmpty(username, email, password, passwordConfirmation)) {
            setErrors({message : 'Merci de remplir tous les champs'})
            return false
        } else if (!isPasswordValid(password, passwordConfirmation)) {
            setErrors({message : 'Mot de passe invalid'})
            return false
        } else {
            return true
        }
    }

    const isFormEmpty = (username, email, password, passwordConfirmation) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length
    }

    const isPasswordValid = (password, passwordConfirmation) => {
        if(password.length < 6 || passwordConfirmation < 6) {
            return false
        } else if(password !== passwordConfirmation) {
            return false
        } else {
            return true
        }
    }

    const checkInputError = (inputText) => {
        if(typeof errors.message === 'string') {
            return errors.message.toLowerCase().includes(inputText) 
        }
        else {
            return false
        }
    }

    const saveUser = createdUser => {
        return usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        })
    }

    return (
        
        <Grid textAlign='center' verticalAlign="middle" className='register'>
            <Grid.Column style={{maxWidth: 450}}>
                <Header 
                    as='h1' 
                    icon 
                    color='orange' 
                    textAlign='center'
                >
                    <Icon name='puzzle piece' color='orange' />
                    Inscription
                </Header>
                <Form size='large' onSubmit={handleSubmit}>
                    <Segment stacked>
                        <Form.Input 
                            fluid 
                            name='username' 
                            icon='user' 
                            iconPosition='left' 
                            placeholder='Nom' 
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type='text'
                            required
                        />

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

                        <Form.Input 
                            fluid 
                            name='passwordConfirmation' 
                            icon='repeat'
                            iconPosition='left' 
                            placeholder='Confirmer le mot de passe' 
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            value={passwordConfirmation}
                            className={checkInputError('passe') ? 'error' : ''}
                            type='password'
                            required
                        />

                        <Button 
                            disabled={loading} 
                            className={loading ? 'loading' : ''} 
                            color='orange' 
                            fluid 
                            size='large'
                        >
                            Inscription
                        </Button>
                    </Segment>
                </Form>
                {errors.message?.length > 0 && (
                    <Message error>
                        {errors.message}
                    </Message>
                )}
                <Message>Vous avez déja un compte ? <Link to='/login'>Connexion</Link></Message>
            </Grid.Column>
        </Grid>
    )
}

export default Register
