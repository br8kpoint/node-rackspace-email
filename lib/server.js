var swiz = require('swiz');
var O = swiz.struct.Obj;
var F = swiz.struct.Field;
var xtend = require('xtend')
var request = require('request')
var crypto = require('crypto')
var moment = require('moment')


/**
 * Definition of rackspace mailbox retrieved from api
 *
 * Sample return xml:
 * <?xml version="1.0" encoding="utf-8"?>
<?xml version="1.0" encoding="utf-8"?>
<rsMailbox xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="urn:xml:rsMailbox">
  <name>apirsmailbox37</name>
  <size>10240</size>
  <currentUsage>1024</currentUsage>
  <vacationMessage>My Test Vacation Message</vacationMessage>
  <enableVacationMessage>true</enableVacationMessage>
  <emailForwardingAddressList>
    <emailAddress>notreal0@apidomain.net</emailAddress>
    <emailAddress>notreal1@apidomain.net</emailAddress>
  </emailForwardingAddressList>
  <saveForwardedEmail>false</saveForwardedEmail>
  <lastLogin>2/12/2009 1:00:00 AM</lastLogin>
  <createdDate>4/10/2006 7:47:34 PM</createdDate>
  <visibleInRackspaceEmailCompanyDirectory>false</visibleInRackspaceEmailCompanyDirectory>
  <visibleInExchangeGAL>false</visibleInExchangeGAL>
  <contactInfo>
    <lastName>Testlast</lastName>
    <firstName>Jayfirst</firstName>
    <generationQualifier>Jr</generationQualifier>
    <initials>A</initials>
    <organizationUnit>IT</organizationUnit>
    <businessStreet>123 Biz St</businessStreet>
    <businessCity>Blacksburg</businessCity>
    <businessState>VA</businessState>
    <businessPostalCode>24060</businessPostalCode>
    <businessCountry>USA</businessCountry>
    <homeStreet>456 Home St</homeStreet>
    <homeCity>Charlotte</homeCity>
    <homeState>NC</homeState>
    <homePostalCode>28210</homePostalCode>
    <homeCountry>USA</homeCountry>
    <businessNumber>555.123.0001</businessNumber>
    <homeNumber>555.123.0003</homeNumber>
    <mobileNumber>555.123.0004</mobileNumber>
    <faxNumber>555.123.0005</faxNumber>
    <homeFaxNumber>555.123.0006</homeFaxNumber>
    <pagerNumber>555.123.0002</pagerNumber>
    <notes>This is my note about my mailbox.</notes>
    <title>My Title</title>
    <userID>J.Test</userID>
    <organizationalStatus>OrgStatus</organizationalStatus>
    <employeeType>Full-Time</employeeType>
  </contactInfo>
  <enabled>true</enabled>
</rsMailbox>

 * @type {Array}
 */
var rackspace_mailbox_defs = [
	O('rsMailbox',{
		"fields":[
			F('name', {desc: 'name'}),
			F('size'),
			F('currentUsage'),
			F('vacationMessage'),
			F('enableVacationMessage'),
			F('emailForwardingAddressList', {'singular': 'emailAddress', 'coerceTo': 'array'}),
			F('saveForwardedEmail', {'coerceTo':'boolean'}),
			F('lastLogin'),
			F('createdDate'),
			F('visibleInRackspaceEmailCompanyDirectory'),
			F('visibleInExchangeGAL'),
			F('contactInfo')
		]
	}),

	O('')
]

/**
 * Create a client to access the rackspace email api
 * @param {object}   opts The configuration options.
 *
 * defaults:
 * @param {Function} cb   The call back to call once a connection is established
 */
