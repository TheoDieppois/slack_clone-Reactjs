import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import {BrowserRouter as Router, Switch, Route, useHistory, withRouter} from 'react-router-dom'
import {createStore} from 'redux'
import {Provider, connect} from 'react-redux'
import {composeWithDevTools} from 'redux-devtools-extension'

import firebase from './firebase'

import 'semantic-ui-css/semantic.min.css'
import rootReducer from './reducers'
import { setUser, clearUser } from './actions'


import App from './App'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Spinner from './components/Spinner'




const store = createStore(rootReducer, composeWithDevTools())


const Root = (props) => {
  const history = useHistory()

  useEffect(() => {
    console.log(props.isLoading)
    firebase.auth().onAuthStateChanged(user => {
      if (user){
        props.setUser(user)
        history.push('/')
      } else {
        history.push('/login')
        props.clearUser()
      }
    })
  },[])

  return (
    props.isLoading ? <Spinner /> : (
      <Switch>
        <Route exact path='/' component={App}/>
        <Route exact path='/login' component={Login}/>
        <Route exact path='/register' component={Register}/>
      </Switch>
    )
  )
}


const mapStateToProps = state => ({
  isLoading: state.user.isLoading
})

const RootWithAuth = withRouter(
  connect(
    mapStateToProps, 
    { setUser, clearUser }
  )(Root))


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <RootWithAuth />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
