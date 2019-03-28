import { Friend } from "src/app/models/friend.model";
import { message } from "src/app/models/message.model";
import { TXTPrinter } from "../printers/txtprinter.service";
import {messagesSorter} from "../sorters/messagesSorter"

export class filesCreator {

    //The url of the owner, like http://test.inrupt.com
    sessionWebId: string;
    //A list of the readers of the chat, if is only one, is still the first
    recipientWebId: string[];
    //The library to manage the pod files
    fileClient: any;
    //A list of the messages of the chat
    messages:message[];
    //The name of the folder
    //Is used in the grupal chat, it is a singlar is just the recipientWebId[0] name
    folderName:string;
    //True if is a group chat; false if not
    groupChat:boolean;

     /*
     * Constuctor
     * @param userWebId:string the url of the user, like http://test.inrupt.com, without /profile/card#me
     * @param recipientWebId:string[] a list of all the users that are in the chat
     * @param fileClient:any the library to manage the files in the pod
     * @param messages: message[] a list of messages on the chat
     * @param name?:string a optional param, only used in group chat
     */
    constructor(userWebId:string,recipientWebId:string[],fileClientP:any, messages: message[],name?:string) {
        this.sessionWebId=userWebId;
        this.recipientWebId=recipientWebId;
        this.fileClient=fileClientP;
        this.messages=messages;
        if(name){
            this.folderName=name;
        }else{
            this.folderName=this.getUserByUrl(this.recipientWebId[0])
        }
        this.groupChat=this.recipientWebId.length>1;
    }
          
	/*
	 * Install the program in /dechat5a/
	 * With the acl only for the owner
	 */
	public install() {
	    let path=this.sessionWebId+'/dechat5a/';
        this.buildFolder(path);
        this.createOwnerACL(path,this.sessionWebId);
    }
    /*
     * Creates a folder with the acl
     * It auto checks if is a singular chat or a group chat
     */
    public buildChatFolder(){
	    if(this.groupChat){
	        this.newGrupalChat();
        }else{
	        this.newSingularChat();
        }
    }

 	/*
	 * creates a folder for the chat inside /dechat5a/
	 * With the acl for the only reader (recipientWebId[0])
	 */
	private newSingularChat() {
        let path=this.sessionWebId+'/dechat5a/'+this.folderName+'/';
        this.buildFolder(path);
        this.createReadForOneACL(path,this.sessionWebId,this.recipientWebId[0]);
    }
    
    /*
	 * creates a folder for the chat insude /dechat5a/
	 * With the acl for all the readers
	 */
	private newGrupalChat() {
        let path = this.sessionWebId+'/dechat5a/'+this.folderName+'/';
        this.buildFolder(path);
        this.createReadForManyACL(path,this.sessionWebId,this.recipientWebId);
    }

    /*
     * Method that creates the folder using the solid-file-client lib
     * Warning: To see of it must create the folder, it reads the folder
     * And i dont know what happend when it cant read a folder that already exist
     * @param path:string the path of the folder to be created
     */
    private buildFolder(path: string) {
        this.fileClient.readFolder(path).then(folder => {
            console.log(`Read ${folder.name}, it has ${folder.files.length} files.`);
        }, err => {
            this.fileClient.createFolder(path).then(success => {
                console.log(`Created folder ${path}.`);
            }, err1 => console.log(err1));
        });
    }

    /*
     * Creates a .acl for the file in the path.
     * This file is only for the owner
     * path must have the / at the end of the folder
     * @param path:string the file for the .acl
     * @param user:string the /profile/card#me of the user owner of the folder
     */
    private createOwnerACL(path:string, user:string) {
        let file = path+'.acl';
        let contenido = '@prefix  acl:  <http://www.w3.org/ns/auth/acl#>  .\n'+
            '<#owner>\n'+
            'a             acl:Authorization;\n'+
            'acl:agent     <'+this.fixProfile(this.sessionWebId)+'>;\n'+
            'acl:accessTo  <'+path+'>;\n'+
            'acl:defaultForNew <./>;'+
            'acl:mode\n      acl:Read,\n'+
            'acl:Write,\n'+
            'acl:Control.'

        this.fileClient.updateFile(file,contenido).then(success => {
            console.log(`Created acl owner ${file}.`)
        }, err => console.log(err));
    }

