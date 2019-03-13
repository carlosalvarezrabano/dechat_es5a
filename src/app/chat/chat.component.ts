import { Component, OnInit, ViewChild } from '@angular/core';
import { RdfService } from '../services/rdf.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FriendsComponent } from '../friends/friends.component';
import { Friend} from '../models/friend.model';
import { Message} from '../models/message.model';



@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {



    fileClient: any;
    ruta_seleccionada: string;
    htmlToAdd: string;

    constructor(private rdf: RdfService, private rutaActiva: ActivatedRoute) {
        this.rutaActiva.params.subscribe(data => {
            console.log(data['parametro']);
            this.ruta_seleccionada = data['parametro'];
            console.log(this.ruta_seleccionada);
            console.log(typeof this.ruta_seleccionada);
        });
    }

    ngOnInit() {
        this.fileClient = require('solid-file-client');
    }

    private getUserByUrl(ruta: string): string {
        let sinhttp;
        sinhttp = ruta.replace('https://', '');
        const user = sinhttp.split('.')[0];
        return user;

    }

    private createNewFolder() {
        //Para crear la carpeta necesito una ruta que incluya el nombre de la misma.
        //Obtengo el ID del usuario y sustituyo  lo irrelevante por la ruta de public/NombreCarpeta
        let solidId = this.rdf.session.webId;
        let stringToChange = '/profile/card#me';
        let user = this.getUserByUrl(this.ruta_seleccionada);
        let path = '/public/' + user;
        solidId = solidId.replace(stringToChange, path);

        //Necesito logearme en el cliente para que me de permiso, sino me dara un error al intentar
        //crear la carpeta. Como ya estoy en sesion no abre nada pero si se abre la consola se ve
        // que se ejecuta correctamente.

        this.buildFolder(solidId);

    }

    /**
     * Method to create a file for a message
     * @param solidId url of the folder
     */
    private async createNewFile() {
        let solidId = this.rdf.session.webId;
        let stringToChange = '/profile/card#me';
        let user = this.getUserByUrl(this.ruta_seleccionada);
        let path = '/public/' + user + '/Prueba.ttl';
        solidId = solidId.replace(stringToChange, path);

        let message = await this.readMessage(solidId);

        console.log(message);
        
        if (message!= null) {
            this.updateTTL(solidId, message + "Beep, beep");
        }
        else {
            this.updateTTL(solidId, "@prefix schem: <http://schema.org/>.");

        }

    }

    private async createNewMessage() {
        //Sender WebID
        let senderId = this.rdf.session.webId;
        let senderPerson: Friend = {webid:senderId};

        //Receiver WebId
        let recipientPerson:Friend = {webid:this.ruta_seleccionada}

        let messageToSend: Message = {content:"Olakase", date: new Date().toDateString(), sender:senderPerson, recipient: recipientPerson}
        let stringToChange = '/profile/card#me';
        let user = this.getUserByUrl(this.ruta_seleccionada);
        let path = '/public/' + user + '/PruebaChatSintaxis.ttl';

        senderId = senderId.replace(stringToChange, path);

        let message = await this.readMessage(senderId);

        console.log(message);
        
        if (message!= null) {
            this.updateTTL(senderId, message + "\n\n" + this.getTTLDataFromMessage(messageToSend));
        }
        else {
            this.updateTTL(senderId, "@prefix schem: <http://schema.org/>." + "\n\n" + 
                this.getTTLDataFromUser() + "\n\n" + this.getTTLDataFromMessage(messageToSend));

        }

    }


    private async readMessage(url) {
        var message = await this.searchMessage(url)
        console.log(message);
        return message;
    }

    public getTTLDataFromMessage(message) {
        return "<#message-" + message.date + ">\n" + 
         "\trel: sender <#sender>;\n" +
         "\trel: recipient <#recipient>;\n" + 
         "\tdate:" + message.date  + ";\n" + 
         "\tcontent:" + message.content + ".\n";
     }

     public getTTLDataFromUser() {
         return "<#sender>\n\twebid: " + this.rdf.session.webId + ".\n\n" +
            "<#recipient>\n\twebid: " + this.ruta_seleccionada + "."
     }
     


    //method that creates the folder using the solid-file-client lib
    private buildFolder(solidId) {
        //Le paso la URL de la carpeta y se crea en el pod. SI ya esta creada no se si la sustituye o no hace nada
        this.fileClient.createFolder(solidId).then(success => {
            console.log(`Created folder ${solidId}.`);
            this.htmlToAdd = '<div>Carpeta Creada! Ve a tu pod para comprobarlo</div>';
        }, err => console.log(err));

        this.htmlToAdd = '<div>Carpeta Creada! Ve a tu pod para comprobarlo</div>';
    }


    //method that creates a file in a folder using the solid-file-client lib
    private buildFile(solidIdFolderUrl, content) {
        this.fileClient.createFile(solidIdFolderUrl, content, "text/plain").then(fileCreated => {
            console.log(`Created file ${fileCreated}.`);
        }, err => console.log(err));
    }


    //method that search for a message in a pod
    private async searchMessage(url) {
        return await this.fileClient.readFile(url).then(body => {
            console.log(`File	content is : ${body}.`);
            return body;
        }, err => console.log(err));
    }


    private updateTTL(url, newContent, contentType?) {
        if (contentType) {
            this.fileClient.updateFile(url, newContent, contentType).then(success => {
                console.log(`Updated ${url}.`)
            }, err => console.log(err));
        }
        else{
            this.fileClient.updateFile(url, newContent).then(success => {
                console.log(`Updated ${url}.`)
            }, err => console.log(err));
        }

    }
}
