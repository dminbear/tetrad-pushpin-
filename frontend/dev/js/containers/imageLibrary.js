import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {hashHistory} from 'react-router';
import $ from 'jquery';

import server from '../config/server';
import {selectImage,selectRendered} from '../actions';

import Modal from 'react-modal';
import Dropzone from 'react-dropzone';
import SizeSlider from '../containers/slider'

/*
 * We need "if(!this.props.user)" because we set state to null by default
 * */
const customStyles = {      
          overlay : {
            backgroundColor   : 'rgba(0, 0, 0, 0.5)'
          },
          content : {
            margin: '15% auto',
            left:'300',
            right:'490',
            width: '30%',
            height:'30%',
            background: '#fefefe',
            overflow : 'hiddden',
            padding:'0px',
          }
      
    };

class ImageLibrary extends Component {

	constructor(props){
        super(props);
		this.getBaseImages = this.getBaseImages.bind(this);
		this.getInteriorImages = this.getInteriorImages.bind(this);
        this.getCustomImages = this.getCustomImages.bind(this);
        this.getRenderedImages = this.getRenderedImages.bind(this);
        this.getProjects = this.getProjects.bind(this);
        this.imageClick = this.imageClick.bind(this);
        this.renderedImageClick = this.renderedImageClick.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.addJson = this.addJson.bind(this);

        this.mapToImage = this.mapToImage.bind(this);
        
        
        //image upload
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.postImage = this.postImage.bind(this);
        
        this.state = {
            projects: [], 
            customImagesLibrary: this.mapToImage(this.getCustomImages()),
            image_number: 0,
            baseImagesLibrary:this.mapToImage(this.getBaseImages()),
            interiorImagesLibrary:this.mapToImage(this.getInteriorImages()),
            renderedImagesLibrary: this.mapToImageRendered(this.getRenderedImages()),
            activeJsonKey:"",
            modalIsOpen:false,
        };
	};
    shouldComponentUpdate(nextProps,nextState){        
        return true;        
    }
    componentWillReceiveProps(nextProps){
        if (nextProps.new_imageKey != this.props.new_imageKey){
            this.setState({renderedImagesLibrary: this.mapToImageRendered(this.getRenderedImages())});
        }
    }
    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }
    
    addJson(){
        this.closeModal();
        this.props.renderedImageClicked(this.state.activeJsonKey);
    }
    
    //implement if needed
    componentDidMount(){     
    }
    
       
    //AJAX to post image
    postImage(files) {
        const self = this;

        /*get 1st project*/
        $.ajax(
        {
            url : server+"/api/projects",
            type : "GET",
            xhrFields: {
               withCredentials: true
            },
            crossDomain: true,
            success : function(data) {
                if (data.success === true){
                    var project = data.projects[0];
                    /* create a new custom image document */
                    var customImageEndPoint = server+"/api/projects/"+project+"/customImages";
                    var file = files[0]
                    var fd = new FormData();
                    fd.append('file', file);
                    $.ajax(
                    {
                        url : customImageEndPoint,
                        type : "POST",
                        xhrFields: {
                           withCredentials: true
                        },
                        data : fd,
                        crossDomain: true,
                        processData: false,
                        contentType: false,
                        success : function(data) {
                            if (data.success === true){
                                var id = data.customImages._id;
                                alert("A custom image has been submitted and created with id: " + id);
                                
                                //update custom images in state
                                self.setState({
                                    customImagesLibrary: self.mapToImage(self.getCustomImages())
                                });
        
                            }
                            else{
                                alert(data.message);
                            }
                        }
                    })
                    .fail(
                        function() { alert("ajax failure");}
                    );
                }
                else{
                    alert(data.message);
                }
            }
        })
        .fail(
            function() { alert("ajax failure");}
        );
        
       
    }
    
    //upload file with drop zone  
    onDrop(acceptedFiles, rejectedFiles) {
      console.log('Accepted files: ', acceptedFiles);
      console.log('Rejected files: ', rejectedFiles);
      //alert("dropped");        
      this.postImage(acceptedFiles);            
    }
    
    //upload file with button
    handleSubmit(e) {
        e.preventDefault();       
        this.postImage(document.getElementById('imageForm').files); 
    }
    
    
    
    imageClick(url){ 
        var image_number = this.state.image_number;
        this.state.image_number = this.state.image_number + 1;
        this.props.imageClicked(url, image_number);
    }

    renderedImageClick(url){        
        this.openModal();
        this.setState({activeJsonKey:url});
    }
    
	componentWillMount(){

        var request = new XMLHttpRequest();

        request.withCredentials = true;

        request.open("GET", server+"/api", false);
        request.send(null);

        var response = JSON.parse(request.response);

        if (response.success != true){
            hashHistory.push("/login");
        }
    }
    
	getBaseImages(){
        var request = new XMLHttpRequest();

        request.withCredentials = true;
        
        request.open('GET',server+'/api/standard/base', false);
		request.send(null); 

        var response = JSON.parse(request.response);

        if (request.status !== 200){
            alert("synchronous request failed\n Error: "+request.status);
            return [];
        }

        {/*
        this.setState({customImages: response.customImages});  
        */}

        var result = [];
        //error when no project of given id ->Cannot read property 'map' of undefined
	    if (response.success == true){
		    result = response.keys.map((key) => server+"/api/standard/base/?key="+key);
	    }
        return result;
	};

	getInteriorImages(){
        var request = new XMLHttpRequest();

        request.withCredentials = true;
        
        request.open('GET',server+'/api/standard/interior', false);
		request.send(null); 

        var response = JSON.parse(request.response);

        if (request.status !== 200){
            alert("synchronous request failed\n Error: "+request.status);
            return [];
        }

        {/*
        this.setState({customImages: response.customImages});  
        */}

        var result = [];
        //error when no project of given id ->Cannot read property 'map' of undefined
	    if (response.success == true){
		    result = response.keys.map((key) => server+"/api/standard/interior/?key="+key);
	    }
        return result;
	};

    getCustomImages(){

        var proj = this.getProjects()[0];

        var request = new XMLHttpRequest();

        request.withCredentials = true;

        request.open("GET", server+"/api/projects/"+proj+"/customImages", false);
        request.send(null);

        var response = JSON.parse(request.response);

        if (request.status !== 200){
            alert("synchronous request failed\n Error: "+request.status);
            return [];
        }

        {/*
        this.setState({customImages: response.customImages});  
        */}

        var result = [];
        //error when no project of given id ->Cannot read property 'map' of undefined
	    if (response.success == true){
		    result = response.customImages.map((imageID) => server+"/api/projects/"+proj+"/customImages/"+imageID);
	    }
        
        
        return result;
    }
    getRenderedImages(){
        var proj = this.getProjects()[0];

        var request = new XMLHttpRequest();

        request.withCredentials = true;

        request.open("GET", server+"/api/projects/"+proj+"/renderedImages", false);
        request.send(null);

        var response = JSON.parse(request.response);

        if (request.status !== 200){
            alert("synchronous request failed\n Error: "+request.status);
            return [];
        }

        var result = [];
        //error when no project of given id ->Cannot read property 'map' of undefined
	    if (response.success == true){
		    result = response.renderedImages.map((imageID) => server+"/api/projects/"+proj+"/renderedImages/image/"+imageID);
	    }        
        
        return result;
    }

    getProjects(){

        var request = new XMLHttpRequest();

        request.withCredentials = true;

        request.open("GET", server+"/api/projects", false);
        request.send(null);

        var response = JSON.parse(request.response);

        if (request.status !== 200){
            alert("synchronous request failed\n Error: "+request.status);
            return [];
        }

        {/*
        this.setState({projects: response.projects});
        */}

        return response.projects;

    }

    mapToImage(imageURLs){

        return imageURLs.map((url) =>                              
                             <img src={url}  onClick={() => this.imageClick(url)} style={{height: 20, width: 20, padding: 10}} />);

    }
    mapToImageRendered(imageURLs){
        return imageURLs.map((url) => <img src={url}  onClick={() => this.renderedImageClick(url)} style={{height: 20, width: 20, padding: 10}} />);
    }

    render() {

        
        //const baseImages = this.mapToImage(this.getBaseImages());
        //const interiorImages = this.mapToImage(this.getInteriorImages());
        
        const imagesFn = ((im) => this.mapToImage(im)).bind(this);

        return (
		<div>
            <Tabs>
            	<TabList>
            		<Tab style={{color:'dimgrey', fontSize: 14}}>Base Images</Tab>
            		<Tab style={{color:'dimgrey', fontSize: 14}}>Interior Images</Tab>
                    <Tab style={{color:'dimgrey', fontSize: 14}}>Custom Images </Tab>
                    <Tab style={{color:'dimgrey', fontSize: 14}}>Push Pins </Tab>
                    <Tab style={{color:'dimgrey', fontSize: 14}}>Choose Pushpin Size</Tab>
            	</TabList>

            	<TabPanel>
            		<p>{this.state.baseImagesLibrary}</p>
            	</TabPanel>

            	<TabPanel>
            		<p>{this.state.interiorImagesLibrary}</p>
            	</TabPanel>

                <TabPanel>
                    <div className = "uploadForm">                

                        <Dropzone onDrop={this.onDrop} style={{height: 150, width: 976, backgroundColor: "#f2f2f2", marginTop: 0}}>
                             {this.state.customImagesLibrary}
                             <div style={{marginLeft : 5}}>
                                 <input id="imageForm" name="customImage" type="file" accept=".svg, .jpg, .png"/>            
                                 <button value="Upload" onClick={this.handleSubmit}>Upload</button>
                             </div>
                             <p>    Please drop files here or click to upload.</p>
                          </Dropzone>
                    </div>
                </TabPanel>
            
                <TabPanel>
                    <p>{this.state.renderedImagesLibrary}</p>
                </TabPanel>
                <TabPanel>
            		 <SizeSlider/>
            	</TabPanel>
            </Tabs>
            <Modal
                isOpen= {this.state.modalIsOpen}
                onAfterOpen = {this.afterOpenModal}
                onRequestClose = {this.closeModal}
                style = {customStyles}
                contentLabel = "Confirm Modal"
            >
            <div style = {{padding:'2px 16px', 'backgroundColor':'#13496e',color: 'white'}}>
                        <p>Do you want to Download or Load Project into Canvas</p>            
            </div>
            <div style = {{padding:'2px 16px'}}>
                        <p>Loading will remove current objects</p>
                        <button onClick={this.closeModal}>Cancel</button>
                        <button onClick={this.addJson}>Load into Canvas</button>
                        <button>Download</button>
            </div>
            </Modal>
		</div>
        );
    }
}

ImageLibrary.propTypes = {
    imageClicked: PropTypes.func.isRequired,
    renderedImageClicked: PropTypes.func.isRequired
}

ImageLibrary.defaultProps = {
    imageClicked: (image, id) => console.log(image+" was clicked\n"),
    renderedImageClicked: (image) =>console.log(image+" was clicked\n"),    
}

function mapDispatchToProps(dispatch) {
    return ({
        imageClicked: (url, id) => {dispatch(selectImage(url, id))},
        renderedImageClicked: (url) => {dispatch(selectRendered(url))}
    })
}

const mapStateToProps = (state) => {
	return {
        new_imageKey: state.canvas.new_imageKey        
	}
}


const LibraryContainer = connect(mapStateToProps, mapDispatchToProps)(ImageLibrary);

export default LibraryContainer;