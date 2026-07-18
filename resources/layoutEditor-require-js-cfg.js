/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2002 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/


/**
 * RequireJS configuration file for sparkl
 */

(function() {

  if(!requireCfg.map) requireCfg.map = {};
  if(!requireCfg.map['*']) requireCfg.map['*'] = {};
  

  var requirePaths = requireCfg.paths,
    requireShims = requireCfg.shim,
    requireConfig = requireCfg.config;

  if(!requireConfig['amd']) {
    requireConfig['amd'] = {};
  }
  if(!requireConfig['amd']['shim']) {
    requireConfig['amd']['shim'] = {};
  }
  var amdShim = requireConfig['amd']['shim'];


  var prefix;
  if(typeof KARMA_RUN !== "undefined") { // unit tests
    prefix = requirePaths['layoutEditor/components'] = 'resources/amd-components';

  } else if(typeof CONTEXT_PATH !== "undefined") { // production
    prefix = requirePaths['layoutEditor/components']  = CONTEXT_PATH + 'api/repos/layoutEditor/resources/amd-components';

  } else if(typeof FULL_QUALIFIED_URL != "undefined") { // embedded production
    prefix = requirePaths['layoutEditor/components']  = FULL_QUALIFIED_URL + 'api/repos/layoutEditor/resources/amd-componentss';

  } else { // build
    prefix = requirePaths['layoutEditor/components'] = '../resources/amd-components';
  }

  requirePaths['layoutEditor/components/LayoutEditorComponent'] = prefix + '/LayoutEditor/LayoutEditorComponent';

  amdShim['layoutEditor/components/LayoutEditor/resources/libs/js/jqueryFileTree'] = {
    exports: 'jQuery',
    deps: {
      'cdf/lib/jquery': 'jQuery',
      'css!layoutEditor/components/LayoutEditor/resources/libs/css/jqueryFileTree.css': ''
    }
  };

})();
