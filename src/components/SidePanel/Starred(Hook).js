import React, {useState, useEffect} from 'react'
import {Menu, Icon} from 'semantic-ui-react'
import {connect} from 'react-redux'
import {setCurrentChannel, setPrivateChannel} from '../../actions'
import firebase from '../../firebase'


const Starred = props => {
    const [user, setUser] = useState(props.currentUser)
    const [usersRef, setUsersRef] = useState(firebase.database().ref('users'))
    const [starredChannels, setStarredChannels] = useState([])
    const [activeChannel, setActiveChannel] = useState('')

    useEffect(() => {
        if(user) {
            addListeners(user.uid)
        }
    }, [])

    const addListeners = (userId) => {
        usersRef
        .child(userId)
        .child('starred')
        .on('child_added', snap => {
            const starredChannel = {id: snap.key, ...snap.val()}
            setStarredChannels([...starredChannels, starredChannel])
        })

        usersRef
        .child(userId)
        .child('starred')
        .on('child_removed', snap => {
            const channelToRemove = {id: snap.key, ...snap.val()}
            const filteredChannels = starredChannels.filter(channel => {
                return channel.id !== channelToRemove.id
            }) 
            setStarredChannels(filteredChannels)
        })
    }

    const setChannel = channel => {
        setActiveChannel(channel.id)
    }

    const changeChannel = channel => {
        setChannel(channel)
        props.setCurrentChannel(channel)
        props.setPrivateChannel(false)
    }

    return (
        <Menu.Menu className='menu'>
        <Menu.Item>
            <span>
                <Icon name='star'/> Favoris 
            </span> {' '}
            ({starredChannels.length}) 
        </Menu.Item>
        {starredChannels.length > 0 && starredChannels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id === activeChannel}
            >
                # {channel.name}
            </Menu.Item>
        ))}
    </Menu.Menu>
    )
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred)
