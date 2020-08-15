import React, { Component } from 'react'

import { Menu, Icon, Modal, Form, Button, Input, Label } from 'semantic-ui-react'
import firebase from 'firebase'
import { connect } from 'react-redux'
import {setCurrentChannel, setPrivateChannel} from '../../actions'

class Channels extends Component {
    state = {
        user: this.props.currentUser,
        channel: null,
        channels: [],
        modal: false,
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        messagesref: firebase.database().ref('messages'),
        typingRef: firebase.database().ref('typing'),
        notifications: [],
        firstLoad: true,
        activeChannel : ''
    }

    componentDidMount() {
        this.addListeners()
    }

    componentWillUnmount() {
        this.removeListeners()
    }

    closeModal = () => {
        this.setState({
            modal: false
        })
    }

    openModal = () => {
        this.setState({
            modal: true
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        if(this.isFormValid(this.state.channelName, this.state.channelDetails)) {
            this.addChannel()
        }
    }

    addChannel = () => {
        const {channelsRef, channelName, channelDetails, user} = this.state

        const key = channelsRef.push().key

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({
                    channelName: '',
                    channelDetails: '',
                })
                this.closeModal()
            })
            .catch(err => {
                console.error(err)
            })
    }

    isFormValid = (channelName, channelDetails) => channelName && channelDetails

    addListeners = () => {
        let loadedChannels = []
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val())
            this.setState({channels: loadedChannels}, () => this.setFirstChannel())
            this.addNotificationListener(snap.key)
        })
    }  

    addNotificationListener = channelId => {
        this.state.messagesref.child(channelId).on('value', snap => {
            if(this.state.channel) {
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap)
            }
        })
    }

    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0
        let index = notifications.findIndex(notification => notification.id === channelId) 

        if(index !== - 1) {
            if(channelId !== currentChannelId) {
                lastTotal = notifications[index].total

                if(snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren()
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }
        this.setState({notifications})
    }

    removeListeners = () => {
        this.state.channelsRef.off();
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0]
        if(this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel)
            this.setChannel(firstChannel)
            this.setState({channel: firstChannel})
        }
        this.setState({
            firstLoad: false
        })
    }

    changeChannel = channel => {
        this.setChannel(channel)
        this.state.typingRef
            .child(this.state.channel.id)
            .child(this.state.user.uid)
            .remove()
        this.clearNotifications()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({channel})
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)

        if(index !== -1) {
            let updatedNotifactions = [...this.state.notifications]
            updatedNotifactions[index].total = this.state.notifications[index].lastKnownTotal
            updatedNotifactions[index].count = 0
            this.setState({notifications: updatedNotifactions})
        }
    }

    setChannel = (channel) => {
        this.setState({
            activeChannel: channel.id
        })
    }

    getNotificationCount = channel => {
        let count = 0
        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id) {
                count = notification.count
            }
        })

        if(count > 0) return count
    }
 
    render() {
        return (
            <>
                <Menu.Menu className='menu'>
                    <Menu.Item>
                        <span>
                            <Icon name='exchange'/> Canaux 
                        </span> {' '}
                        ({this.state.channels.length}) <Icon name='add' onClick={this.openModal}/> 
                    </Menu.Item>
                    {this.state.channels.length > 0 && this.state.channels.map(channel => (
                        <Menu.Item
                            key={channel.id}
                            onClick={() => this.changeChannel(channel)}
                            name={channel.name}
                            style={{opacity: 0.7}}
                            active={channel.id === this.state.activeChannel}
                        >
                            {this.getNotificationCount(channel) && (
                                <Label color='red'>{this.getNotificationCount(channel)}</Label>
                            )}
                            # {channel.name}
                        </Menu.Item>
                    ))}
                </Menu.Menu>

                <Modal basic open={this.state.modal} onClose={this.closeModal}>
                    <Modal.Header>
                        Ajouter un canal
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <Input 
                                    fluid
                                    label='Nom du Canal'
                                    name='channelName'
                                    onChange={(e) => this.setState({channelName: e.target.value})}
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input 
                                    fluid
                                    label='A propos du Canal'
                                    name='channelDetails'
                                    onChange={(e) => this.setState({channelDetails: e.target.value})}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color='green' inverted onClick={this.handleSubmit}>
                            <Icon name='checkmark' /> Ajouter
                        </Button>
                        <Button color='red' inverted onClick={this.closeModal}>
                            <Icon name='remove' /> Annuler
                        </Button>
                    </Modal.Actions>
                </Modal>
            </>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels)

    




