/*
 * Copyright (c) 2017, Salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

({

  init: function(cmp, evt, helper) {
    cmp.set('v.privateValueLabel', helper.computeLabel(cmp));
    cmp.set('v.privateHasNoValueBody', !!cmp.get('v.noValueBody').length);
    helper.reset(cmp);
    helper.setIcon(cmp);
  },

  onValueChange: function(cmp, evt, helper) {
    cmp.set('v.privateValueLabel', helper.computeLabel(cmp));
    helper.setIcon(cmp);
  },

  onOptionsChange: function(cmp, evt, helper) {
    helper.reset(cmp);
  },

  onFocus: function(cmp, evt, helper) {
    helper.changeFocus(cmp, true);
  },

  onBlur: function(cmp, evt, helper) {
    helper.changeFocus(cmp, false);
  },

  onChangeFocus: function(cmp, evt, helper) {
    if (cmp.get('v.required') && !cmp.get('v.value')) {
      $A.util.addClass(cmp, 'slds-has-error');
    } else {
      $A.util.removeClass(cmp, 'slds-has-error');
    }
  },

  onIconChange: function(cmp, evt, helper) {
    helper.setIcon(cmp);
  },

  onKeyDown: function(cmp, evt, helper) {
    var code = evt.keyCode;
    var shown = cmp.get('v.privateShowMenu');
    var idx = cmp.get('v.privateFocusedItem');
    var options = cmp.get('v.privateOptions');
    var idVar = cmp.get('v.idVar');

    if (!shown) return;

    switch (code) {
      case 27: // esc out of the menu
        cmp.set('v.privateShowMenu', false);
      case 13: // select current item
        helper.select(cmp, options[idx].id);
      case 38: // go up or down
      case 40:
        evt.preventDefault();
        evt.stopPropagation();

        if (code === 38 && idx > 0) idx--;
        else if (code === 40 && idx < (options.length - 1)) idx++;
        else if (idx > (options.length - 1)) idx = 0;

        cmp.set('v.privateFocusedItem', idx);
    }
  },

  onKeyUp: function(cmp, evt, helper) {
    var value = evt.target.value;

    var options = cmp.get('v.options').filter(function(el) {
      return (el[cmp.get('v.labelVar')] || '').toLowerCase().includes((value || '').toLowerCase());
    });

    cmp.set('v.privateOptions', options);
    cmp.set('v.privateShowMenu', options.length !== 0);
  },

  onMouseEnter: function(cmp, evt, helper) {
    var idx = parseInt(evt.target.id.replace(cmp.getGlobalId() + '-listbox-option-', ''));
    if (idx !== cmp.get('v.privateFocusedItem')) {
      cmp.set('v.privateFocusedItem', idx);
    }
  },

  select: function(cmp, evt, helper) {
    if (evt && evt.preventDefault) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    helper.select(cmp, cmp.get('v.privateOptions')[cmp.get('v.privateFocusedItem')][cmp.get('v.idVar')]);
  },

  unselect: function(cmp, evt, helper) {
    helper.unselect(cmp);
  },

  unselectAnywhere: function(cmp, evt, helper) {
    if (cmp.get('v.clickToRemove') && cmp.get('v.clickToRemove') != 'false') helper.unselect(cmp);
  }
})