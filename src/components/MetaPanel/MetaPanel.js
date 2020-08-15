import React, {useState} from 'react'
import {Segment, Accordion, Header, Icon, Image, List} from 'semantic-ui-react'

const MetaPanel = (props) => {
    const [activeIndexState, setActiveIndexState] = useState(0)
    const [privateChannel, setPrivateChannel] = useState(props.isPrivateChannel)
    const [channel, setChannel] = useState(props.currentChannel)


    const setActiveIndex = (e, titleProps) => {
        const {index} = titleProps
        const newIndex = activeIndexState === index ? -1 : index 
        setActiveIndexState(newIndex)
    }

    if(privateChannel) return null

    const displayTopPoster = posts => (
        Object.entries(posts).sort((a, b) => b[1] - a[1]).map(([key, val], i) => (
            <List.Item
                key={i}    
            >
                <Image avatar src={val.avatar}/>
                <List.Content>
                    <List.Header as='a'>{key}</List.Header>
                    <List.Description>{formatCount(val.count)}</List.Description>
                </List.Content>
            </List.Item>
        )).slice(0,5)
    )

    const formatCount = num => (num > 1 || num === 0) ? `${num} commentaires` : `${num} commentaire`

    return (
        <Segment loading={!channel}>
            <Header as='h3' attached='top'>
                A propos # {channel && channel.name}
            </Header>
            <Accordion styled attached='true'>
                <Accordion.Title
                    active={activeIndexState === 0}
                    index={0}
                    onClick={setActiveIndex}
                >
                    <Icon name='dropdown'/>
                    <Icon name='info'/>
                    Détail du canal
                </Accordion.Title>
                <Accordion.Content active={activeIndexState === 0}>
                    {channel && channel.details}
                </Accordion.Content>

                <Accordion.Title
                    active={activeIndexState === 1}
                    index={1}
                    onClick={setActiveIndex}
                >
                    <Icon name='dropdown'/>
                    <Icon name='user circle'/>
                    Les plus actifs
                </Accordion.Title>
                <Accordion.Content active={activeIndexState === 1}>
                    <List>
                        {props.userPosts && displayTopPoster(props.userPosts)}
                    </List>
                </Accordion.Content>

                <Accordion.Title
                    active={activeIndexState === 2}
                    index={2}
                    onClick={setActiveIndex}
                >
                    <Icon name='dropdown'/>
                    <Icon name='pencil alternate'/>
                    Créé par
                </Accordion.Title>
                <Accordion.Content active={activeIndexState === 2}>
                    <Header as='h3'>
                        <Image circular src={channel && channel.createdBy.avatar}/>
                        {channel && channel.createdBy.name}
                    </Header>
                </Accordion.Content>
            </Accordion>
        </Segment>
    )
}

export default MetaPanel