    /*
     * Creates a .acl for the file in the path.
     * This file made for the owner and one reader
     * Used in p2p chats
     * path must have the / at the end of the folder
     * @param path:string the file for the .acl
     * @param owner:string the /profile/card#me of the user owner of the folder
     * @param reader:string the /profile/card#me of the reader of the folder
     */
    private createReadForOneACL(path: string, owner: string, reader:string) {
        let file = path + '.acl';
        let contenido ='@prefix  acl:  <http://www.w3.org/ns/auth/acl#>  .'+
            '<#owner>\n'+
            'a             acl:Authorization;\n'+
            'acl:agent     <'+this.fixProfile(owner)+'>;\n'+
            'acl:accessTo  <'+path+'>;\n'+
            'acl:defaultForNew <./>;'+
            'acl:mode\n      acl:Read,\n'+
            'acl:Write,\n'+
            'acl:Control.\n'+

            '<#reader>\n'+
            'a             acl:Authorization;\n'+
            'acl:agent     <'+this.fixProfile(reader)+'>;\n'+
            'acl:accessTo  <'+path+'>;\n'+
            'acl:defaultForNew <./>;\n'+
            'acl:mode\n      acl:Read.'

        this.fileClient.updateFile(file,contenido).then(success => {
            console.log(`Created acl one reader ${file}.`)
        }, err => console.log(err));
    }

    /*
     * Creates a .acl for the file in the path.
     * This file made for the owner and many readers
     * Used in group chats
     * path must have the / at the end of the folder
     * @param path:string the file for the .acl
     * @param owner:string the /profile/card#me of the user owner of the folder
     * @param readers:string[] the /profile/card#me of the readers of the folder
     */
    private createReadForManyACL(path: string, owner:string, readers: string[]) {
        let file = path + '.acl';
        let contenido ='@prefix  acl:  <http://www.w3.org/ns/auth/acl#>  .\n'+
            '<#owner>\n'+
            'a             acl:Authorization;\n'+
            'acl:agent     <'+this.fixProfile(owner)+'>\n'+
            'acl:accessTo  <'+path+'>\n'+
            'acl:defaultForNew <./>;\n'+
            'acl:mode      acl:Read,\n'+
            'acl:Write,\n'+
            'acl:Control.\n'+

            '<#readers>\n'+
            'a               acl:Authorization;\n'+
            'acl:accessTo    <'+path+'>\n'+
            'acl:defaultForNew <./>;\n'+
            'acl:mode        acl:Read;\n'

        readers.forEach(function (e, idx, array) {
            if (idx === array.length - 1){
                contenido = contenido + 'acl:agent  <'+this.fixProfile(e)+'>.'
            } else {
                contenido = contenido + 'acl:agent  <'+this.fixProfile(e)+'>;\n'
            }
        })
        this.fileClient.updateFile(file,contenido).then(success => {
            console.log(`Created acl many readers ${file}.`)
        }, err => console.log(err));
    }

    /*
     * Add a url of a user the /profile/card#me.
     * If it has already it, it returns the same url
     * @param url:string the user
     * @return string with the url correct
     */
    private fixProfile(url: string) {
        let r = url;
        var n =r.includes('/profile/card#me');
        if(n){
            return r;
        }else{
            return r+'/profile/card#me';
        }
    }


    /*
     * This method obtains the username based on his webID
     * @param path:string the url of the folder to look for the name
     * @return string the name of the user of the path
     */
    public getUserByUrl(path: string): string {
        let sinhttp;
        sinhttp = path.replace('https://', '');
        const user = sinhttp.split('.')[0];
        return user;
    }

    
    /*
     * This method obtains different data and creates a new message. 
     * It also creates (or updates if its already created) the conversation file.
     */
    public async createNewMessage() {
        //getting message from DOM
        let myUser= this.getUserByUrl(this.sessionWebId);
        //if there are in a group chat, that should be changed
        let user = this.getUserByUrl(this.recipientWebId[0]);
        var messageContent = myUser + ': ' + ((document.getElementById("usermsg") as HTMLInputElement).value);
        (document.getElementById("usermsg") as HTMLInputElement).value="";
        console.log(messageContent);
        //Sender WebID
        let senderId = this.sessionWebId;
        let senderPerson: Friend = { webid: senderId };

        //Receiver WebId
        let recipientPerson: Friend = { webid: this.recipientWebId[0] }

        let messageToSend: message = { content: messageContent, date: new Date(Date.now()), sender: senderPerson, recipient: recipientPerson }

        //All the user are without the /profile/card#me, so that wouldnt be necesary?
        //let stringToChange = '/profile/card#me';
        let path = '/dechat5a/' + user + '/Conversation.txt';
        //senderId = senderId.replace(stringToChange, path);
        senderId=path;

        let message = await this.readMessage(senderId);

        console.log(message);

        //For TXTPrinter
        if (message != null) {
            this.updateTTL(senderId, message + "\n" + new TXTPrinter().getTXTDataFromMessage(messageToSend));
        }
        else {
            this.updateTTL(senderId, new TXTPrinter().getTXTDataFromMessage(messageToSend));
        }

        /*
        //For TTLPrinter
        if (message!= null) {
            this.updateTTL(senderId, message + "\n\n" + new TTLPrinter().getTTLDataFromMessage(messageToSend));
        }
        else {
            this.updateTTL(senderId, new TTLPrinter().getTTLHeader(messageToSend,senderId,this.ruta_seleccionada));
        }
        */
        this.synchronizeMessages();

    }

