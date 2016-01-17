/*
 * Simple-todo controller file.
 */
Tasks = new Mongo.Collection("tasks");

// This code only runs on the client
if (Meteor.isServer) {
	Meteor.publish("tasks",function (){
		return Tasks.find();
	});
}


// This code only runs on the client
if (Meteor.isClient) {
	
	Meteor.subscribe("tasks");
 	
  	// Body Helpers -----------------------------
  	Template.body.helpers({
  	
    	tasks: function() {
    		if (Session.get("hideCompleted")){
    			if (Session.get("orderedByText")){
    				//Devuelve lista de tareas del owner filtradas por checked a true y
    				//ordenadas en orden inverso por fecha y despues en orden normal por text.
    				return Tasks.find({checked: {$ne : true}, owner: Meteor.userId()},{sort: {text : 1, createdAt : -1}});	
    			} else {
   	 				//Devuelve lista de tareas del owner ordenadas en orden inverso por fecha.
    				return Tasks.find({checked: {$ne : true},owner: Meteor.userId()},{sort: { createdAt : -1}});
    			}
    		} else {
    			if (Session.get("orderedByText")){
    				//Devuelve lista de tareas del owner ordenadas en orden inverso por fecha
    				//despues en orden normal por text.
    				return Tasks.find({owner: Meteor.userId()},{sort: {text : 1, createdAt : -1}});
    			} else {
    				//Devuelve lista de tareas del owner ordenadas en orden inverso por fecha.
    				return Tasks.find({owner: Meteor.userId()},{sort: {createdAt : -1}});
    			}
    		}
    	},
    
    
    	//Lee el estado de la variable global hideCompleted
    	hideCompleted : function () {
    		return Session.get("hideCompleted");
    	},
    
    	//Lee el estado de la variable global hideCompleted
    	orderedByText: function () {
    		return Session.get("orderedByText");
    	},
    
    	completedCount: function (){
    		return Tasks.find({checked: {$ne : true}}).count();
   		},
    
    	tasksCount: function () {
    		return Tasks.find({}).count();
    	}	
  	});
    
	// Body Events -----------------------------
  	Template.body.events({
  	
  		//Asocia el evento submit a todo elemento de la clase 'new-task'
  		//"submit .new-task" : function (event) {
  	
  		//Asocia el evento submit al elemento con id 'newTask-textEdit'
  		"submit #newTask-textEdit" : function (event) {	
  		
  			//To  prevent default browser from submit.
  			event.preventDefault();
  		
  			//Get value from text form. event.target es el elemento que ha lanzado el trigger
  			var text = event.target.text.value;
  		
  			//Insert the new task into db.
  			Meteor.call("addTask",text);
  		
  			//Clear form.
  			event.target.text.value = "";
  			},
  	
  		"change .completed input" : function (event){
  			Session.set ("hideCompleted", event.target.checked)
  		},
  	
  		"change .textOrdered input" : function (event){
  			Session.set ("orderedByText", event.target.checked)
  		}
  	});
  	
  	// Task Events -----------------------------
  	Template.task.events ({
  		"click .toggle-checked" : function(){
  			Meteor.call ("setChecked", this._id, ! this.checked);
  		},
  	
  		"click .toggle-important" : function(){
  			Meteor.call ("setImportant", this._id, ! this.important);
  		},
  			
  		"click .delete" : function (){
  			Meteor.call ("deleteTask",this._id);
  		}
  	});
  
  	Accounts.ui.config({
  		passwordSignupFields: "USERNAME_ONLY"
 	 });
  
  
  	// Global helpers -------------------------------------------
	Template.registerHelper("formatDate", function(date) {
		//Necesita cargar el paquete momentjs:
		// meteor add momentjs:moment
		//En html llamarlo así: {{formatDate createdAt}}
    	return moment(date).format('d-MM-YYYY')
  	});
} 
  
// Methods -------------------------------------
Meteor.methods({
  	
	addTask: function (text){
  		if (!Meteor.userId()){
  			throw new Meteor.Error ("not_authorized");
  		}
  		Tasks.insert({
  			text: text,
  			createdAt: new Date(),
  			owner: Meteor.userId(),
  			username : Meteor.user().username,
  			important : false
  		});
  	},
  	
  	deleteTask: function (taskId){
  		Tasks.remove (taskId);	
  	},
  	
  	setChecked: function (taskId, setChecked){
  		Tasks.update (taskId, {
  			$set: {checked: setChecked}
  		});	
  	},
  		
  	setImportant: function (taskId, setImportant){
  		
  		Tasks.update (taskId, {
  			$set: {important: setImportant}
  		});	
  	}
 });