function Server(opts, cb){
	var defaults = {
		user_key: null
		,secret_key: null
		,url: "https://api.emailsrvr.com/v0/"
		,user_agent: "NodeJS Rackspace Email"
    // set debug to true to enable logging.
    ,debug: false
		// must specify the account number and domain to access
		,domain: null
    , accountNumber: null
	}
	this.configuration = xtend({}, defaults, opts);
  var self = this;
	if(this.configuration.domain === null) throw new Error("Must specify domain")
  if(this.configuration.user_key === null) throw new Error("Must specify user_key")
  if(this.configuration.secret_key === null) throw new Error("Must specify secret_key")
  if(this.configuration.accountNumber == null) throw new Error("Must specify account number")
  var headers = {
    "X-Api-Signature": computeAPISignature(this),
    "User-Agent": this.configuration.user_agent,
    "Accept": 'application/json'
  }
  request.get({
    url: this.configuration.url + "customers/me", 
    headers:headers
  }, function(err, response, body){
    console.log(err, response, body)
    if(err) return cb(err, null)
    if(self.configuration.debug) console.log("body:", body)
    self.accountNumber = body.accountNumber;
    return cb(err, {status: response, body: body})
  })
}

Server.prototype.getSerializerType = function() {return 'Server';};

/**
 * Creates a mailbox
 * @param  {Mailbox}   mailbox The mailbox to create
 *
 * Rackspace request: post '/customers/12345678/domains/example.com/rs/mailboxes/alex.smith', 'text/xml',
{ 
  'password' : 'Secret13!@#',
  'size' : '2048',
  'enableVacationMessage' : 'true',
  'vacationMessage' : 'My Vacation Message',
  'emailForwardingAddresses' : 'sampletest@example.com,sampletest2@example.com',
  'saveForwardedEmail' : 'false'
  'lastName' : 'Testlastname',
  'firstName':'Jay',
  'generationQualifier':'III',
  'initials':'A',
  'organizationUnit':'IT',
  'businessStreet':'123 Biz St.',
  'businessCity':'Blacksburg',
  'businessState':'VA',
  'businessPostalCode':'24060',
  'businessCountry':'USA',
  'homeStreet':'456 Home St.',
  'homeCity':'Charlotte',
  'homeState':'NC',
  'homePostalCode':'28210',
  'homeCountry':'USA',
  'notes':'This is my note about my mailbox.',
  'title':'My Title',
  'userID':'J.Test',
  'organizationalStatus':'OrgStatus',
  'employeeType':'Full-Time'
  'visibleInExchangeGAL':'true', 
  'visibleInRackspaceEmailCompanyDirectory' : 'false'
  
} 
 * @param  {Function} cb      The callback once the operation is complete
 */
Server.prototype.createMailbox = function(mailbox, cb) {
	var headers = {
		"X-Api-Signature": computeAPISignature(this),
		"User-Agent": this.configuration.user_agent,
		"Accept": 'application/json'
	}
  if(this.configuration.debug){
    console.log("mailbox:", mailbox)
    console.log("headers:", headers)
  } 
  request.post({
    uri: this.configuration.url + "customers/" + this.configuration.accountNumber + "/domains/" + this.configuration.domain + "/rs/mailboxes",
    headers: headers,
    json: mailbox
  }, function(err, result, body){
    cb(err, {status: result, body: body})
  })
}


Server.prototype.getMailbox=function(mailbox, cb){
  var headers = {
    "X-Api-Signature": computeAPISignature(this),
    "User-Agent": this.configuration.user_agent,
    "Accept": 'application/json'
  }
  request.get({
    uri: this.configuration.url + "customers/" + this.configuration.accountNumber + "/domains/" + this.configuration.domain + "/rs/mailboxes",
    headers: headers,
    qs: mailbox
  }, function(err, result, body){
    cb(err, {status: result, body: body})
  })
}
function computeAPISignature(server){
  console.log("settings:", server)
	var sha1 = crypto.createHash('sha1');
	var timestamp = moment().format("YYYYMMDDHHmmss");
	sha1.update(server.configuration.user_key + server.configuration.user_agent + timestamp + server.configuration.secret_key )
	return server.configuration.user_key + ":" + timestamp + ":" +  sha1.digest('base64')
}

module.exports.Server = Server