     /*
     * This methos updates the TTL file with the new content
     * @param url the url of the file to look, like http://mypod.inrupt.com/dechat5a/myfriend/conversacion.ttl
     * @param newContent the new content of the file
     * @param contentType? the type of the file, used to force the type, like turtle/text
     */
    private updateTTL(url, newContent, contentType?) {
        if (contentType) {
            this.fileClient.updateFile(url, newContent, contentType).then(success => {
                console.log(`Updated ${url}.`)
            }, err => console.log(err));
        }
        else {
            this.fileClient.updateFile(url, newContent).then(success => {
                console.log(`Updated ${url}.`)
            }, err => console.log(err));
        }
    }

    //TODO this should be one method instead of 2, or maybe one private
     /*
     * This methos searches for a message in an url
     * @param url the url to look for messages like http://myfriend.inrupt.com/dechat5a/mypod/conversacion.ttl
     * @return the message
     */
    public async readMessage(url) {
        var message = await this.searchMessage(url)
        console.log(message);
        return message;
    }


     /*
     * This method search for a message in a pod
     * @param url the url to look for messages like http://myfriend.inrupt.com/dechat5a/mypod/conversacion.ttl
     * @return the message
     */
    public async searchMessage(url) {
        return await this.fileClient.readFile(url).then(body => {
            console.log(`File	content is : ${body}.`);
            return body;
        }, err => console.log(err));

    }


    /*
     * This method creates a file in a folder using the solid-file-client lib
     */
    private buildFile(solidIdFolderUrl, content) {
        this.fileClient.createFile(solidIdFolderUrl, content, "text/plain").then(fileCreated => {
            console.log(`Created file ${fileCreated}.`);
        }, err => console.log(err));
    }

     /*
     * This method gets the url of the connection to synchronize the different messages
     */
    public async synchronizeMessages(){

        var urlArray = this.recipientWebId[0].split("/");
        let url= "https://" + urlArray[2] + "/dechat5a/" + this.getUserByUrl(this.sessionWebId) + "/Conversation.txt";

        var urlArrayPropio = this.sessionWebId.split("/");
        let urlPropia = "https://" + urlArrayPropio[2] + "/dechat5a/" + this.getUserByUrl(this.recipientWebId[0]) + "/Conversation.txt";
        console.log("URL PROPIA: "+ urlPropia);
        console.log(url);
        let messageContent = await this.searchMessage(url);
        console.log("MessageContent " + messageContent);
        let messageArray = [] ;
        if(messageContent != undefined)
        {
            messageArray = messageContent.split("\n");
        }
        let messageContentPropia = await  this.searchMessage(urlPropia);
        let messageArrayPropio = [] ;
        if(messageContentPropia != undefined)
        {
            messageArrayPropio = messageContentPropia.split("\n");
        }

        let mess = [];
        messageArray.forEach(element => {
            console.log(element.content)
            if(element[0]){
             let messageArrayContent = element.split("###");
             let messageToAdd:message = { content: messageArrayContent[2], date: messageArrayContent[3],sender: messageArrayContent[0], recipient: messageArrayContent[1]};
                console.log(messageToAdd);
             mess.push(messageToAdd);
            }

        });
        messageArrayPropio.forEach(element => {
            console.log(element.content)
            if(element[0]){
                let messageArrayContent = element.split("###");
                let messageToAdd:message = { content: messageArrayContent[2], date: messageArrayContent[3],sender: messageArrayContent[0], recipient: messageArrayContent[1]};
                console.log(messageToAdd);
                mess.push(messageToAdd);
            }

        });



        let ordered = new messagesSorter().order(mess);

        if(mess.length > this.messages.length){
            for (var i = this.messages.length; i < mess.length; i++) {
                this.messages.push( mess[i]);
            }
        }

    }

    
}
