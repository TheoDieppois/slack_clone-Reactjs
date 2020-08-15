import React, {useState, useEffect} from 'react'
import {Grid, Header, Icon, Dropdown, Image, Modal, Input, Button} from 'semantic-ui-react'
import firebase from '../../firebase'
import AvatarEditor from 'react-avatar-editor'

const UserPanel = (props) => {
    const [user, setUser] = useState(props.currentUser)
    const [modal, setModal] = useState(false)
    const [previewImage, setPreviewImage] = useState('')
    const [croppedImage, setCroppedImage] = useState('')
    const [blob, setBlob] = useState('')
    const [storageRef, setStorageRef] = useState(firebase.storage().ref())
    const [userRef, setUserRef] = useState(firebase.auth().currentUser)
    const [usersRef, setUsersRef] = useState(firebase.database().ref('users'))
    const [metadata, setMetadata] = useState({
        contentType: 'image/jpeg'
    })
    const [uploadedCroppedImage, setUploadedCroppedImage] = useState('')


    let avatarEditor


    useEffect(() => {
        setUser(props.currentUser)
    })

    const dropdownOptions = () => [
        {
            key: 'user',
            text: <span>Connecté en tant que <strong>{user.displayName}</strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span onClick={openModal}>Changer d'Avatar</span>
        },
        {
            key: 'signout',
            text: <span onClick={handleSignOut}>Déconnexion</span>
        }
    ]

    const handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log('signed Out'))
    }

    const openModal = () => setModal(true)

    const closeModal = () => setModal(false)

    const handleChange = e => {
        const file = e.target.files[0]
        const reader = new FileReader()

        if(file) {
            reader.readAsDataURL(file)
            reader.addEventListener('load', () => {
                setPreviewImage(reader.result)
            })
        }
    }

    const uploadCroppedImage = () => {
        storageRef
            .child(`avatars/user-${userRef.uid}`)
            .put(blob, metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                    setUploadedCroppedImage(downloadURL)
                })
            })
    }

    useEffect(() => {
        if(uploadedCroppedImage) {
            changeAvatar()
        }
    }, [uploadedCroppedImage])

    const changeAvatar = () => {
        userRef.updateProfile({
            photoURL: uploadedCroppedImage
        })
        .then(() => {
            console.log('photoURLUpdated')
            closeModal()
        })
        .catch(err => console.error(err))

        usersRef
            .child(user.uid)
            .update({
                avatar: uploadedCroppedImage
            })
            .then(() => {
                console.log('avatar updated')
            })
            .catch(err => console.error(err))
    }

    const cropImage = () => {
        if(avatarEditor) {
            avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob)
                setCroppedImage(imageUrl)
                setBlob(blob)
            })
        }
    }


    return (
        <Grid style={{background: props.primaryColor}}>
            <Grid.Column>
                <Grid.Row style={{padding: '1.2em', margin: 0}}>
                    <Header inverted floated='left' as='h2'>
                        <Icon name='code'/>
                        <Header.Content>Chat</Header.Content>
                    </Header>
                    
                    <Header style={{padding: '0.25em'}} as='h4' inverted>
                        <Dropdown trigger={
                            <span>
                                <Image src={user.photoURL} spaced='right' avatar />
                                {user.displayName}
                            </span>
                        } options={dropdownOptions()}/>
                    </Header>
                </Grid.Row>
                <Modal basic open={modal} onClose={closeModal}>
                    <Modal.Header>Changer son avatar</Modal.Header>
                    <Modal.Content>
                        <Input 
                            onChange={handleChange}
                            fluid
                            type='file'
                            label='Nouvel avatar'
                            name='previewImage'
                        />
                        <Grid centered stackable columns={2}>
                            <Grid.Row centered>
                                <Grid.Column className='ui center aligned grid'>
                                    {previewImage && (
                                        <AvatarEditor 
                                            ref={node => (avatarEditor = node)}
                                            image={previewImage}
                                            width={120}
                                            height={120}
                                            border={50}
                                            scale={1.2}
                                        />
                                    )}
                                </Grid.Column>

                                <Grid.Column>
                                    {croppedImage && (
                                        <Image 
                                            style={{margin: '3.5em auto'}}
                                            width={100}
                                            height={100}
                                            src={croppedImage}
                                        />
                                    )}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Modal.Content>
                    <Modal.Actions>
                        {croppedImage && (
                            <Button color='green' inverted onClick={uploadCroppedImage}>
                                <Icon name='save' /> Changer son avatar
                            </Button>
                        )}

                        <Button color='green' inverted onClick={cropImage}>
                            <Icon name='image' /> Prévisualisation
                        </Button>

                        <Button color='red' inverted onClick={closeModal}>
                            <Icon name='remove' /> Annuler
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Grid.Column>
        </Grid>
    )
}

export default UserPanel
