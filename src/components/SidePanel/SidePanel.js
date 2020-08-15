import React from 'react'
import { Menu } from 'semantic-ui-react'
import UserPanel from './UserPanel'
import Channels from './Channels'
import DirectMessages from './DirectMessages'
import Starred from './Starred'

const SidePanel = (props) => {
    return (
        <Menu
            size='large'
            inverted
            fixed='left'
            vertical
            style={{background: props.primaryColor, fontSize: '1.2rem'}}
        >
            <UserPanel 
                primaryColor={props.primaryColor}
                currentUser={props.currentUser}
            />
            <Starred currentUser={props.currentUser}/>
            <Channels currentUser={props.currentUser}/>
            <DirectMessages currentUser={props.currentUser}/>
        </Menu>
    )
}

export default SidePanel
