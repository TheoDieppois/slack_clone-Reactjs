import React from 'react'
import {Grid, GridColumn} from 'semantic-ui-react'
import './App.css'
import {connect} from 'react-redux'

import ColorPanel from './components/ColorPanel/ColorPanel'
import SidePanel from './components/SidePanel/SidePanel'
import Messages from './components/Messages/Messages'
import MetaPanel from './components/MetaPanel/MetaPanel'


const App = (props) => {
  
  return (
      <Grid columns='equal' className='app' style={{background: props.secondaryColor}}>
        <ColorPanel 
          key={props.currentUser && props.currentUser.name}
          currentUser={props.currentUser}
        />

        <SidePanel 
          key={props.currentUser && props.currentUser.uid}
          currentUser={props.currentUser}
          primaryColor={props.primaryColor}
        />

        <Grid.Column style={{ marginLeft: 320 }}>
          <Messages 
            key={props.currentChannel && props.currentChannel.id}
            currentChannel={props.currentChannel}
            currentUser={props.currentUser}
            isPrivateChannel={props.isPrivateChannel}
          />
        </Grid.Column>

        <Grid.Column width={4}>
          <MetaPanel 
            key={props.currentChannel && props.currentChannel.name}
            currentChannel={props.currentChannel}
            isPrivateChannel={props.isPrivateChannel}
            userPosts={props.userPosts}
          />
        </Grid.Column>
      </Grid>
  )
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor,
})

export default connect(mapStateToProps)(App);
