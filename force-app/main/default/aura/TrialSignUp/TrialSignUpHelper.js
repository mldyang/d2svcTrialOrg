/*
 * Copyright (c) 2017, Salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

({
  callApex: function(cmp, name, params, callback, background) {
    if (typeof params === 'function') {
      background = callback;
      callback = params;
      params = {};
    }

    var action = cmp.get(name);

    action.setParams(params);
    action.setCallback(this, function(res) {

      var state = res.getState();
      if (cmp.isValid() && state === 'SUCCESS') {
        callback(res);
      }
    });
    $A.enqueueAction(action);
  },

  checkForExistingCreds: function(cmp, helper) {
    cmp.set('v.authInProgress', true);
    var action = cmp.get('c.verifyExistingDeskCredentials');
    action.setParams({
      endpoint: this.validateEndpoint(cmp)
    });
    action.setCallback(this, function(res) {
      var state = res.getState();
      if (state === 'SUCCESS') {
        if (res.getReturnValue()) {
          this.createDeskConfigRecord(cmp, true);
        } else if (!res.getReturnValue()) {
          this.configureRemoteSite(cmp);
          this.createDeskConfigRecord(cmp);
          //this.updateDMEndpoint(cmp);
        }
      } else if (state === 'ERROR') {
        var errors = res.getError();
        if (errors) {
          if (errors[0] && errors[0].message) {
            console.error("Error message: " +
              errors[0].message);
          }
        }
        helper.error('Unknown Error', 'An error happened we did not account for. Try again or contact support.');
        console.error(res, res.getError());
      }
    });
    $A.enqueueAction(action);
  },

  updateDMEndpoint: function(cmp) {
    var action = cmp.get('c.updateDeskMigrationEndpoint');
    action.setParams({
      migId: cmp.get('v.deskMigration').Id,
      endpoint: this.validateEndpoint(cmp)
    });
    $A.enqueueAction(action);
  },

  configureRemoteSite: function(cmp) {
    cmp.set('v.authInProgress', true);
    var cMap = cmp.get('v.credsMap');
    cMap['endpoint'] = this.validateEndpoint(cmp);

    var action = cmp.get('c.createRemoteSite');
    action.setParams({
      credsMap: cMap
    });
    action.setCallback(this, function(res) {
      var state = res.getState();
      if (state === 'SUCCESS') {
        console.log('Success');
      } else if (state === 'ERROR') {
        console.log(res.getError());
        //this.error('Error', 'Unable to connect to Desk.com');
        cmp.set('v.authInProgress', false);
      }
    });
    $A.enqueueAction(action);
  },

  createDeskConfigRecord: function(cmp, credsValid) {
    var action = cmp.get('c.createCustomMetadataRecord');
    action.setParams({
      endpoint: this.validateEndpoint(cmp)
    });
    action.setCallback(this, function(res) {
      var state = res.getState();
      if (state === 'SUCCESS' && credsValid) {
        cmp.set('v.authInProgress', false);
        //cmp.set('v.hasNext', true);
        //this.goToStepId(2, cmp);
      } else if (state === 'SUCCESS') {
        setTimeout($A.getCallback(() => this.callAuthorize(cmp)), 1500);
      } else if (state === 'ERROR') {
        this.error('Error', 'Unable to connect to Desk.com');
      }
    });
    $A.enqueueAction(action);
  },
    
    callAuthroizeWrapper: function(cmp){
        setTimeout($A.getCallback(() => this.callAuthorize(cmp)), 1500);
    },

  callAuthorize: function(cmp) {
    var oauthPopup = window.open(
      //'/apex/DeskAuth?endpoint='+this.validateEndpoint(cmp),
      '/dbps/DeskAuth?endpoint='+this.validateEndpoint(cmp),
      'Authorize Desk',
      'location=no, menubar=no, toolbar=no, scrollbars=no, status=no, copyhistory=no,resizeable=no, top=250, left=500, width=500, height=500'
    );
    if (oauthPopup == null) {
      //this.info('Redirect', 'You are being redirected to Desk');
      var urlEvent = $A.get('e.force:navigateToURL');
      urlEvent.setParams({
        //url: '/apex/DeskAuth?endpoint='+this.validateEndpoint(cmp)
        url: '/dbps/DeskAuth?endpoint='+this.validateEndpoint(cmp)
      });
      urlEvent.fire();
    }
    this.authorizationPolling(cmp, this);
  },

  authorizationPolling: function(cmp, helper) {
    var endpoint = this.validateEndpoint(cmp);
    cmp.set('v.authorized', false);
    var interval = window.setInterval(
      $A.getCallback(function() {
        var action = cmp.get('c.checkDeskConfigAuthorization');
        action.setParams({
          endpoint: endpoint
        });
        action.setCallback(this, function(res) {
          var state = res.getState();
          if (state === 'SUCCESS') {
            cmp.set('v.authorized', res.getReturnValue());
            if (cmp.get('v.authorized')) {
              clearInterval(interval);
              cmp.set('v.authInProgress', false);
              //cmp.set('v.hasNext', true);
              //helper.goToStepId(2, cmp);
            }
          } else if (state === 'ERROR') {
            clearInterval(interval);
            var errors = res.getError();
            if (errors) {
              if (errors[0] && errors[0].message) {
                console.error("Error message: " +
                  errors[0].message);
              }
            }
            helper.error('Unknown Error', 'An error happened we did not account for. Try again or contact support.');
            console.error(res, res.getError());
          }
        });
        $A.enqueueAction(action);
      }), 1000
    );
  },

  validateEndpoint: function(cmp) {
    var desksite = cmp.find('endpoint').get('v.value');
    return desksite.includes('https') ? desksite : 'https://' + desksite;
  }
})