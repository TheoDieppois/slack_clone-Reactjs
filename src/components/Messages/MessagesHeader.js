import React from 'react'
import {Header, Segment, Input, Icon} from 'semantic-ui-react'

const MessagesHeader = (props) => {
    return (
        <Segment clearing>
            <Header
                fluid='true'
                as='h2'
                floated='left'
                style={{marginBottom: 0}}
            >
                <span>
                    {props.channelName}
                    {!props.isPrivateChannel && 
                        <Icon 
                            onClick={props.handleStar} 
                            name={props.isChannelStarred ? 'star' : 'star outline'} 
                            color={props.isChannelStarred ? 'yellow' : 'black'} 
                        />
                    }
                </span>
                <Header.Subheader>{props.numUniqueUsers}</Header.Subheader>
            </Header>
            <Header
                floated='right'
            >
                <Input 
                    loading={props.searchLoading}
                    onChange={props.handleSearchChange}
                    size='mini'
                    icon='search'
                    name='searchTerm'
                    placeholder='Rechercher un message'
                />
            </Header>
        </Segment>
    )
}

export default MessagesHeader
