import React, { Component } from 'react'

import {Segment, Comment} from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import Message from './Message'
import firebase from '../../firebase'
import {connect} from 'react-redux'
import {setUserPosts} from '../../actions'

class Messages extends Component {

    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        messagesRef : firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        messages: [],
        messagesLoading: true,
        isChannelStarred: false,
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        progressbar: false,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: []
    }

    componentDidMount() {
        const {channel, user} = this.state

        if(channel && user) {
            this.addListener(channel.id)
            this.addUsersStarsListener(channel.id, user.uid)
        }
    }

    addListener = channelId => {
        this.addMessagesListener(channelId)
    }

    addMessagesListener = channelId => {
        let loadedMessages = []
        const ref = this.getMessagesRef()
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
            this.countUniqueUsers(loadedMessages)
            this.countUserPosts(loadedMessages)
        })
    }

    addUsersStarsListener = (channelId, userId) => {
        this.state.usersRef
        .child(userId)
        .child('starred')
        .once('value')
        .then(data => {
            if(data.val() !== null) {
                const channelIds = Object.keys(data.val())
                const prevStarred = channelIds.includes(channelId)
                this.setState({isChannelStarred: prevStarred})
            }
        })
    }

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state
        return privateChannel ? privateMessagesRef : messagesRef
    }

    handleSearchChange = e => {
        this.setState({
            searchTerm: e.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages]
        const regex = new RegExp(this.state.searchTerm, 'gi')
        const searchResults = channelMessages.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc
        }, [])

        this.setState({searchResults})
        setTimeout(() => this.setState({searchLoading: false}), 1000)
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name)
            }
            return acc
        }, [] )
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0
        const numUniqueUsers = `${uniqueUsers.length} utilisateur${plural ? 's' : ''}`
        this.setState({numUniqueUsers})
    }

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc) {
                acc[message.user.name].count += 1
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc
        }, {})

        this.props.setUserPosts(userPosts)
    }

    isProgressbarVisible = percent => {
        if(percent > 0) {
            this.setState({progressbar: true})
        }
    }

    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ))
    )

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
    }

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel())
    }

    starChannel = () => {
        if(this.state.isChannelStarred) {
            this.state.usersRef
            .child(`${this.state.user.uid}/starred`)
            .update({
                [this.state.channel.id]: {
                    name: this.state.channel.name,
                    details: this.state.channel.details,
                    createdBy: {
                        name: this.state.channel.createdBy.name,
                        avatar: this.state.channel.createdBy.avatar,
                    }
                }
            })
        } else {
            this.state.usersRef
            .child(`${this.state.user.uid}/starred`)
            .child(this.state.channel.id)
            .remove(err => {
                if(err !== null) {
                    console.error(err)
                }
            })
        }
    }

    render() {
        const {messagesRef, messages, channel, user, progressbar, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred} = this.state
        return (
            <>
                <MessagesHeader 
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                />
                <Segment>
                    <Comment.Group className={progressbar ? 'messages__progress' : 'messages'}>
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}   
                    </Comment.Group>
                </Segment>

                <MessageForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressbarVisible={this.isProgressbarVisible}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </>
        )
    }
}

export default connect(null, {setUserPosts})(Messages)

