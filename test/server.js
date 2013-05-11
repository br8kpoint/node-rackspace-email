var assert = require ('assert')
var Server = require('../lib/server').Server

var API_USER_KEY = "" 	// enter your user_key here
var API_SECRET_KEY = "" // enter your secret key here
var DOMAIN = ""			// enter the domain you want to test
var ACCOUNT_NUM = ""	// your rackspace account number with emails and apps


describe('Server', function(){
	it('should fail if no domain', function(done){
		try{
			var server = new Server();	
		}
		catch(ex){
			done();
		}
	});
	it('should create a mailbox when a valid mailbox is given', function(done){
		var server = new Server({
			user_key: API_USER_KEY,
			secret_key: API_SECRET_KEY,
			domain: DOMAIN,
			accountNumber: ACCOUNT_NUM,
			debug: true
		}, function(err, result){
			var mailbox = {
				'password' : 'Secret13!@#',
				  'size' : '2048',
				  'enableVacationMessage' : 'true',
				  'vacationMessage' : 'My Vacation Message',
				  'emailForwardingAddresses' : 'sampletest@example.com,sampletest2@example.com',
				  'saveForwardedEmail' : 'false',
				  'lastName' : 'Testlastname',
				  'firstName' :  'Jay',
				  'generationQualifier' :  'III',
				  'initials' :  'A',
				  'organizationUnit' :  'IT',
				  'businessStreet' :  '123 Biz St.',
				  'businessCity' :  'Blacksburg',
				  'businessState' :  'VA',
				  'businessPostalCode' :  '24060',
				  'businessCountry' :  'USA',
				  'homeStreet' :  '456 Home St.',
				  'homeCity' :  'Charlotte',
				  'homeState' :  'NC',
				  'homePostalCode' :  '28210',
				  'homeCountry' :  'USA',
				  'notes' :  'This is my note about my mailbox.',
				  'title' :  'My Title',
				  'userID' :  'J.Test',
				  'organizationalStatus' :  'OrgStatus',
				  'employeeType' :  'Full-Time',
				  'visibleInExchangeGAL':'true', 
				  'visibleInRackspaceEmailCompanyDirectory' : 'false'
				}
			server.createMailbox(mailbox, function(err, response){
				console.log(err, response)
				server.getMailbox(mailbox.userID, function(err, retrieved){
					console.log(err, retreived)
					assert.equal(retrieved.userID, mailbox.userID)
					done();
				})
			})	
		})
		
	})
	it('should not create a mailbox when an invalid mailbox is given')
	it('should get a mailbox')
	it('should update a mailbox')
})