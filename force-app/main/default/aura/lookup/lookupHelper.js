/*
 * Copyright (c) 2017, Salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

({

  computeLabel: function(cmp) {
    var value    = cmp.get('v.value')
      , labelVar = cmp.get('v.labelVar')

    if (value && labelVar && value.hasOwnProperty(labelVar)) return value[labelVar];
    return '';
  },

  reset: function(cmp) {
    if (cmp.get('v.openOnFocus') && cmp.get('v.options').length > 0) {
      cmp.set('v.privateShowMenu', true);
      cmp.set('v.privateOptions', cmp.get('v.options'));
    } else {
      cmp.set('v.privateShowMenu', false);
      cmp.set('v.privateOptions', []);
    }
  },

  setIcon: function(cmp) {
    var value = cmp.get('v.value');
    var iconVar = cmp.get('v.iconVar');
    var icon = cmp.get('v.iconName');

    if (value && iconVar && value[iconVar]) icon = value[iconVar];

    cmp.set('v.privateIconName', icon);
  },

  changeFocus: function(cmp, focus) {
    cmp.set('v.privateHasFocus', typeof focus != 'undefined' ? focus : !cmp.get('v.privateHasFocus'));
    cmp.set('v.privateOptions',cmp.get('v.options'));
  },

  select: function(cmp, id) {
    var idVar = cmp.get('v.idVar'),
        option = cmp.get('v.options').find(function(el) { return el[cmp.get('v.idVar')] === id });
    cmp.set('v.value', option);
    this.changeFocus(cmp, false);
    this.triggerChangeEvent(cmp);
  },

  unselect: function(cmp) {
    cmp.set('v.oldValue', cmp.get('v.value'));
    cmp.set('v.value', null);
    setTimeout(function() {
      document.getElementById(cmp.getGlobalId() + '-combobox').focus();
    }, 1);
  },

  triggerChangeEvent: function(cmp) {
    cmp.getElement().dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        cancelable: true,
        composable: true,
        detail: {
          callbacks: {}
        }
      })
    );
  }

})