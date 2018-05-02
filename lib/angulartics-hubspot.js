(function (angular) {
  'use strict';

  /**
   * @ngdoc overview
   * @name angulartics-hubspot
   * Enables analytics support for Hubspot (http://www.hubspot.com)
   */
  angular.module('angulartics.hubspot', ['angulartics'])
    .config(['$analyticsProvider', function ($analyticsProvider) {
      
      // Don't send the first page, hubspot does it
      $analyticsProvider.settings.pageTracking.autoTrackFirstPage = false;
    
      angulartics.waitForVendorApi('_hsq', 500, function () {

        /**
         * Track a page view
         */
        $analyticsProvider.registerPageTrack(function (path) {
          if (window._hsq) {
            setTimeout(function(){
                _hsq.push(['setPath', path]);
                _hsq.push(['trackPageView']);
            }, 1000);
          }
        });

        /**
        * Track and event in Hubspot
        * @name trackEvent
        * 
        * @param {string} action
        * @param {object} properties
        *
        * @link http://developers.hubspot.com/docs/methods/enterprise_events/javascript_api
        */
        $analyticsProvider.registerEventTrack(function (action, properties) {
          if(properties.value) {
            var parsed = parseInt(properties.value, 10);
            properties.value = isNaN(parsed) ? 0 : parsed;
          }

          if (window._hsq) {
            _hsq.push();
            _hsq.push(["trackEvent", 
              {
                id : action,
                value: properties.value
              }]);

          }
        });
        
        /**
        * Add user identify to Hubspot tracking calls
        * @name identify
        *
        * @param {object} properties 
        *
        * @link http://developers.hubspot.com/docs/methods/enterprise_events/javascript_api
        */

        $analyticsProvider.registerSetUserProperties(function (properties) {
          if (window._hsq) {
            var hubspotProperties = angular.copy(properties);

            // Transform Mixpanel properties
            hubspotProperties.id= properties.$distinct_id;
            hubspotProperties.email= properties.$email;
            hubspotProperties.firstName= properties.$first_name;
            hubspotProperties.lastName= properties.$last_name;
            hubspotProperties.fullName= properties.$name;
            hubspotProperties.created= properties.$created;

            delete hubspotProperties.$distinct_id
            delete hubspotProperties.$email;
            delete hubspotProperties.$first_name
            delete hubspotProperties.$last_name; 
            delete hubspotProperties.$name
            delete hubspotProperties.$created;
              
            _hsq.push(["identify", hubspotProperties]);
          }
        });

      });

    }]);
})(angular);