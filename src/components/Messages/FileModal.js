import React, {useState} from 'react'
import {Modal, Input, Button, Icon} from 'semantic-ui-react'
import mime from 'mime-types'

const FileModal = (props) => {
    const [file, setFile] = useState(null)
    const [authorized, setAuthorized] = useState(['image/jpeg', 'image/png'])


    const addFile = (e) => {
        const image = e.target.files[0]
        if(image) {
            setFile(image)
        }
    }

    const sendFile = () => {
        if(file !== null) {
            if(isAuthorized(file.name)) {
                const metadata = {contentType: mime.lookup(file.name)}
                props.uploadFile(file, metadata)
                props.closeModal()
                clearFile()
            }
        }
    }

    const isAuthorized = filename => authorized.includes(mime.lookup(filename))

    const clearFile = () => setFile(null)

    return (
        <Modal 
            basic 
            open={props.modal}
            onClose={props.closeModal}
        >
            <Modal.Header>Choisir un fichier</Modal.Header>
            <Modal.Content>
                <Input 
                    onChange={addFile}
                    fluid
                    label='Types de fichier: .jpg, .png'
                    name='file'
                    type='file'
                />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    onClick={sendFile}
                    color='green'
                    inverted
                >
                    <Icon name='checkmark'/> Envoyer
                </Button>

                <Button
                    color='red'
                    inverted
                    onClick={props.closeModal}
                >
                    <Icon name='remove'/>Annuler
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default FileModal
